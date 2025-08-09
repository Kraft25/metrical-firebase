"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Ruler, Ungroup, PlusCircle, Trash2, Building, AreaChart, Sprout, Layers } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';

const wallComponentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.'),
  length: z.coerce.number().positive("La longueur doit être positive."),
  height: z.coerce.number().positive("La hauteur doit être positive."),
});

const formSchema = z.object({
  mortarDosage: z.enum(["250", "300", "350"]),
  jointThickness: z.coerce.number().positive("L'épaisseur est requise."),
  components: z.array(wallComponentSchema)
});

type FormValues = z.infer<typeof formSchema>;

const mortarDosages = {
    "250": { name: "Mortier bâtard (250 kg/m³)", cement: 250, sand: 1.05 },
    "300": { name: "Mortier standard (300 kg/m³)", cement: 300, sand: 1.0 },
    "350": { name: "Mortier riche (350 kg/m³)", cement: 350, sand: 0.95 },
};

type CalculationResult = {
    blocksNeeded: number;
    totalSurface: number;
    mortar: {
        volume: number;
        cementBags: number;
        sandM3: number;
    }
} | null;

const MemoizedSubTotal = ({ control, index }: { control: any, index: number }) => {
  const data = useWatch({ control, name: `components.${index}` });

  const subtotal = useMemo(() => {
    const { length = 0, height = 0 } = data;
    return length * height;
  }, [data]);

  return (
    <div className="flex flex-col space-y-2 h-full justify-between">
      <FormLabel className="text-muted-foreground">Surface</FormLabel>
      <div className="flex items-center justify-end sm:justify-start font-bold text-lg h-11 px-3 rounded-md border bg-card text-foreground">
        {subtotal.toFixed(2)} m²
      </div>
    </div>
  );
};


export function BlockCalculatorForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            mortarDosage: "300",
            jointThickness: 0.015, // 1.5 cm
            components: [
                { name: "Mur Principal", length: 10, height: 2.5 },
                { name: "Façade", length: 8, height: 2.5 },
            ]
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'components',
    });

    const [calculationResult, setCalculationResult] = useState<CalculationResult>(null);

    const watchedForm = useWatch({ control: form.control });

    useEffect(() => {
        const calculate = (values: FormValues) => {
            if (!values.components || !values.mortarDosage || !values.jointThickness) {
                setCalculationResult(null);
                return;
            }

            const totalSurface = values.components.reduce((acc, comp) => {
                return acc + (comp.length * comp.height);
            }, 0);
            
            const blocksNeeded = Math.ceil(totalSurface * 12.5);

            // Mortar Calculation
            const mortarDosageInfo = mortarDosages[values.mortarDosage as keyof typeof mortarDosages];
            const MORTAR_VOLUME_PER_M2 = 0.01; // Estimation pour parpaings de 20 avec joint de 1.5cm
            const mortarVolume = totalSurface * MORTAR_VOLUME_PER_M2 * (values.jointThickness / 0.015);
            const cementKg = mortarVolume * mortarDosageInfo.cement;
            const cementBags = Math.ceil(cementKg / 50);
            const sandM3 = mortarVolume * mortarDosageInfo.sand;

            setCalculationResult({ 
                blocksNeeded, 
                totalSurface,
                mortar: {
                    volume: mortarVolume,
                    cementBags,
                    sandM3
                }
            });
        }
        calculate(watchedForm as FormValues);
    }, [watchedForm]);


  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Paramètres du Mortier de Pose</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <FormField
                            control={form.control}
                            name="mortarDosage"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Dosage du mortier</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger className="text-base h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {Object.entries(mortarDosages).map(([key, value]) => (
                                        <SelectItem key={key} value={key} className="text-base">{value.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="jointThickness"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Épaisseur des joints (m)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                                    <Input {...field} type="number" step="0.001" placeholder="0.015" className="pl-10 text-base h-11"/>
                                    </div>
                                </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    {calculationResult && (
                    <CardFooter className="bg-muted/30 border-t p-4 flex-col items-start gap-2">
                         <h4 className="font-semibold text-lg">Mortier de pose :</h4>
                         <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"/><path d="M12 22c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Z"/></svg>
                                <p><span className="font-bold text-lg text-foreground">{calculationResult.mortar.cementBags}</span> sacs de ciment (50kg)</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Sprout className="h-5 w-5 text-primary" />
                                <p><span className="font-bold text-lg text-foreground">{calculationResult.mortar.sandM3.toFixed(2)}</span> m³ de sable</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground pt-2">Note: Prévoyez une marge de 5-10% pour les pertes.</p>
                    </CardFooter>
                    )}
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Composants du Mur</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {fields.map((field, index) => (
                        <div key={field.id} className="bg-secondary/30 p-4 rounded-lg border space-y-4">
                            <FormField
                                control={form.control}
                                name={`components.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Nom du composant</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                                        <Input {...field} placeholder="Ex: Mur Est" className="pl-10 text-base h-11"/>
                                        </div>
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                <FormField
                                    control={form.control}
                                    name={`components.${index}.length`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Longueur (m)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                                            <Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-10 text-base h-11"/>
                                            </div>
                                        </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`components.${index}.height`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Hauteur (m)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transform rotate-90"/>
                                            <Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-10 text-base h-11"/>
                                            </div>
                                        </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <Separator className="my-4"/>
                             <div className="grid grid-cols-2 gap-4 items-center">
                                <MemoizedSubTotal control={form.control} index={index} />
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="w-full sm:w-auto sm:justify-self-end h-11">
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto h-11"
                            onClick={() => append({ name: '', length: 0, height: 0 })}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter un composant
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
                <Card className="shadow-lg sticky top-8">
                    <CardHeader>
                        <CardTitle>Référence de Calcul</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Basé sur une référence de 12.5 parpaings par m² (pour des parpaings de 20x40 cm avec joint).</p>
                    </CardContent>
                </Card>
                 {calculationResult && (
                    <Card className="bg-accent/10 border-accent shadow-xl sticky top-48">
                    <CardHeader>
                        <CardTitle className="text-accent-foreground text-2xl">
                        Résultat du Calcul
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <AreaChart className="h-10 w-10 text-primary" />
                            <div>
                                <p className="text-4xl font-bold text-foreground">
                                {calculationResult.totalSurface.toFixed(2)} m²
                                </p>
                                <p className="text-muted-foreground mt-1">Surface totale du mur</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 pt-4">
                            <Ungroup className="h-10 w-10 text-primary" />
                            <div>
                                <p className="text-4xl font-bold text-foreground">
                                {calculationResult.blocksNeeded}
                                </p>
                                <p className="text-muted-foreground mt-1">Parpaings nécessaires</p>
                            </div>
                        </div>
                    </CardContent>
                    </Card>
                )}
            </div>
        </div>
      </form>
    </Form>
  );
}
