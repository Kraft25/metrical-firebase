"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Ruler, PlusCircle, Trash2, Building, Hash, GitCommitHorizontal, Circle, Square } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { cn } from '@/lib/utils';

const steelDiameters: { [key: string]: { weightPerMeter: number } } = {
    '6': { weightPerMeter: 0.222 },
    '8': { weightPerMeter: 0.395 },
    '10': { weightPerMeter: 0.617 },
    '12': { weightPerMeter: 0.888 },
    '14': { weightPerMeter: 1.21 },
    '16': { weightPerMeter: 1.58 },
};
const COMMERCIAL_BAR_LENGTH = 12; // 12 meters

const ouvrageSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.'),
  type: z.enum(['poutre', 'poteau', 'semelle']),
  shape: z.enum(['rectangulaire', 'circulaire']).default('rectangulaire'),
  length: z.coerce.number().positive("La longueur est requise."),
  width: z.coerce.number().positive("La largeur est requise.").optional(),
  height: z.coerce.number().positive("La hauteur est requise.").optional(),
  diameter: z.coerce.number().positive("Le diamètre est requis.").optional(),
  quantity: z.coerce.number().int().min(1),
  longitudinalBars: z.object({
    diameter: z.string().nonempty("Diamètre requis."),
    count: z.coerce.number().int().min(1),
  }),
  transversalBars: z.object({
    type: z.enum(['etrier', 'epingle']).default('etrier'),
    diameter: z.string().nonempty("Diamètre requis."),
    spacing: z.coerce.number().positive("Espacement requis."),
  }),
  coating: z.coerce.number().min(0).default(0.025), // Enrobage de 2.5cm par défaut
}).refine(data => data.type === 'poteau' || data.shape !== 'circulaire', {
    message: "Seuls les poteaux peuvent être circulaires.",
    path: ['shape'],
}).refine(data => {
    if (data.shape === 'rectangulaire') {
        return data.width !== undefined && (data.height !== undefined || data.type === 'semelle');
    }
    return true;
}, {
    message: "Largeur et hauteur sont requises pour une forme rectangulaire.",
    path: ['width']
}).refine(data => {
    if (data.shape === 'circulaire') {
        return data.diameter !== undefined;
    }
    return true;
}, {
    message: "Le diamètre est requis pour une forme circulaire.",
    path: ['diameter']
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
    weightByDiameter: { [key: string]: { weight: number, bars: number } };
    ouvrageResults: (OuvrageResult | null)[];
} | null;

const calculateSteel = (values: FormValues) => {
    let totalWeight = 0;
    const weightByDiameter: { [key: string]: { weight: number, length: number, bars: number } } = {};
    
    const ouvrageResults = values.ouvrages.map(ouvrage => {
        if (!ouvrage.longitudinalBars.diameter || !ouvrage.transversalBars.diameter || !steelDiameters[ouvrage.longitudinalBars.diameter] || !steelDiameters[ouvrage.transversalBars.diameter]) {
            return null;
        }

        // Calcul Aciers Longitudinaux
        const longiDiameter = ouvrage.longitudinalBars.diameter;
        const longiWeightPerMeter = steelDiameters[longiDiameter].weightPerMeter;
        const longiTotalLength = ouvrage.length * ouvrage.longitudinalBars.count * ouvrage.quantity;
        const longitudinalWeight = longiTotalLength * longiWeightPerMeter;

        if (!weightByDiameter[longiDiameter]) weightByDiameter[longiDiameter] = { weight: 0, length: 0, bars: 0 };
        weightByDiameter[longiDiameter].weight += longitudinalWeight;
        weightByDiameter[longiDiameter].length += longiTotalLength;
        
        // Calcul Aciers Transversaux (Cadres/Étriers/Épingles)
        const transDiameter = ouvrage.transversalBars.diameter;
        const transWeightPerMeter = steelDiameters[transDiameter].weightPerMeter;
        
        let singleTransversalLength = 0;
        
        if (ouvrage.shape === 'circulaire' && ouvrage.diameter) {
             const diameterMinusCoating = ouvrage.diameter - 2 * ouvrage.coating;
             singleTransversalLength = Math.PI * diameterMinusCoating; // Circonférence de l'étrier circulaire
        } else if (ouvrage.shape === 'rectangulaire' && ouvrage.width && ouvrage.height) {
            const widthMinusCoating = ouvrage.width - 2 * ouvrage.coating;
            const heightMinusCoating = ouvrage.height - 2 * ouvrage.coating;
            if (ouvrage.transversalBars.type === 'etrier') {
                singleTransversalLength = 2 * (widthMinusCoating + heightMinusCoating);
            } else { // 'epingle'
                singleTransversalLength = widthMinusCoating + 2 * heightMinusCoating;
            }
        }

        const transversalCount = Math.ceil(ouvrage.length / ouvrage.transversalBars.spacing);
        const transTotalLength = singleTransversalLength * transversalCount * ouvrage.quantity;
        const transversalWeight = transTotalLength * transWeightPerMeter;

        if (!weightByDiameter[transDiameter]) weightByDiameter[transDiameter] = { weight: 0, length: 0, bars: 0 };
        weightByDiameter[transDiameter].weight += transversalWeight;
        weightByDiameter[transDiameter].length += transTotalLength;

        const totalOuvrageWeight = longitudinalWeight + transversalWeight;
        totalWeight += totalOuvrageWeight;
        
        return {
            longitudinalWeight,
            transversalWeight,
            totalWeight: totalOuvrageWeight
        };
    });
    
    const finalWeightByDiameter: CalculationResult['weightByDiameter'] = {};
    for (const diameter in weightByDiameter) {
        finalWeightByDiameter[diameter] = {
            weight: weightByDiameter[diameter].weight,
            bars: Math.ceil(weightByDiameter[diameter].length / COMMERCIAL_BAR_LENGTH)
        };
    }

    return { totalWeight, weightByDiameter: finalWeightByDiameter, ouvrageResults };
};

function OuvrageSteelItem({ form, index, remove, ouvrageResult }: { form: any, index: number, remove: (index: number) => void, ouvrageResult: OuvrageResult | null }) {
    const ouvrage = useWatch({
        control: form.control,
        name: `ouvrages.${index}`
    });

    return (
        <AccordionItem value={`ouvrage-${index}`} className="bg-card border shadow-lg rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-2 pr-4">
                <AccordionTrigger className="flex-1 p-2 sm:p-4 text-lg font-semibold hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                        <span className="bg-primary/10 text-primary font-bold size-10 flex items-center justify-center rounded-full">
                            #{index + 1}
                        </span>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground capitalize">{ouvrage.name || `Ouvrage #${index + 1}`}</h3>
                            <p className="text-sm font-normal text-muted-foreground capitalize">{ouvrage.type} ({ouvrage.shape})</p>
                        </div>
                    </div>
                </AccordionTrigger>
                <Button type="button" variant="ghost" size="icon" className="text-destructive rounded-full" onClick={() => remove(index)}>
                    <Trash2 className="h-5 w-5"/>
                </Button>
            </div>
            <AccordionContent>
                <div className="border-t p-6 space-y-6">
                    {/* Infos générales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`ouvrages.${index}.name`} render={({ field }) => ( <FormItem> <FormLabel>Nom</FormLabel> <FormControl><div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/><Input {...field} placeholder="Ex: Poutre RDC" className="pl-10 text-base h-11"/></div></FormControl> </FormItem> )}/>
                        <FormField control={form.control} name={`ouvrages.${index}.type`} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type d'Ouvrage</FormLabel>
                                <Select onValueChange={(value) => {
                                    field.onChange(value);
                                    if (value !== 'poteau') {
                                        form.setValue(`ouvrages.${index}.shape`, 'rectangulaire');
                                    }
                                }} defaultValue={field.value}>
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
                    
                    {ouvrage.type === 'poteau' && (
                        <FormField
                        control={form.control}
                        name={`ouvrages.${index}.shape`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Forme du Poteau</FormLabel>
                            <FormControl>
                                <ToggleGroup type="single" value={field.value} onValueChange={field.onChange} className="w-full grid grid-cols-2 border p-1 rounded-md bg-background">
                                <ToggleGroupItem value="rectangulaire" className="gap-2 h-9">
                                    <Square className="h-5 w-5"/> Rectangle
                                </ToggleGroupItem>
                                <ToggleGroupItem value="circulaire" className="gap-2 h-9">
                                    <Circle className="h-5 w-5"/> Circulaire
                                </ToggleGroupItem>
                                </ToggleGroup>
                            </FormControl>
                            </FormItem>
                        )}
                        />
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                        <FormField control={form.control} name={`ouvrages.${index}.length`} render={({ field }) => ( <FormItem> <FormLabel>Long./Haut. (m)</FormLabel> <FormControl><Input {...field} type="number" step="0.01" className="h-11"/></FormControl> </FormItem> )}/>
                        {ouvrage.shape === 'rectangulaire' ? (
                            <>
                                <FormField control={form.control} name={`ouvrages.${index}.width`} render={({ field }) => ( <FormItem> <FormLabel>Larg. (m)</FormLabel> <FormControl><Input {...field} type="number" step="0.01" className="h-11"/></FormControl> </FormItem> )}/>
                                {ouvrage.type !== 'semelle' && <FormField control={form.control} name={`ouvrages.${index}.height`} render={({ field }) => ( <FormItem> <FormLabel>Haut./Ép. (m)</FormLabel> <FormControl><Input {...field} type="number" step="0.01" className="h-11"/></FormControl> </FormItem> )}/>}
                            </>
                        ) : (
                            <FormField control={form.control} name={`ouvrages.${index}.diameter`} render={({ field }) => ( <FormItem className="col-span-2"> <FormLabel>Diamètre (m)</FormLabel> <FormControl><Input {...field} type="number" step="0.01" className="h-11"/></FormControl> </FormItem> )}/>
                        )}
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
                    <h4 className="font-semibold text-lg">Aciers Transversaux</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <FormField control={form.control} name={`ouvrages.${index}.transversalBars.type`} render={({ field }) => (
                            <FormItem className="sm:col-span-1"><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={ouvrage.shape === 'circulaire'}><FormControl><SelectTrigger className="h-11"><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="etrier">Étrier</SelectItem><SelectItem value="epingle">Épingle</SelectItem></SelectContent></Select></FormItem>
                        )}/>
                        <FormField control={form.control} name={`ouvrages.${index}.transversalBars.diameter`} render={({ field }) => (
                            <FormItem className="sm:col-span-1"><FormLabel>Diamètre (mm)</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-11"><SelectValue/></SelectTrigger></FormControl><SelectContent>{Object.keys(steelDiameters).map(d => <SelectItem key={d} value={d}>HA {d}</SelectItem>)}</SelectContent></Select></FormItem>
                        )}/>
                        <FormField control={form.control} name={`ouvrages.${index}.transversalBars.spacing`} render={({ field }) => (
                            <FormItem className="sm:col-span-1"><FormLabel>Espacement (m)</FormLabel><FormControl><Input {...field} type="number" step="0.01" className="h-11"/></FormControl></FormItem>
                        )}/>
                            <FormField control={form.control} name={`ouvrages.${index}.coating`} render={({ field }) => (
                            <FormItem className="sm:col-span-1"><FormLabel>Enrobage (m)</FormLabel><FormControl><Input {...field} type="number" step="0.005" className="h-11"/></FormControl></FormItem>
                        )}/>
                    </div>
                </div>
                    {ouvrageResult && (
                    <CardFooter className="bg-muted/30 border-t p-4 sm:p-6 flex-col items-start">
                            <h4 className="text-lg font-semibold mb-2">{ouvrage.name}</h4>
                            <p className="text-sm text-muted-foreground mb-3">Poids total: <span className="font-bold">{ouvrageResult.totalWeight.toFixed(2)} kg</span></p>
                            <ul className="text-sm space-y-1 w-full">
                            <li className="flex justify-between"><span>Poids longitudinaux:</span> <span className="font-bold">{ouvrageResult.longitudinalWeight.toFixed(2)} kg</span></li>
                            <li className="flex justify-between"><span>Poids transversaux:</span> <span className="font-bold">{ouvrageResult.transversalWeight.toFixed(2)} kg</span></li>
                            </ul>
                    </CardFooter>
                )}
            </AccordionContent>
        </AccordionItem>
    );
}

export function SteelCalculatorForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ouvrages: [
                { name: "Poutre Principale", type: 'poutre', shape: 'rectangulaire', length: 6, width: 0.25, height: 0.4, quantity: 1, longitudinalBars: { diameter: "12", count: 6 }, transversalBars: { type: "etrier", diameter: "8", spacing: 0.20 }, coating: 0.025 },
                { name: "Poteaux Rect.", type: 'poteau', shape: 'rectangulaire', length: 3, width: 0.3, height: 0.3, quantity: 4, longitudinalBars: { diameter: "10", count: 4 }, transversalBars: { type: "etrier", diameter: "6", spacing: 0.15 }, coating: 0.025 },
                { name: "Poteaux Circ.", type: 'poteau', shape: 'circulaire', length: 3, diameter: 0.35, quantity: 2, longitudinalBars: { diameter: "12", count: 6 }, transversalBars: { type: "etrier", diameter: "8", spacing: 0.15 }, coating: 0.025 },
            ]
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'ouvrages',
    });
    
    const [calculationResult, setCalculationResult] = useState<CalculationResult>(null);

    const watchedForm = useWatch({ control: form.control });

    useEffect(() => {
        const result = calculateSteel(watchedForm as FormValues);
        setCalculationResult(result);
    }, [watchedForm]);

    return (
        <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <Accordion type="multiple" defaultValue={['ouvrage-0', 'ouvrage-1', 'ouvrage-2']} className="space-y-6">
                            {fields.map((field, index) => (
                                <OuvrageSteelItem 
                                    key={field.id} 
                                    form={form} 
                                    index={index} 
                                    remove={remove}
                                    ouvrageResult={calculationResult?.ouvrageResults[index] || null}
                                />
                            ))}
                        </Accordion>
                         <Button type="button" variant="secondary" className="w-full h-12 text-base" onClick={() => append({ name: "Nouveau", type: 'poutre', shape: 'rectangulaire', length: 1, width: 0.2, height: 0.2, quantity: 1, longitudinalBars: { diameter: "10", count: 4 }, transversalBars: { type: 'etrier', diameter: "6", spacing: 0.25 }, coating: 0.025 })}>
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
                                        {Object.entries(calculationResult.weightByDiameter).sort(([a],[b]) => Number(a) - Number(b)).map(([diameter, data]) => (
                                            <div key={diameter} className="flex items-start gap-3 justify-between">
                                                <div className="flex items-center gap-2">
                                                    <GitCommitHorizontal className="h-5 w-5 text-primary mt-1" />
                                                    <span>Acier HA {diameter}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-xl text-foreground">{data.weight.toFixed(2)} kg</p>
                                                    <p className="text-sm text-muted-foreground">{data.bars} barre(s) de 12m</p>
                                                </div>
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
