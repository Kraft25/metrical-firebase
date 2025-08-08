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
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Ruler, PlusCircle, Trash2, Building, AreaChart, Droplets } from 'lucide-react';

const surfaceComponentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.'),
  area: z.coerce.number().positive("La surface doit être positive."),
});

const formSchema = z.object({
  consumption: z.coerce.number().positive("La consommation est requise."),
  layers: z.coerce.number().int().min(1, "Minimum 1 couche."),
  components: z.array(surfaceComponentSchema)
});

type FormValues = z.infer<typeof formSchema>;

type CalculationResult = {
    totalSurface: number;
    totalProduct: number;
} | null;

export function WaterproofingCalculatorForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            consumption: 1.5, // kg/m²/couche
            layers: 2,
            components: [
                { name: "Fondations", area: 50 },
                { name: "Murs enterrés", area: 30 },
            ]
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'components',
    });
    
    const watchedForm = useWatch({ control: form.control });
    const [calculationResult, setCalculationResult] = useState<CalculationResult>(null);

    const calculateTotals = (values: FormValues) => {
        if (!values.components || !values.consumption || !values.layers) {
            setCalculationResult(null);
            return;
        }

        const totalSurface = values.components.reduce((acc, comp) => {
            return acc + comp.area;
        }, 0);
        
        const totalProduct = totalSurface * values.consumption * values.layers;

        setCalculationResult({
            totalSurface,
            totalProduct,
        });
    };

    useEffect(() => {
        calculateTotals(watchedForm as FormValues);
    }, [watchedForm]);


  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Paramètres d'Étanchéité</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <FormField
                            control={form.control}
                            name="consumption"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Consommation (kg/m²)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                                    <Input {...field} type="number" step="0.1" placeholder="1.5" className="pl-10 text-base h-11"/>
                                    </div>
                                </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="layers"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nombre de couches</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                                    <Input {...field} type="number" step="1" placeholder="2" className="pl-10 text-base h-11"/>
                                    </div>
                                </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                     <CardFooter>
                        <CardDescription className="text-xs">
                           Note: La consommation est indicative. Référez-vous à la fiche technique de votre produit.
                        </CardDescription>
                    </CardFooter>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Surfaces à Traiter</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {fields.map((field, index) => (
                        <div key={field.id} className="bg-secondary/30 p-4 rounded-lg border grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                            <FormField
                                control={form.control}
                                name={`components.${index}.name`}
                                render={({ field }) => ( <FormItem> <FormLabel>Nom du composant</FormLabel> <FormControl><div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/><Input {...field} placeholder="Ex: Mur Est" className="pl-10 text-base h-11"/></div></FormControl> </FormItem> )}
                            />
                             <FormField
                                control={form.control}
                                name={`components.${index}.area`}
                                render={({ field }) => ( <FormItem> <FormLabel>Surface (m²)</FormLabel> <FormControl><div className="relative"><AreaChart className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/><Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-10 text-base h-11"/></div></FormControl> </FormItem> )}
                            />
                            <div className="col-span-1 sm:col-span-2 flex justify-end">
                                <Button type="button" variant="destructive" onClick={() => remove(index)} className="w-full sm:w-auto h-11">
                                    <Trash2 className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Supprimer</span>
                                </Button>
                            </div>
                        </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11"
                            onClick={() => append({ name: '', area: 0 })}
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
                                <p className="text-muted-foreground mt-1">Surface totale à traiter</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4 pt-4">
                            <Droplets className="h-10 w-10 text-primary" />
                            <div>
                                <p className="text-4xl font-bold text-foreground">
                                {calculationResult.totalProduct.toFixed(2)} kg
                                </p>
                                <p className="text-muted-foreground mt-1">Produit d'étanchéité</p>
                            </div>
                        </div>
                         <CardDescription className="pt-4 text-xs">
                            Note: Prévoyez une marge de 10% pour les pertes.
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
