"use client";

import { useMemo } from 'react';
import { useForm, useFieldArray, useWatch, Control } from 'react-hook-form';
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Ruler, PlusCircle, Trash2, Building, AreaChart, Layers, Sprout } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';

const wallComponentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.'),
  length: z.coerce.number().positive("La longueur doit être positive."),
  height: z.coerce.number().positive("La hauteur doit être positive."),
});

const formSchema = z.object({
  thickness: z.coerce.number().positive("L'épaisseur est requise."),
  dosage: z.enum(["250", "300", "350", "400", "500"]),
  components: z.array(wallComponentSchema)
});

type FormValues = z.infer<typeof formSchema>;

const plasterDosages = {
    "250": { name: "Enduit courant (250 kg/m³)", cement: 250, sand: 1.05 },
    "300": { name: "Enduit standard (300 kg/m³)", cement: 300, sand: 1.0 },
    "350": { name: "Enduit riche (350 kg/m³)", cement: 350, sand: 0.95 },
    "400": { name: "Gobetis (400 kg/m³)", cement: 400, sand: 0.9 },
    "500": { name: "Enduit de finition (500 kg/m³)", cement: 500, sand: 0.85 },
};

type CalculationResult = {
    totalSurface: number;
    totalVolume: number;
    materials: {
        cementKg: number;
        cementBags: number;
        sandM3: number;
    };
} | null;

const MemoizedSubTotal = ({ control, index }: { control: Control<FormValues>, index: number }) => {
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


export function PlasterCalculatorForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            thickness: 0.015,
            dosage: "300",
            components: [
                { name: "Mur Salon", length: 12, height: 2.5 },
                { name: "Mur Chambre", length: 8, height: 2.5 },
            ]
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'components',
    });
    
    const watchedForm = useWatch({ control: form.control });

    const calculationResult = useMemo(() => {
        const values = watchedForm as FormValues;
        if (!values.components || !values.dosage || !values.thickness) {
            return null;
        }

        const dosageInfo = plasterDosages[values.dosage as keyof typeof plasterDosages];
        if (!dosageInfo) return null;

        const totalSurface = values.components.reduce((acc, comp) => {
            return acc + (comp.length * comp.height);
        }, 0);

        if (totalSurface === 0) return null;
        
        const totalVolume = totalSurface * values.thickness;
        const cementKg = totalVolume * dosageInfo.cement;
        const cementBags = Math.ceil(cementKg / 50);
        const sandM3 = totalVolume * dosageInfo.sand;

        return {
            totalSurface,
            totalVolume,
            materials: {
                cementKg,
                cementBags,
                sandM3,
            }
        };
    }, [watchedForm]);


  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Paramètres de l'Enduit</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <FormField
                            control={form.control}
                            name="dosage"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Type d'enduit (Dosage)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger className="text-base h-11">
                                        <SelectValue placeholder="Sélectionnez un dosage" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {Object.entries(plasterDosages).map(([key, value]) => (
                                        <SelectItem key={key} value={key} className="text-base">{value.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="thickness"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Épaisseur (m)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                                    <Input {...field} type="number" step="0.001" placeholder="0.000" className="pl-10 text-base h-11"/>
                                    </div>
                                </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Surfaces à Enduire</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {fields.map((field, index) => (
                        <div key={field.id} className="bg-secondary/30 p-4 rounded-lg border space-y-4">
                           <div className="flex justify-between items-center gap-4">
                             <FormField
                                control={form.control}
                                name={`components.${index}.name`}
                                render={({ field }) => ( <FormItem className="w-full"> <FormLabel>Nom du composant</FormLabel> <FormControl><div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/><Input {...field} placeholder="Ex: Mur Est" className="pl-10 text-base h-11"/></div></FormControl> </FormItem> )}
                            />
                             <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-8 text-destructive">
                                <Trash2 className="h-5 w-5" />
                            </Button>
                           </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                                <FormField
                                    control={form.control}
                                    name={`components.${index}.length`}
                                    render={({ field }) => ( <FormItem> <FormLabel>Longueur (m)</FormLabel> <FormControl><div className="relative"><Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/><Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-10 text-base h-11"/></div></FormControl> </FormItem> )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`components.${index}.height`}
                                    render={({ field }) => ( <FormItem> <FormLabel>Hauteur (m)</FormLabel> <FormControl><div className="relative"><Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transform rotate-90"/><Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-10 text-base h-11"/></div></FormControl> </FormItem> )}
                                />
                                <MemoizedSubTotal control={form.control} index={index} />
                            </div>
                        </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full h-12 text-base"
                            onClick={() => append({ name: '', length: 0, height: 0 })}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter une surface
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
                 {calculationResult && (
                    <Card className="bg-accent/10 border-accent shadow-xl sticky top-8">
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
                                <p className="text-muted-foreground mt-1">Surface totale à enduire</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4 pt-4">
                            <Layers className="h-10 w-10 text-primary" />
                            <div>
                                <p className="text-4xl font-bold text-foreground">
                                {calculationResult.totalVolume.toFixed(3)} m³
                                </p>
                                <p className="text-muted-foreground mt-1">Volume total d'enduit</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                            <h4 className="font-semibold text-lg">Total des matériaux :</h4>
                            <div className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-archive"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>
                                <p><span className="font-bold text-xl text-foreground">{calculationResult.materials.cementBags}</span> sacs de ciment (50kg)</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Sprout className="h-5 w-5 text-primary" />
                                <p><span className="font-bold text-xl text-foreground">{calculationResult.materials.sandM3.toFixed(2)}</span> m³ de sable</p>
                            </div>
                        </div>

                         <CardDescription className="pt-4 text-xs">
                            Note: Prévoyez une marge de 10-15% pour les pertes. Les dosages sont indicatifs.
                        </CardDescription>
                    </CardContent>
                    </Card>
                )}
            </div>
        </div>
      </form>
    </Form>
  );
}
