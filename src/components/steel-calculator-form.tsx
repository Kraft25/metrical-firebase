"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Ruler, PlusCircle, Trash2, Building, Hash, GitCommitHorizontal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';

const steelDiameters: { [key: string]: { weightPerMeter: number } } = {
    '6': { weightPerMeter: 0.222 },
    '8': { weightPerMeter: 0.395 },
    '10': { weightPerMeter: 0.617 },
    '12': { weightPerMeter: 0.888 },
    '14': { weightPerMeter: 1.21 },
    '16': { weightPerMeter: 1.58 },
};

const ouvrageSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.'),
  type: z.enum(['poutre', 'poteau', 'semelle']),
  length: z.coerce.number().positive("La longueur est requise."),
  width: z.coerce.number().positive("La largeur est requise."),
  height: z.coerce.number().positive("La hauteur est requise."),
  quantity: z.coerce.number().int().min(1),
  longitudinalBars: z.object({
    diameter: z.string().nonempty("Diamètre requis."),
    count: z.coerce.number().int().min(1),
  }),
  transversalBars: z.object({
    diameter: z.string().nonempty("Diamètre requis."),
    spacing: z.coerce.number().positive("Espacement requis."),
  }),
  coating: z.coerce.number().min(0).default(0.025), // Enrobage de 2.5cm par défaut
});

const formSchema = z.object({
  ouvrages: z.array(ouvrageSchema)
});

type FormValues = z.infer<typeof formSchema>;
type OuvrageResult = {
    longitudinalWeight: number;
    transversalWeight: number;
    totalWeight: number;
};
type CalculationResult = {
    totalWeight: number;
    weightByDiameter: { [key: string]: number };
    ouvrageResults: (OuvrageResult | null)[];
} | null;

const calculateSteel = (values: FormValues) => {
    let totalWeight = 0;
    const weightByDiameter: { [key: string]: number } = {};
    
    const ouvrageResults = values.ouvrages.map(ouvrage => {
        if (!steelDiameters[ouvrage.longitudinalBars.diameter] || !steelDiameters[ouvrage.transversalBars.diameter]) {
            return null;
        }

        // Calcul Aciers Longitudinaux
        const longiDiameter = ouvrage.longitudinalBars.diameter;
        const longiWeightPerMeter = steelDiameters[longiDiameter].weightPerMeter;
        const longiTotalLength = ouvrage.length * ouvrage.longitudinalBars.count * ouvrage.quantity;
        const longitudinalWeight = longiTotalLength * longiWeightPerMeter;

        if (!weightByDiameter[longiDiameter]) weightByDiameter[longiDiameter] = 0;
        weightByDiameter[longiDiameter] += longitudinalWeight;
        
        // Calcul Aciers Transversaux (Cadres/Étriers)
        const transDiameter = ouvrage.transversalBars.diameter;
        const transWeightPerMeter = steelDiameters[transDiameter].weightPerMeter;
        const stirrupPerimeter = 2 * ((ouvrage.width - 2 * ouvrage.coating) + (ouvrage.height - 2 * ouvrage.coating));
        const stirrupCount = Math.ceil(ouvrage.length / ouvrage.transversalBars.spacing);
        const transTotalLength = stirrupPerimeter * stirrupCount * ouvrage.quantity;
        const transversalWeight = transTotalLength * transWeightPerMeter;

        if (!weightByDiameter[transDiameter]) weightByDiameter[transDiameter] = 0;
        weightByDiameter[transDiameter] += transversalWeight;

        const totalOuvrageWeight = longitudinalWeight + transversalWeight;
        totalWeight += totalOuvrageWeight;
        
        return {
            longitudinalWeight,
            transversalWeight,
            totalWeight: totalOuvrageWeight
        };
    });

    return { totalWeight, weightByDiameter, ouvrageResults };
};


export function SteelCalculatorForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ouvrages: [
                { name: "Poutre Principale", type: 'poutre', length: 6, width: 0.25, height: 0.4, quantity: 1, longitudinalBars: { diameter: "12", count: 6 }, transversalBars: { diameter: "8", spacing: 0.20 }, coating: 0.025 },
                { name: "Poteaux P1", type: 'poteau', length: 3, width: 0.3, height: 0.3, quantity: 4, longitudinalBars: { diameter: "10", count: 4 }, transversalBars: { diameter: "6", spacing: 0.15 }, coating: 0.025 },
            ]
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'ouvrages',
    });
    
    const [calculationResult, setCalculationResult] = useState<CalculationResult>(null);

    const onSubmit = (values: FormValues) => {
        const result = calculateSteel(values);
        setCalculationResult(result);
    };

    useEffect(() => {
        onSubmit(form.getValues());
    }, []);

    const watchedForm = useWatch({ control: form.control });
    useEffect(() => {
        const result = calculateSteel(watchedForm as FormValues);
        setCalculationResult(result);
    }, [watchedForm]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        {fields.map((field, index) => (
                            <Card key={field.id} className="shadow-lg">
                                <CardHeader className="flex flex-row items-center justify-between bg-muted/30 border-b">
                                     <CardTitle>Ouvrage #{index + 1}</CardTitle>
                                     <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}>
                                        <Trash2 className="h-5 w-5"/>
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {/* Infos générales */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`ouvrages.${index}.name`} render={({ field }) => ( <FormItem> <FormLabel>Nom</FormLabel> <FormControl><div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/><Input {...field} placeholder="Ex: Poutre RDC" className="pl-10 text-base h-11"/></div></FormControl> </FormItem> )}/>
                                        <FormField control={form.control} name={`ouvrages.${index}.type`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger className="text-base h-11"><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="poutre">Poutre</SelectItem>
                                                        <SelectItem value="poteau">Poteau</SelectItem>
                                                        <SelectItem value="semelle">Semelle</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}/>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                                        <FormField control={form.control} name={`ouvrages.${index}.length`} render={({ field }) => ( <FormItem> <FormLabel>Long. (m)</FormLabel> <FormControl><Input {...field} type="number" step="0.01" className="h-11"/></FormControl> </FormItem> )}/>
                                        <FormField control={form.control} name={`ouvrages.${index}.width`} render={({ field }) => ( <FormItem> <FormLabel>Larg. (m)</FormLabel> <FormControl><Input {...field} type="number" step="0.01" className="h-11"/></FormControl> </FormItem> )}/>
                                        <FormField control={form.control} name={`ouvrages.${index}.height`} render={({ field }) => ( <FormItem> <FormLabel>Haut. (m)</FormLabel> <FormControl><Input {...field} type="number" step="0.01" className="h-11"/></FormControl> </FormItem> )}/>
                                        <FormField control={form.control} name={`ouvrages.${index}.quantity`} render={({ field }) => ( <FormItem> <FormLabel>Qté</FormLabel> <FormControl><Input {...field} type="number" step="1" className="h-11"/></FormControl> </FormItem> )}/>
                                    </div>

                                    <Separator/>
                                    
                                    {/* Aciers Longitudinaux */}
                                    <h4 className="font-semibold text-lg">Aciers Longitudinaux</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`ouvrages.${index}.longitudinalBars.diameter`} render={({ field }) => (
                                            <FormItem><FormLabel>Diamètre (mm)</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-11"><SelectValue/></SelectTrigger></FormControl><SelectContent>{Object.keys(steelDiameters).map(d => <SelectItem key={d} value={d}>HA {d}</SelectItem>)}</SelectContent></Select></FormItem>
                                        )}/>
                                        <FormField control={form.control} name={`ouvrages.${index}.longitudinalBars.count`} render={({ field }) => (
                                            <FormItem><FormLabel>Nombre de barres</FormLabel><FormControl><Input {...field} type="number" step="1" className="h-11"/></FormControl></FormItem>
                                        )}/>
                                    </div>

                                    {/* Aciers Transversaux */}
                                    <h4 className="font-semibold text-lg">Aciers Transversaux (Cadres)</h4>
                                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <FormField control={form.control} name={`ouvrages.${index}.transversalBars.diameter`} render={({ field }) => (
                                            <FormItem><FormLabel>Diamètre (mm)</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-11"><SelectValue/></SelectTrigger></FormControl><SelectContent>{Object.keys(steelDiameters).map(d => <SelectItem key={d} value={d}>HA {d}</SelectItem>)}</SelectContent></Select></FormItem>
                                        )}/>
                                        <FormField control={form.control} name={`ouvrages.${index}.transversalBars.spacing`} render={({ field }) => (
                                            <FormItem><FormLabel>Espacement (m)</FormLabel><FormControl><Input {...field} type="number" step="0.01" className="h-11"/></FormControl></FormItem>
                                        )}/>
                                         <FormField control={form.control} name={`ouvrages.${index}.coating`} render={({ field }) => (
                                            <FormItem><FormLabel>Enrobage (m)</FormLabel><FormControl><Input {...field} type="number" step="0.005" className="h-11"/></FormControl></FormItem>
                                        )}/>
                                    </div>
                                </CardContent>
                                {calculationResult?.ouvrageResults[index] &&
                                    <CardFooter className="bg-muted/30 border-t p-4 flex flex-col items-start gap-1">
                                        <p className="text-sm font-semibold">Poids total pour cet ouvrage: <span className="font-bold text-lg">{calculationResult.ouvrageResults[index]!.totalWeight.toFixed(2)} kg</span></p>
                                    </CardFooter>
                                }
                            </Card>
                        ))}
                         <Button type="button" variant="secondary" className="w-full h-12 text-base" onClick={() => append({ name: "Nouveau", type: 'poutre', length: 1, width: 0.2, height: 0.2, quantity: 1, longitudinalBars: { diameter: "10", count: 4 }, transversalBars: { diameter: "6", spacing: 0.25 }, coating: 0.025 })}>
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Ajouter un ouvrage
                         </Button>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        {calculationResult && (
                            <Card className="bg-accent/10 border-accent shadow-xl sticky top-8">
                                <CardHeader><CardTitle className="text-accent-foreground text-2xl">Récapitulatif Total</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <div>
                                        <p className="text-5xl font-bold text-foreground">{calculationResult.totalWeight.toFixed(2)} kg</p>
                                        <p className="text-muted-foreground mt-1">Poids total d'acier nécessaire</p>
                                    </div>
                                    <Separator/>
                                    <h4 className="font-semibold text-lg">Détail par diamètre :</h4>
                                    <div className="space-y-2">
                                        {Object.entries(calculationResult.weightByDiameter).sort(([a],[b]) => Number(a) - Number(b)).map(([diameter, weight]) => (
                                            <div key={diameter} className="flex items-center gap-3 justify-between">
                                                <div className="flex items-center gap-2">
                                                    <GitCommitHorizontal className="h-5 w-5 text-primary" />
                                                    <span>Acier HA {diameter}</span>
                                                </div>
                                                <span className="font-bold text-xl text-foreground">{weight.toFixed(2)} kg</span>
                                            </div>
                                        ))}
                                    </div>
                                    <CardDescription className="pt-4 text-xs">Note: Prévoyez une marge de 10% pour les chutes et recouvrements.</CardDescription>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </form>
        </Form>
    );
}
