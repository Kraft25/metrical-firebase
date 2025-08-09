
"use client";

import { useMemo } from 'react';
import { useForm, useFieldArray, useWatch, Control, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { FormValues as BlockFormValues } from './block-calculator-form';

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
import { Ruler, PlusCircle, Trash2, Building, AreaChart, Layers, Sprout, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export const formSchema = z.object({
  thickness: z.coerce.number().positive("L'épaisseur est requise."),
  dosage: z.enum(["250", "300", "350", "400", "500"]),
});

export type FormValues = z.infer<typeof formSchema>;

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


interface PlasterCalculatorFormProps {
    form: UseFormReturn<FormValues>;
    blockFormValues: BlockFormValues;
}

export function PlasterCalculatorForm({ form, blockFormValues }: PlasterCalculatorFormProps) {
    const watchedForm = useWatch({ control: form.control });

    const totalSurfaceFromBlocks = useMemo(() => {
        return (blockFormValues.components || []).reduce((acc, comp) => {
            const length = Number(comp.length) || 0;
            const height = Number(comp.height) || 0;
            return acc + (length * height);
        }, 0);
    }, [blockFormValues.components]);


    const calculationResult = useMemo(() => {
        const values = watchedForm as FormValues;
        if (!values.dosage || !values.thickness) {
            return null;
        }

        const dosageInfo = plasterDosages[values.dosage as keyof typeof plasterDosages];
        if (!dosageInfo) return null;

        const totalSurface = totalSurfaceFromBlocks;

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
    }, [watchedForm, totalSurfaceFromBlocks]);


  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Paramètres de l'Enduit</CardTitle>
                        <CardDescription>
                            Le calcul se base sur la surface totale des murs définie dans l'onglet "Calcul Maçonnerie".
                        </CardDescription>
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

                 {totalSurfaceFromBlocks === 0 && (
                   <Card>
                        <CardHeader className="flex-row items-center gap-4">
                           <Info className="h-8 w-8 text-primary" />
                           <div>
                            <CardTitle>Aucune surface définie</CardTitle>
                            <CardDescription>
                                Veuillez d'abord ajouter des composants de mur dans l'onglet "Calcul Maçonnerie" pour calculer l'enduit nécessaire.
                            </CardDescription>
                           </div>
                        </CardHeader>
                   </Card>
                )}
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
