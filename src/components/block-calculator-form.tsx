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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Ruler, Ungroup, PlusCircle, Trash2, Building, AreaChart } from 'lucide-react';

const wallComponentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.'),
  length: z.coerce.number().positive("La longueur doit être positive."),
  height: z.coerce.number().positive("La hauteur doit être positive."),
});

const formSchema = z.object({
  components: z.array(wallComponentSchema)
});

type FormValues = z.infer<typeof formSchema>;
type CalculationResult = {
    blocksNeeded: number;
    totalSurface: number;
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

    const onSubmit = (values: FormValues) => {
        const totalSurface = values.components.reduce((acc, comp) => {
            return acc + (comp.length * comp.height);
        }, 0);
        
        const blocksNeeded = Math.ceil(totalSurface * 12.5);

        setCalculationResult({ blocksNeeded, totalSurface });
    };

    useEffect(() => {
        // Initial calculation on mount
        onSubmit(form.getValues());
    }, []);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
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
                             <div className="grid grid-cols-2 gap-4 items-center">
                                <MemoizedSubTotal control={form.control} index={index} />
                                <Button type="button" variant="destructive" onClick={() => remove(index)} className="w-full sm:w-auto sm:justify-self-end h-11">
                                    <Trash2 className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Supprimer</span>
                                </Button>
                            </div>
                        </div>
                        ))}
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto h-11"
                            onClick={() => append({ name: '', length: 0, height: 0 })}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter un composant
                        </Button>
                         <Button type="submit" className="h-11">Effectuer le Calcul</Button>
                    </CardFooter>
                </Card>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
                <Card className="shadow-lg sticky top-8">
                    <CardHeader>
                        <CardTitle>Référence de Calcul</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Basé sur une référence de 12.5 parpaings par m² (pour des parpaings de 20x20x50 cm).</p>
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
                         <p className="text-xs text-muted-foreground pt-2">Note: Prévoyez une marge de 5-10% pour les pertes.</p>
                    </CardContent>
                    </Card>
                )}
            </div>
        </div>
      </form>
    </Form>
  );
}
