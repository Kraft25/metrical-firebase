"use client";

import { useState, useMemo, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler, Ungroup } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const blockSizes = {
  "20x20x50": { length: 0.5, height: 0.2, name: "Parpaing 20x20x50" },
  "15x20x50": { length: 0.5, height: 0.2, name: "Parpaing 15x20x50" },
  "10x20x50": { length: 0.5, height: 0.2, name: "Parpaing 10x20x50" },
  "custom": { length: 0, height: 0, name: "Personnalisé" },
};

const formSchema = z.object({
  wallLength: z.coerce.number().positive("La longueur du mur doit être positive."),
  wallHeight: z.coerce.number().positive("La hauteur du mur doit être positive."),
  blockSize: z.string().min(1, "Veuillez sélectionner une taille de parpaing."),
  blockLength: z.coerce.number(),
  blockHeight: z.coerce.number(),
  jointThickness: z.coerce.number().min(0, "L'épaisseur ne peut être négative."),
}).refine(data => {
    if (data.blockSize === 'custom') {
        return data.blockLength > 0 && data.blockHeight > 0;
    }
    return true;
}, {
    message: "Les dimensions personnalisées doivent être positives.",
    path: ['blockLength'], // You can also apply it to blockHeight or make it a global error
});


type FormValues = z.infer<typeof formSchema>;

export function BlockCalculatorForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            wallLength: 10,
            wallHeight: 2.5,
            blockSize: "20x20x50",
            blockLength: 0.5,
            blockHeight: 0.2,
            jointThickness: 0.015,
        },
    });

    const watchedFields = useWatch({ control: form.control });
    const selectedBlockSize = useWatch({ control: form.control, name: 'blockSize' });
    
    useEffect(() => {
        if (selectedBlockSize && selectedBlockSize !== 'custom') {
            const { length, height } = blockSizes[selectedBlockSize as keyof typeof blockSizes];
            form.setValue('blockLength', length);
            form.setValue('blockHeight', height);
        }
    }, [selectedBlockSize, form]);

    const [isCalculating, setIsCalculating] = useState(false);

    const calculationResult = useMemo(() => {
        const { wallLength, wallHeight, blockLength, blockHeight, jointThickness } = watchedFields;

        if (!wallLength || !wallHeight || !blockLength || !blockHeight) {
            return { blocksNeeded: 0, realSurface: 0 };
        }
        
        const blockSurfaceWithJoint = (blockLength + jointThickness) * (blockHeight + jointThickness);
        const wallSurface = wallLength * wallHeight;
        
        const blocksNeeded = Math.ceil(wallSurface / blockSurfaceWithJoint);
        const realSurface = blocksNeeded * blockLength * blockHeight;

        return { blocksNeeded, realSurface };
    }, [watchedFields]);

    useEffect(() => {
      setIsCalculating(true);
      const timer = setTimeout(() => setIsCalculating(false), 500);
      return () => clearTimeout(timer);
    }, [calculationResult]);


  return (
    <Form {...form}>
      <form className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Calculateur de Parpaings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <h3 className="font-semibold text-lg text-foreground">Dimensions du Mur</h3>
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
            <div className="space-y-6">
                <h3 className="font-semibold text-lg text-foreground">Dimensions du Parpaing</h3>
                 <FormField
                  control={form.control}
                  name="blockSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taille standard</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une taille" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(blockSizes).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {selectedBlockSize === 'custom' && (
                    <>
                        <FormField
                            control={form.control}
                            name="blockLength"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Longueur du parpaing (m)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" placeholder="Ex: 0.50" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="blockHeight"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Hauteur du parpaing (m)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" placeholder="Ex: 0.20" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}
                 <FormField
                    control={form.control}
                    name="jointThickness"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Épaisseur du joint (m)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.001" placeholder="Ex: 0.015" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
          </CardContent>
        </Card>
        
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
                        <p className={`text-5xl font-bold transition-colors duration-500 ${isCalculating ? 'text-primary' : 'text-foreground'}`}>
                        {calculationResult.blocksNeeded}
                        </p>
                        <p className="text-muted-foreground mt-1">Parpaings nécessaires (+5-10% de marge conseillée)</p>
                    </div>
                </div>
            </CardContent>
            </Card>
        </div>
      </form>
    </Form>
  );
}
