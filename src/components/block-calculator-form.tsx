
"use client";

import { useMemo } from 'react';
import { useForm, useFieldArray, useWatch, Control, UseFormReturn } from 'react-hook-form';
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
import { Ruler, Ungroup, PlusCircle, Trash2, Building, AreaChart, Sprout, Layers, Square, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const wallComponentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.'),
  length: z.coerce.number().positive("La longueur doit être positive."),
  height: z.coerce.number().positive("La hauteur doit être positive."),
});

export const formSchema = z.object({
  blockLength: z.coerce.number().positive("La longueur du bloc est requise."),
  blockHeight: z.coerce.number().positive("La hauteur du bloc est requise."),
  blockThickness: z.coerce.number().positive("L'épaisseur du bloc est requise."),
  mortarDosage: z.enum(["250", "300", "350"]),
  jointThickness: z.coerce.number().min(0, "L'épaisseur doit être positive ou nulle."),
  components: z.array(wallComponentSchema)
});

export type FormValues = z.infer<typeof formSchema>;

const mortarDosages = {
    "250": { name: "Mortier bâtard (250 kg/m³)", cement: 250, sand: 1.05 },
    "300": { name: "Mortier standard (300 kg/m³)", cement: 300, sand: 1.0 },
    "350": { name: "Mortier riche (300 kg/m³)", cement: 350, sand: 0.95 },
};

type CalculationResult = {
    blocksNeeded: number;
    totalSurface: number;
    blocksPerM2: number;
    mortar: {
        volume: number;
        cementBags: number;
        sandM3: number;
    }
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

interface BlockCalculatorFormProps {
    form: UseFormReturn<FormValues>;
}

export function BlockCalculatorForm({ form }: BlockCalculatorFormProps) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'components',
    });

    const watchedForm = useWatch({ control: form.control });

    const calculationResult = useMemo(() => {
        const values = watchedForm as FormValues;
        const { components, mortarDosage, jointThickness, blockLength, blockHeight, blockThickness } = values;

        if (!blockLength || !blockHeight || blockLength <= 0 || blockHeight <= 0) {
            return null;
        }

        const blocksPerM2 = 1 / ((blockLength + jointThickness) * (blockHeight + jointThickness));
        
        if (isNaN(blocksPerM2) || !isFinite(blocksPerM2)) {
            return null;
        }
        
        const totalSurface = (components || []).reduce((acc, comp) => {
            const length = Number(comp.length) || 0;
            const height = Number(comp.height) || 0;
            return acc + (length * height);
        }, 0);
        
        const blocksNeeded = Math.ceil(totalSurface * blocksPerM2);
        
        const mortarVolume = totalSurface * jointThickness;
        
        const mortarDosageInfo = mortarDosages[mortarDosage as keyof typeof mortarDosages];
        const cementKg = mortarVolume * mortarDosageInfo.cement;
        const cementBags = Math.ceil(cementKg / 50);
        const sandM3 = mortarVolume * mortarDosageInfo.sand;

        return { 
            blocksNeeded: isNaN(blocksNeeded) ? 0 : blocksNeeded, 
            totalSurface,
            blocksPerM2: blocksPerM2,
            mortar: {
                volume: mortarVolume > 0 ? mortarVolume : 0,
                cementBags: cementBags > 0 ? cementBags : 0,
                sandM3: sandM3 > 0 ? sandM3 : 0
            }
        };
    }, [watchedForm]);

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                 <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Paramètres de Maçonnerie</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                        <FormField
                            control={form.control}
                            name="blockLength"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Long. bloc (m)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                                    <Input {...field} type="number" step="0.01" placeholder="0.40" className="pl-10 text-base h-11"/>
                                    </div>
                                </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="blockHeight"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Haut. bloc (m)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transform rotate-90"/>
                                    <Input {...field} type="number" step="0.01" placeholder="0.20" className="pl-10 text-base h-11"/>
                                    </div>
                                </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="blockThickness"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Épais. bloc (m)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <Square className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                                    <Input {...field} type="number" step="0.01" placeholder="0.20" className="pl-10 text-base h-11"/>
                                    </div>
                                </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="jointThickness"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Ép. joints (m)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                                    <Input {...field} type="number" step="0.001" placeholder="0.015" className="pl-10 text-base h-11"/>
                                    </div>
                                </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="mortarDosage"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Dosage mortier</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                    <FormControl>
                                    <SelectTrigger className="text-base h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {Object.entries(mortarDosages).map(([key, value]) => (
                                        <SelectItem key={key} value={key} className="text-base">{value.name.split('(')[0]}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Composants du Mur</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {fields.map((field, index) => (
                        <div key={field.id} className="bg-secondary/30 p-4 rounded-lg border space-y-4">
                            <div className="flex justify-between items-center gap-2">
                                <FormField
                                    control={form.control}
                                    name={`components.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="w-full">
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
                                 <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-8 text-destructive">
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
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
                                <MemoizedSubTotal control={form.control} index={index} />
                            </div>
                        </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                         {fields.length === 0 ? (
                            <Button type="button" variant="secondary" className="w-full h-12 text-base" onClick={() => append({ name: 'Nouveau composant', length: 0, height: 0 })}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Ajouter un composant
                            </Button>
                        ) : (
                            <Button type="button" variant="secondary" className="w-full h-12 text-base" onClick={() => append({ name: 'Nouveau composant', length: 0, height: 0 })}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Ajouter un autre composant
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
                <Card className="shadow-lg sticky top-8">
                    <CardHeader>
                        <CardTitle>Aide au Calcul</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {calculationResult && calculationResult.blocksPerM2 > 0 ? (
                           <p className="text-sm text-muted-foreground">
                             Sur la base de vos dimensions, il faut environ <span className="font-bold text-foreground">{calculationResult.blocksPerM2.toFixed(1)}</span> bloc(s) par m².
                           </p>
                         ) : (
                            <p className="text-sm text-muted-foreground">
                                Entrez les dimensions des blocs pour voir les estimations.
                            </p>
                         )}
                    </CardContent>
                </Card>
                 {calculationResult && calculationResult.totalSurface > 0 && (
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
                                <p className="text-muted-foreground mt-1">Blocs nécessaires</p>
                            </div>
                        </div>
                        <div className="space-y-3 pt-4">
                            <h4 className="font-semibold text-lg">Mortier de pose :</h4>
                            <div className="flex items-center gap-3">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-archive"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>
                                <p><span className="font-bold text-lg text-foreground">{calculationResult.mortar.cementBags}</span> sacs de ciment (50kg)</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Sprout className="h-5 w-5 text-primary" />
                                <p><span className="font-bold text-lg text-foreground">{calculationResult.mortar.sandM3.toFixed(2)}</span> m³ de sable</p>
                            </div>
                            <p className="text-xs text-muted-foreground pt-2">Volume de mortier estimé: {calculationResult.mortar.volume.toFixed(3)} m³. Prévoyez une marge de 10%.</p>
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
