"use client";

import { useState, useEffect } from 'react';
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
import { PlusCircle, Trash2, Ruler, Hash, Building, Droplets, Sprout, Triangle, BrickWall, Trash } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Separator } from './ui/separator';

const componentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.'),
  length: z.coerce.number().min(0, 'Positif requis.'),
  width: z.coerce.number().min(0, 'Positif requis.'),
  height: z.coerce.number().min(0, 'Positif requis.'),
  quantity: z.coerce.number().int().min(1, 'Minimum 1.'),
});

const ouvrageSchema = z.object({
    dosage: z.coerce.number().positive("Le dosage est requis."),
    components: z.array(componentSchema)
});

const formSchema = z.object({
  ouvrages: z.array(ouvrageSchema),
});

type FormValues = z.infer<typeof formSchema>;
type OuvrageValues = z.infer<typeof ouvrageSchema>;
type ComponentValues = z.infer<typeof componentSchema>;

const concreteDosages = {
    "150": { name: "Béton de propreté (150 kg/m³)", cement: 150, sand: 0.4, gravel: 0.8, water: 75 },
    "250": { name: "Fondations / Semelles (250 kg/m³)", cement: 250, sand: 0.5, gravel: 0.9, water: 125 },
    "300": { name: "Dallage / Chaussées (300 kg/m³)", cement: 300, sand: 0.4, gravel: 0.7, water: 150 },
    "350": { name: "Poteaux / Poutres / Chaînages (350 kg/m³)", cement: 350, sand: 0.4, gravel: 0.6, water: 175 },
    "400": { name: "Béton de haute résistance (400 kg/m³)", cement: 400, sand: 0.35, gravel: 0.55, water: 200 },
};

type CalculationResult = {
    totalVolume: number;
    totalMaterials: {
        cement: number;
        sand: number;
        gravel: number;
        water: number;
    };
    byDosage: {
        dosage: string;
        volume: number;
        materials: {
            cement: number;
            sand: number;
            gravel: number;
            water: number;
        };
    }[];
} | null;


const MemoizedSubTotal = ({ control, ouvrageIndex, componentIndex }: { control: any, ouvrageIndex: number, componentIndex: number }) => {
  const data = useWatch({ control, name: `ouvrages.${ouvrageIndex}.components.${componentIndex}` });

  const subtotal = (data.length || 0) * (data.width || 0) * (data.height || 0) * (data.quantity || 1);

  return (
    <div className="flex flex-col space-y-2 h-full justify-between">
      <FormLabel className="hidden sm:inline-block">Sous-Total</FormLabel>
      <div className="flex items-center justify-end sm:justify-center font-bold text-lg h-10 px-3 rounded-md border bg-card text-foreground">
        {subtotal.toFixed(3)} m³
      </div>
    </div>
  );
};

export function CalculatorForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ouvrages: [
        {
          dosage: 350,
          components: [
            { name: 'Poteaux', length: 0.3, width: 0.3, height: 3, quantity: 4 },
            { name: 'Poutres', length: 5, width: 0.2, height: 0.3, quantity: 2 },
          ]
        },
        {
          dosage: 300,
          components: [
            { name: 'Dallage', length: 10, width: 8, height: 0.12, quantity: 1 },
          ]
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ouvrages',
  });
  
  const [calculationResult, setCalculationResult] = useState<CalculationResult>(null);

  const calculateTotals = (values: FormValues) => {
    let totalVolume = 0;
    const byDosage: CalculationResult['byDosage'] = [];

    values.ouvrages.forEach(ouvrage => {
        const dosageInfo = concreteDosages[ouvrage.dosage as keyof typeof concreteDosages];
        if (!dosageInfo) return;

        const ouvrageVolume = ouvrage.components.reduce((acc, comp) => {
            return acc + (comp.length * comp.width * comp.height * comp.quantity);
        }, 0);

        totalVolume += ouvrageVolume;

        const cementBags = Math.ceil((ouvrageVolume * dosageInfo.cement) / 50);
        const totalSandM3 = ouvrageVolume * dosageInfo.sand;
        const totalGravelM3 = ouvrageVolume * dosageInfo.gravel;
        const totalWaterLiters = ouvrageVolume * dosageInfo.water;

        byDosage.push({
            dosage: String(ouvrage.dosage),
            volume: ouvrageVolume,
            materials: {
                cement: cementBags,
                sand: totalSandM3,
                gravel: totalGravelM3,
                water: totalWaterLiters,
            },
        });
    });

    const totalMaterials = byDosage.reduce((acc, current) => {
        acc.cement += current.materials.cement;
        acc.sand += current.materials.sand;
        acc.gravel += current.materials.gravel;
        acc.water += current.materials.water;
        return acc;
    }, { cement: 0, sand: 0, gravel: 0, water: 0 });

    setCalculationResult({
        totalVolume,
        totalMaterials,
        byDosage,
    });
  }

  const onSubmit = (values: FormValues) => {
    calculateTotals(values);
  };
  
  useEffect(() => {
    const subscription = form.watch(() => {
        onSubmit(form.getValues());
    });
    // Initial calculation
    onSubmit(form.getValues());
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                 {fields.map((ouvrageField, ouvrageIndex) => {
                    const { fields: componentFields, append: appendComponent, remove: removeComponent } = useFieldArray({
                        control: form.control,
                        name: `ouvrages.${ouvrageIndex}.components`,
                    });
                    
                    const watchedOuvrage = useWatch({ control: form.control, name: `ouvrages.${ouvrageIndex}` });
                    const dosageInfo = concreteDosages[watchedOuvrage.dosage as keyof typeof concreteDosages];
                    const dosageName = dosageInfo ? dosageInfo.name : "Dosage non sélectionné";

                    return (
                        <Card key={ouvrageField.id} className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Parc d'ouvrages: {dosageName}</CardTitle>
                                    <CardDescription>Composants pour ce type de dosage.</CardDescription>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(ouvrageIndex)}>
                                    <Trash2 className="h-5 w-5"/>
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name={`ouvrages.${ouvrageIndex}.dosage`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Type d'ouvrage (Dosage)</FormLabel>
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

                                <div className="hidden sm:grid sm:grid-cols-12 gap-4 text-sm font-medium text-muted-foreground px-4 pt-4 border-t">
                                    <div className="sm:col-span-3"><FormLabel>Nom</FormLabel></div>
                                    <div className="sm:col-span-2"><FormLabel>Long. (m)</FormLabel></div>
                                    <div className="sm:col-span-2"><FormLabel>Larg. (m)</FormLabel></div>
                                    <div className="sm:col-span-2"><FormLabel>Haut. (m)</FormLabel></div>
                                    <div className="sm:col-span-1"><FormLabel>Qté</FormLabel></div>
                                </div>

                                {componentFields.map((componentField, componentIndex) => (
                                <div key={componentField.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start bg-secondary/30 p-4 rounded-lg border">
                                    <FormField control={form.control} name={`ouvrages.${ouvrageIndex}.components.${componentIndex}.name`} render={({ field }) => ( <FormItem className="sm:col-span-3"> <FormLabel className="sm:hidden">Nom</FormLabel> <FormControl><div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input {...field} placeholder="Ex: Fondation" className="pl-9"/></div></FormControl> </FormItem> )}/>
                                    <FormField control={form.control} name={`ouvrages.${ouvrageIndex}.components.${componentIndex}.length`} render={({ field }) => ( <FormItem className="sm:col-span-2"> <FormLabel className="sm:hidden">Long. (m)</FormLabel> <FormControl><div className="relative"><Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-9"/></div></FormControl> </FormItem> )}/>
                                    <FormField control={form.control} name={`ouvrages.${ouvrageIndex}.components.${componentIndex}.width`} render={({ field }) => ( <FormItem className="sm:col-span-2"> <FormLabel className="sm:hidden">Larg. (m)</FormLabel> <FormControl><div className="relative"><Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transform rotate-90"/><Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-9"/></div></FormControl> </FormItem> )}/>
                                    <FormField control={form.control} name={`ouvrages.${ouvrageIndex}.components.${componentIndex}.height`} render={({ field }) => ( <FormItem className="sm:col-span-2"> <FormLabel className="sm:hidden">Haut. (m)</FormLabel> <FormControl><div className="relative"><Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transform -rotate-90"/><Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-9"/></div></FormControl> </FormItem> )}/>
                                    <FormField control={form.control} name={`ouvrages.${ouvrageIndex}.components.${componentIndex}.quantity`} render={({ field }) => ( <FormItem className="sm:col-span-1"> <FormLabel className="sm:hidden">Qté</FormLabel> <FormControl><div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input {...field} type="number" step="1" placeholder="1" className="pl-9"/></div></FormControl> </FormItem> )}/>
                                    
                                    <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-1 gap-2">
                                        <div className="sm:hidden col-span-1"> <MemoizedSubTotal control={form.control} ouvrageIndex={ouvrageIndex} componentIndex={componentIndex} /> </div>
                                        <div className="flex flex-col space-y-2 h-full justify-between"> <FormLabel className="text-destructive hidden sm:inline-block">Action</FormLabel> <Button type="button" variant="destructive" onClick={() => removeComponent(componentIndex)} className="w-full"> <Trash2 className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Supprimer</span> </Button> </div>
                                    </div>
                                    <div className="hidden sm:block sm:col-span-2 sm:col-start-11"> <MemoizedSubTotal control={form.control} ouvrageIndex={ouvrageIndex} componentIndex={componentIndex} /> </div>
                                </div>
                                ))}

                            </CardContent>
                             <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                <Button type="button" variant="outline" onClick={() => appendComponent({ name: '', length: 0, width: 0, height: 0, quantity: 1 })}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Ajouter un composant
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                 })}
                 <Button type="button" variant="secondary" className="w-full" onClick={() => append({ dosage: 350, components: [{ name: 'Nouveau composant', length: 1, width: 1, height: 1, quantity: 1 }]})}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter un nouveau parc d'ouvrages
                 </Button>
            </div>

            <div className="lg:col-span-1 space-y-6">
                 {calculationResult && (
                    <Card className="bg-accent/10 border-accent shadow-xl sticky top-8">
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
                                <h4 className="font-semibold text-lg">Total des matériaux :</h4>
                                <div className="flex items-center gap-3"> <BrickWall className="h-5 w-5 text-primary" /> <p><span className="font-bold text-xl text-foreground">{calculationResult.totalMaterials.cement}</span> sacs de ciment (50kg)</p> </div>
                                <div className="flex items-center gap-3"> <Sprout className="h-5 w-5 text-primary" /> <p><span className="font-bold text-xl text-foreground">{calculationResult.totalMaterials.sand.toFixed(2)}</span> m³ de sable</p> </div>
                                <div className="flex items-center gap-3"> <Triangle className="h-5 w-5 text-primary" /> <p><span className="font-bold text-xl text-foreground">{calculationResult.totalMaterials.gravel.toFixed(2)}</span> m³ de gravier</p> </div>
                                <div className="flex items-center gap-3"> <Droplets className="h-5 w-5 text-primary" /> <p><span className="font-bold text-xl text-foreground">{calculationResult.totalMaterials.water.toFixed(0)}</span> litres d'eau</p> </div>
                            </div>
                            
                            <Accordion type="single" collapsible className="w-full pt-4">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Détails par dosage</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4">
                                            {calculationResult.byDosage.map((dosageResult, index) => (
                                                <div key={index}>
                                                     <p className="font-bold">{concreteDosages[dosageResult.dosage as keyof typeof concreteDosages].name}</p>
                                                     <p className="text-sm text-muted-foreground">Volume: {dosageResult.volume.toFixed(2)} m³</p>
                                                     <ul className="text-sm list-disc pl-5 mt-1">
                                                        <li>Ciment: {dosageResult.materials.cement} sacs</li>
                                                        <li>Sable: {dosageResult.materials.sand.toFixed(2)} m³</li>
                                                        <li>Gravier: {dosageResult.materials.gravel.toFixed(2)} m³</li>
                                                        <li>Eau: {dosageResult.materials.water.toFixed(0)} L</li>
                                                     </ul>
                                                     {index < calculationResult.byDosage.length - 1 && <Separator className="mt-4"/>}
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                             <CardDescription className="pt-4 text-xs">
                                Note: Ce sont des estimations. Prévoyez une marge de 5-10% pour les pertes.
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
