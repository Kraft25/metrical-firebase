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
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2, Ruler, Hash, Building, Droplets, Sprout, Triangle, BrickWall } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const componentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.'),
  length: z.coerce.number().min(0, 'Positif requis.'),
  width: z.coerce.number().min(0, 'Positif requis.'),
  height: z.coerce.number().min(0, 'Positif requis.'),
  quantity: z.coerce.number().int().min(1, 'Minimum 1.'),
});

const formSchema = z.object({
  components: z.array(componentSchema),
  dosage: z.coerce.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

const concreteDosages = {
    "150": { name: "Béton de propreté (150 kg/m³)", cement: 150, sand: 0.4, gravel: 0.8, water: 75 },
    "200": { name: "Béton de remplissage (200 kg/m³)", cement: 200, sand: 0.45, gravel: 0.85, water: 100 },
    "250": { name: "Fondations, chaussées (250 kg/m³)", cement: 250, sand: 0.5, gravel: 0.9, water: 125 },
    "300": { name: "Dallage, semelles (300 kg/m³)", cement: 300, sand: 0.4, gravel: 0.7, water: 150 },
    "350": { name: "Béton armé courant (350 kg/m³)", cement: 350, sand: 0.4, gravel: 0.6, water: 175 },
    "400": { name: "Haute résistance (400 kg/m³)", cement: 400, sand: 0.35, gravel: 0.55, water: 200 },
};

type CalculationResult = {
    totalVolume: number;
    materials: {
        cement: number;
        sand: number;
        gravel: number;
        water: number;
    };
} | null;


const MemoizedSubTotal = ({ control, index }: { control: any, index: number }) => {
  const data = useWatch({ control, name: `components.${index}` });

  const subtotal = useMemo(() => {
    const { length = 0, width = 0, height = 0, quantity = 0 } = data;
    return length * width * height * quantity;
  }, [data]);

  return (
    <div className="flex flex-col space-y-2 h-full justify-between">
      <FormLabel className="hidden sm:inline-block">Sous-Total</FormLabel>
      <div className="flex items-center justify-end sm:justify-center font-bold text-lg h-10 px-3 rounded-md border bg-card text-foreground">
        {subtotal.toFixed(2)} m³
      </div>
    </div>
  );
};

export function CalculatorForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      components: [
        { name: 'Poteaux', length: 0.3, width: 0.3, height: 3, quantity: 4 },
        { name: 'Poutres', length: 5, width: 0.2, height: 0.3, quantity: 2 },
        { name: 'Chainage', length: 20, width: 0.15, height: 0.2, quantity: 1 },
        { name: 'Raidisseur', length: 0.15, width: 0.15, height: 3, quantity: 8 },
      ],
      dosage: 350,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'components',
  });
  
  const [calculationResult, setCalculationResult] = useState<CalculationResult>(null);

  const calculateTotals = (values: FormValues) => {
    const totalVolume = values.components.reduce((acc, comp) => {
        const { length = 0, width = 0, height = 0, quantity = 0 } = comp;
        return acc + (length * width * height * quantity);
    }, 0);

    const dosageInfo = concreteDosages[values.dosage as keyof typeof concreteDosages];
    if (!dosageInfo) {
      setCalculationResult({
        totalVolume,
        materials: { cement: 0, sand: 0, gravel: 0, water: 0 },
      });
      return;
    }
    
    const totalCementKg = totalVolume * dosageInfo.cement;
    const cementBags = Math.ceil(totalCementKg / 35);
    const totalSandM3 = totalVolume * dosageInfo.sand;
    const totalGravelM3 = totalVolume * dosageInfo.gravel;
    const totalWaterLiters = totalVolume * dosageInfo.water;

    setCalculationResult({
        totalVolume,
        materials: {
            cement: cementBags,
            sand: totalSandM3,
            gravel: totalGravelM3,
            water: totalWaterLiters,
        },
    });
  }

  const onSubmit = (values: FormValues) => {
    calculateTotals(values);
  };

  const dosage = useWatch({ control: form.control, name: 'dosage' });

  useEffect(() => {
    calculateTotals(form.getValues());
  }, [dosage, form]);
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Composants de l'ouvrage</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="hidden sm:grid sm:grid-cols-12 gap-4 text-sm font-medium text-muted-foreground px-4">
                        <div className="sm:col-span-3"><FormLabel>Nom du composant</FormLabel></div>
                        <div className="sm:col-span-2"><FormLabel>Longueur (m)</FormLabel></div>
                        <div className="sm:col-span-2"><FormLabel>Largeur (m)</FormLabel></div>
                        <div className="sm:col-span-2"><FormLabel>Hauteur (m)</FormLabel></div>
                        <div className="sm:col-span-1"><FormLabel>Quantité</FormLabel></div>
                        </div>
                        {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start bg-secondary/30 p-4 rounded-lg border">
                            <FormField
                            control={form.control}
                            name={`components.${index}.name`}
                            render={({ field }) => (
                                <FormItem className="sm:col-span-3">
                                <FormLabel className="sm:hidden">Nom du composant</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                    <Input {...field} placeholder="Ex: Fondation" className="pl-9"/>
                                    </div>
                                </FormControl>
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name={`components.${index}.length`}
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                <FormLabel className="sm:hidden">Longueur (m)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                    <Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-9"/>
                                    </div>
                                </FormControl>
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name={`components.${index}.width`}
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                <FormLabel className="sm:hidden">Largeur (m)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transform rotate-90"/>
                                    <Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-9"/>
                                    </div>
                                </FormControl>
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name={`components.${index}.height`}
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                <FormLabel className="sm:hidden">Hauteur (m)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transform -rotate-90"/>
                                        <Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-9" />
                                    </div>
                                </FormControl>
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name={`components.${index}.quantity`}
                            render={({ field }) => (
                                <FormItem className="sm:col-span-1">
                                <FormLabel className="sm:hidden">Quantité</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                    <Input {...field} type="number" step="1" placeholder="1" className="pl-9"/>
                                    </div>
                                </FormControl>
                                </FormItem>
                            )}
                            />
                            <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-1 gap-2">
                                <div className="sm:hidden col-span-1">
                                    <MemoizedSubTotal control={form.control} index={index} />
                                </div>
                                <div className="flex flex-col space-y-2 h-full justify-between">
                                    <FormLabel className="text-destructive hidden sm:inline-block">Action</FormLabel>
                                    <Button type="button" variant="destructive" onClick={() => remove(index)} className="w-full">
                                        <Trash2 className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Supprimer</span>
                                    </Button>
                                </div>
                            </div>
                            <div className="hidden sm:block sm:col-span-2 sm:col-start-11">
                                <MemoizedSubTotal control={form.control} index={index} />
                            </div>
                        </div>
                        ))}
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({ name: '', length: 0, width: 0, height: 0, quantity: 1 })}
                        >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un composant
                        </Button>
                        <Button type="submit">Effectuer</Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Dosage du Béton</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <FormField
                            control={form.control}
                            name="dosage"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Type d'ouvrage</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} defaultValue={String(field.value)}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un dosage" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {Object.entries(concreteDosages).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>{value.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                </FormItem>
                            )}
                            />
                    </CardContent>
                 </Card>
                 {calculationResult && (
                    <Card className="bg-accent/10 border-accent shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-accent-foreground text-2xl">
                            Résultat Total
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-5xl font-bold text-foreground">
                                {calculationResult.totalVolume.toFixed(2)} m³
                                </p>
                                <p className="text-muted-foreground mt-1">Volume total de béton nécessaire</p>
                            </div>
                            <div className="space-y-3 pt-4">
                                <h4 className="font-semibold text-lg">Quantités de matériaux :</h4>
                                <div className="flex items-center gap-3">
                                    <BrickWall className="h-5 w-5 text-primary" />
                                    <p><span className="font-bold text-xl text-foreground">{calculationResult.materials.cement}</span> sacs de ciment (35kg)</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Sprout className="h-5 w-5 text-primary" />
                                    <p><span className="font-bold text-xl text-foreground">{calculationResult.materials.sand.toFixed(2)}</span> m³ de sable</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Triangle className="h-5 w-5 text-primary" />
                                    <p><span className="font-bold text-xl text-foreground">{calculationResult.materials.gravel.toFixed(2)}</span> m³ de gravier</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Droplets className="h-5 w-5 text-primary" />
                                    <p><span className="font-bold text-xl text-foreground">{calculationResult.materials.water.toFixed(0)}</span> litres d'eau</p>
                                </div>
                                <CardDescription className="pt-2 text-xs">
                                    Note: Ce sont des estimations. Prévoyez une marge de 5-10% pour les pertes.
                                </CardDescription>
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
