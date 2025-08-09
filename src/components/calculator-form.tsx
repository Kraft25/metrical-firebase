"use client";

import { useState, useEffect, useMemo } from 'react';
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2, Ruler, Hash, Building, Droplets, Sprout, Triangle, Circle, Square } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Separator } from './ui/separator';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { cn } from '@/lib/utils';

const componentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.'),
  shape: z.enum(['rectangular', 'cylindrical']).default('rectangular'),
  length: z.coerce.number().min(0, 'Positif requis.').optional(),
  width: z.coerce.number().min(0, 'Positif requis.').optional(),
  diameter: z.coerce.number().min(0, 'Positif requis.').optional(),
  height: z.coerce.number().min(0, 'Positif requis.'),
  quantity: z.coerce.number().int().min(1, 'Minimum 1.'),
}).refine((data) => {
    if (data.shape === 'rectangular') {
        return data.length !== undefined && data.width !== undefined;
    }
    return true;
}, {
    message: "Longueur et largeur sont requises pour un rectangle.",
    path: ["length"]
}).refine((data) => {
    if (data.shape === 'cylindrical') {
        return data.diameter !== undefined;
    }
    return true;
}, {
    message: "Le diamètre est requis pour un cylindre.",
    path: ["diameter"]
});

const ouvrageSchema = z.object({
    dosage: z.coerce.number().positive("Le dosage est requis."),
    components: z.array(componentSchema)
});

const formSchema = z.object({
  ouvrages: z.array(ouvrageSchema),
});

type FormValues = z.infer<typeof formSchema>;

const concreteDosages = {
    "150": { name: "Béton de propreté (150 kg/m³)", cement: 150, sand: 0.4, gravel: 0.8, water: 75 },
    "200": { name: "Béton pour fondations légères (200 kg/m³)", cement: 200, sand: 0.45, gravel: 0.85, water: 100 },
    "250": { name: "Fondations / Semelles (250 kg/m³)", cement: 250, sand: 0.5, gravel: 0.9, water: 125 },
    "300": { name: "Dallage / Chaussées (300 kg/m³)", cement: 300, sand: 0.4, gravel: 0.7, water: 150 },
    "350": { name: "Poteaux / Poutres / Chaînages (350 kg/m³)", cement: 350, sand: 0.4, gravel: 0.6, water: 175 },
    "400": { name: "Béton de haute résistance (400 kg/m³)", cement: 400, sand: 0.35, gravel: 0.55, water: 200 },
};

type DosageResult = {
    dosage: string;
    volume: number;
    materials: {
        cement: number;
        sand: number;
        gravel: number;
        water: number;
    };
};

type CalculationResult = {
    totalVolume: number;
    totalMaterials: {
        cement: number;
        sand: number;
        gravel: number;
        water: number;
    };
    byDosage: DosageResult[];
} | null;

const calculateComponentVolume = (component: z.infer<typeof componentSchema> | undefined): number => {
    if (!component) return 0;
    const { shape, length = 0, width = 0, diameter = 0, height = 0, quantity = 1 } = component;
    
    if (shape === 'cylindrical') {
        const radius = diameter / 2;
        return (Math.PI * radius * radius * height) * quantity;
    }
    // Default to rectangular
    return (length * width * height) * quantity;
};

const MemoizedSubTotal = ({ control, ouvrageIndex, componentIndex }: { control: Control<FormValues>, ouvrageIndex: number, componentIndex: number }) => {
  const data = useWatch({ control, name: `ouvrages.${ouvrageIndex}.components.${componentIndex}` });

  const subtotal = useMemo(() => {
    return calculateComponentVolume(data);
  }, [data]);


  return (
    <div className="flex flex-col space-y-2 h-full justify-between">
      <FormLabel className="text-muted-foreground">Sous-Total</FormLabel>
      <div className="flex items-center justify-end sm:justify-start font-bold text-lg h-10 px-3 rounded-md border bg-card text-foreground">
        {subtotal.toFixed(3)} m³
      </div>
    </div>
  );
};

const OuvrageItem = ({ ouvrageIndex, control, removeOuvrage, dosageResult }: { ouvrageIndex: number, control: Control<FormValues>, removeOuvrage: (index: number) => void, dosageResult: DosageResult | undefined }) => {
    const { fields: componentFields, append: appendComponent, remove: removeComponent } = useFieldArray({
        control,
        name: `ouvrages.${ouvrageIndex}.components`,
    });
    
    const watchedOuvrage = useWatch({ control, name: `ouvrages.${ouvrageIndex}` });
    const dosageInfo = concreteDosages[watchedOuvrage.dosage as keyof typeof concreteDosages];
    const dosageName = dosageInfo ? dosageInfo.name : "Dosage non sélectionné";

    return (
        <AccordionItem value={`ouvrage-${ouvrageIndex}`} className="bg-card border shadow-lg rounded-lg overflow-hidden">
             <div className="flex items-center justify-between p-2 pr-4">
                <AccordionTrigger className="flex-1 p-2 sm:p-4 text-lg font-semibold hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                        <span className="bg-primary/10 text-primary font-bold size-10 flex items-center justify-center rounded-full">
                            #{ouvrageIndex + 1}
                        </span>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">{dosageName.split('(')[0].trim()}</h3>
                            <p className="text-sm font-normal text-muted-foreground">Dosage: {watchedOuvrage.dosage} kg/m³</p>
                        </div>
                    </div>
                </AccordionTrigger>
                <Button type="button" variant="ghost" size="icon" className="text-destructive rounded-full" onClick={() => removeOuvrage(ouvrageIndex)}>
                    <Trash2 className="h-5 w-5"/>
                </Button>
            </div>
            <AccordionContent>
                <div className="border-t">
                    <div className="space-y-6 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                             <FormField
                                control={control}
                                name={`ouvrages.${ouvrageIndex}.dosage`}
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                    <FormLabel>Type d'ouvrage (Dosage)</FormLabel>
                                    <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} defaultValue={String(field.value)}>
                                        <FormControl>
                                        <SelectTrigger className="text-base">
                                            <SelectValue placeholder="Sélectionnez un dosage" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {Object.entries(concreteDosages).map(([key, value]) => (
                                            <SelectItem key={key} value={key} className="text-base">{value.name}</SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {componentFields.map((componentField, componentIndex) => {
                          const watchedComponent = useWatch({ control, name: `ouvrages.${ouvrageIndex}.components.${componentIndex}`});
                          const shape = watchedComponent.shape || 'rectangular';

                          return (
                          <div key={componentField.id} className="bg-secondary/20 p-4 rounded-lg border space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={control} name={`ouvrages.${ouvrageIndex}.components.${componentIndex}.name`} render={({ field }) => ( <FormItem> <FormLabel>Nom du composant</FormLabel> <FormControl><div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/><Input {...field} placeholder="Ex: Fondation F1" className="pl-10 text-base h-11"/></div></FormControl> </FormItem> )}/>
                                <FormField
                                  control={control}
                                  name={`ouvrages.${ouvrageIndex}.components.${componentIndex}.shape`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Forme</FormLabel>
                                      <FormControl>
                                        <ToggleGroup type="single" value={field.value} onValueChange={field.onChange} className="w-full grid grid-cols-2 border p-1 rounded-md bg-background">
                                          <ToggleGroupItem value="rectangular" className="gap-2 h-9">
                                            <Square className="h-5 w-5"/> Rectangle
                                          </ToggleGroupItem>
                                          <ToggleGroupItem value="cylindrical" className="gap-2 h-9">
                                            <Circle className="h-5 w-5"/> Cylindre
                                          </ToggleGroupItem>
                                        </ToggleGroup>
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                                {shape === 'rectangular' ? (
                                  <>
                                    <FormField control={control} name={`ouvrages.${ouvrageIndex}.components.${componentIndex}.length`} render={({ field }) => ( <FormItem> <FormLabel>Long. (m)</FormLabel> <FormControl><div className="relative"><Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/><Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-10 text-base h-11"/></div></FormControl> </FormItem> )}/>
                                    <FormField control={control} name={`ouvrages.${ouvrageIndex}.components.${componentIndex}.width`} render={({ field }) => ( <FormItem> <FormLabel>Larg. (m)</FormLabel> <FormControl><div className="relative"><Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transform rotate-90"/><Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-10 text-base h-11"/></div></FormControl> </FormItem> )}/>
                                  </>
                                ) : (
                                  <FormField control={control} name={`ouvrages.${ouvrageIndex}.components.${componentIndex}.diameter`} render={({ field }) => ( <FormItem className="col-span-2"> <FormLabel>Diamètre (m)</FormLabel> <FormControl><div className="relative"><Circle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/><Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-10 text-base h-11"/></div></FormControl> </FormItem> )}/>
                                )}
                                <FormField control={control} name={`ouvrages.${ouvrageIndex}.components.${componentIndex}.height`} render={({ field }) => ( <FormItem> <FormLabel>Haut. (m)</FormLabel> <FormControl><div className="relative"><Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/><Input {...field} type="number" step="0.01" placeholder="0.00" className="pl-10 text-base h-11"/></div></FormControl> </FormItem> )}/>
                                <FormField control={control} name={`ouvrages.${ouvrageIndex}.components.${componentIndex}.quantity`} render={({ field }) => ( <FormItem> <FormLabel>Qté</FormLabel> <FormControl><div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/><Input {...field} type="number" step="1" placeholder="1" className="pl-10 text-base h-11"/></div></FormControl> </FormItem> )}/>
                            </div>
                            <Separator />
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                                <div className="sm:col-span-2">
                                     <MemoizedSubTotal control={control} ouvrageIndex={ouvrageIndex} componentIndex={componentIndex} />
                                </div>
                                <Button type="button" variant="destructive" size="sm" onClick={() => removeComponent(componentIndex)}>
                                    <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                                </Button>
                            </div>
                          </div>
                        )})}
                        <Button type="button" variant="secondary" className="w-full h-12 text-base" onClick={() => appendComponent({ name: 'Nouveau composant', shape: 'rectangular', length: 1, width: 1, height: 1, quantity: 1 })}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter un composant
                        </Button>

                    </div>
                    {dosageResult && (
                        <CardFooter className="bg-muted/30 border-t p-4 sm:p-6 flex-col items-start">
                            <h4 className="text-lg font-semibold mb-2">{dosageName}</h4>
                            <p className="text-sm text-muted-foreground mb-3">Volume: <span className="font-bold">{dosageResult.volume.toFixed(2)} m³</span></p>
                            <ul className="text-sm space-y-1 w-full">
                                <li className="flex justify-between"><span>Ciment (sacs de 50kg):</span> <span className="font-bold">{dosageResult.materials.cement}</span></li>
                                <li className="flex justify-between"><span>Sable:</span> <span className="font-bold">{dosageResult.materials.sand.toFixed(2)} m³</span></li>
                                <li className="flex justify-between"><span>Gravier:</span> <span className="font-bold">{dosageResult.materials.gravel.toFixed(2)} m³</span></li>
                                <li className="flex justify-between"><span>Eau:</span> <span className="font-bold">{dosageResult.materials.water.toFixed(0)} L</span></li>
                            </ul>
                        </CardFooter>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
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
            { name: 'Poteaux (cylindriques)', shape: 'cylindrical', diameter: 0.3, height: 3, quantity: 4 },
            { name: 'Poutres (rectangulaires)', shape: 'rectangular', length: 5, width: 0.2, height: 0.3, quantity: 2 },
          ]
        },
        {
          dosage: 300,
          components: [
            { name: 'Dallage', shape: 'rectangular', length: 10, width: 8, height: 0.12, quantity: 1 },
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
  
  const watchedForm = useWatch({ control: form.control });

  useEffect(() => {
    const calculateTotals = (values: FormValues) => {
        if (!values.ouvrages) {
            setCalculationResult(null);
            return;
        }
      let totalVolume = 0;
      const byDosage: CalculationResult['byDosage'] = [];

      values.ouvrages.forEach((ouvrage, index) => {
          const dosageInfo = concreteDosages[ouvrage.dosage as keyof typeof concreteDosages];
          if (!dosageInfo) return;

          const ouvrageVolume = ouvrage.components.reduce((acc, comp) => {
              return acc + calculateComponentVolume(comp);
          }, 0);

          totalVolume += ouvrageVolume;

          const cementBags = Math.ceil((ouvrageVolume * dosageInfo.cement) / 50);
          const totalSandM3 = ouvrageVolume * dosageInfo.sand;
          const totalGravelM3 = ouvrageVolume * dosageInfo.gravel;
          const totalWaterLiters = ouvrageVolume * dosageInfo.water;

          byDosage[index] = {
              dosage: String(ouvrage.dosage),
              volume: ouvrageVolume,
              materials: {
                  cement: cementBags,
                  sand: totalSandM3,
                  gravel: totalGravelM3,
                  water: totalWaterLiters,
              },
          };
      });

      const totalMaterials = byDosage.reduce((acc, current) => {
          if(current) {
            acc.cement += current.materials.cement;
            acc.sand += current.materials.sand;
            acc.gravel += current.materials.gravel;
            acc.water += current.materials.water;
          }
          return acc;
      }, { cement: 0, sand: 0, gravel: 0, water: 0 });

      setCalculationResult({
          totalVolume,
          totalMaterials,
          byDosage,
      });
    }
    
    calculateTotals(watchedForm as FormValues);
  }, [watchedForm]);


  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Accordion type="multiple" defaultValue={['ouvrage-0']} className="space-y-6">
                    {fields.map((ouvrageField, ouvrageIndex) => (
                        <OuvrageItem
                            key={ouvrageField.id}
                            ouvrageIndex={ouvrageIndex}
                            control={form.control}
                            removeOuvrage={remove}
                            dosageResult={calculationResult?.byDosage[ouvrageIndex]}
                        />
                    ))}
                </Accordion>
                 <Button type="button" variant="secondary" className="w-full h-12 text-base" onClick={() => append({ dosage: 350, components: [{ name: 'Nouveau composant', shape: 'rectangular', length: 1, width: 1, height: 1, quantity: 1 }]})}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Ajouter un nouveau parc d'ouvrages
                 </Button>
            </div>

            <div className="lg:col-span-1 space-y-6">
                 {calculationResult && (
                    <Card className="bg-accent/10 border-accent shadow-xl sticky top-8">
                        <CardHeader>
                            <CardTitle className="text-accent-foreground text-2xl">
                                Récapitulatif Total
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
                                <div className="flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"/><path d="M12 22c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Z"/></svg>
                                    <p><span className="font-bold text-xl text-foreground">{calculationResult.totalMaterials.cement}</span> sacs de ciment (50kg)</p>
                                </div>
                                <div className="flex items-center gap-3"> <Sprout className="h-5 w-5 text-primary" /> <p><span className="font-bold text-xl text-foreground">{calculationResult.totalMaterials.sand.toFixed(2)}</span> m³ de sable</p> </div>
                                <div className="flex items-center gap-3"> <Triangle className="h-5 w-5 text-primary" /> <p><span className="font-bold text-xl text-foreground">{calculationResult.totalMaterials.gravel.toFixed(2)}</span> m³ de gravier</p> </div>
                                <div className="flex items-center gap-3"> <Droplets className="h-5 w-5 text-primary" /> <p><span className="font-bold text-xl text-foreground">{calculationResult.totalMaterials.water.toFixed(0)}</span> litres d'eau</p> </div>
                            </div>
                            
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
