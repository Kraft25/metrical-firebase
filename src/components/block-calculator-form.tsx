"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Ruler, Ungroup } from 'lucide-react';

const formSchema = z.object({
  wallLength: z.coerce.number().positive("La longueur du mur doit être positive."),
  wallHeight: z.coerce.number().positive("La hauteur du mur doit être positive."),
});

type FormValues = z.infer<typeof formSchema>;
type CalculationResult = {
    blocksNeeded: number;
} | null;

export function BlockCalculatorForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            wallLength: 10,
            wallHeight: 2.5,
        },
    });

    const [calculationResult, setCalculationResult] = useState<CalculationResult>(null);

    const onSubmit = (values: FormValues) => {
        const { wallLength, wallHeight } = values;

        if (!wallLength || !wallHeight) {
            setCalculationResult({ blocksNeeded: 0 });
            return;
        }
        
        const wallSurface = wallLength * wallHeight;
        const blocksNeeded = Math.ceil(wallSurface * 12.5);

        setCalculationResult({ blocksNeeded });
    };

    useEffect(() => {
        // Initial calculation on mount
        onSubmit(form.getValues());
    }, []);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Calculateur de Parpaings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="font-semibold text-lg text-foreground">Dimensions du Mur</h3>
                <p className="text-sm text-muted-foreground">Basé sur une référence de 12.5 parpaings par m² et 20*20*40 cm.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="wallLength"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Longueur du mur (m)</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input type="number" step="0.01" placeholder="Ex: 10" {...field} className="pl-9"/>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="wallHeight"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Hauteur du mur (m)</FormLabel>
                        <FormControl>
                             <div className="relative">
                                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transform rotate-90"/>
                                <Input type="number" step="0.01" placeholder="Ex: 2.5" {...field} className="pl-9"/>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Effectuer</Button>
          </CardFooter>
        </Card>
        
        {calculationResult && (
            <div className="mt-8">
                <Card className="bg-accent/10 border-accent shadow-xl">
                <CardHeader>
                    <CardTitle className="text-accent-foreground text-2xl">
                    Résultat du Calcul
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <Ungroup className="h-12 w-12 text-primary" />
                        <div>
                            <p className="text-5xl font-bold text-foreground">
                            {calculationResult.blocksNeeded}
                            </p>
                            <p className="text-muted-foreground mt-1">Parpaings nécessaires (+5-10% de marge conseillée)</p>
                        </div>
                    </div>
                </CardContent>
                </Card>
            </div>
        )}
      </form>
    </Form>
  );
}
