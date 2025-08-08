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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Ruler, Hash, Building } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const componentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.'),
  length: z.coerce.number().min(0, 'Positif requis.'),
  width: z.coerce.number().min(0, 'Positif requis.'),
  height: z.coerce.number().min(0, 'Positif requis.'),
  quantity: z.coerce.number().int().min(1, 'Minimum 1.'),
});

const formSchema = z.object({
  components: z.array(componentSchema),
});

type FormValues = z.infer<typeof formSchema>;

const MemoizedSubTotal = ({ control, index }: { control: any, index: number }) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const data = useWatch({ control, name: `components.${index}` });

  const subtotal = useMemo(() => {
    const { length = 0, width = 0, height = 0, quantity = 0 } = data;
    return length * width * height * quantity;
  }, [data]);
  
  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => setIsCalculating(false), 500);
    return () => clearTimeout(timer);
  }, [subtotal])

  return (
    <div className="flex flex-col space-y-2 h-full justify-between">
      <FormLabel className="hidden sm:inline-block">Sous-Total</FormLabel>
      <div className={`flex items-center justify-end sm:justify-center font-bold text-lg h-10 px-3 rounded-md border bg-card transition-colors duration-500 ${isCalculating ? 'text-primary' : 'text-foreground'}`}>
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
        { name: 'Mur en béton', length: 10, width: 0.2, height: 2.5, quantity: 2 },
        { name: 'Dalle de sol', length: 5, width: 4, height: 0.15, quantity: 1 },
        { name: 'Poteau', length: 0.3, width: 0.3, height: 3, quantity: 4 },
        { name: 'Poutre', length: 5, width: 0.2, height: 0.3, quantity: 2 },
        { name: 'Chaînage', length: 12, width: 0.15, height: 0.15, quantity: 1 },
        { name: 'Étanchéité', length: 10, width: 5, height: 0.005, quantity: 1 },
        { name: 'Enduit', length: 10, width: 2.5, height: 0.02, quantity: 2 },
        { name: 'Raidisseur', length: 0.15, width: 0.15, height: 3, quantity: 6 },
      ]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'components',
  });

  const watchedComponents = useWatch({
    control: form.control,
    name: 'components',
  });
  
  const [isCalculating, setIsCalculating] = useState(false);

  const totalVolume = useMemo(() => {
    return watchedComponents.reduce((acc, comp) => {
        const { length = 0, width = 0, height = 0, quantity = 0 } = comp;
        return acc + (length * width * height * quantity);
    }, 0);
  }, [watchedComponents]);
  
  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => setIsCalculating(false), 500);
    return () => clearTimeout(timer);
  }, [totalVolume]);

  return (
    <Form {...form}>
      <form>
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
                        <Input {...field} type="number" step="0.01" placeholder="0.00" />
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
          <CardFooter className="flex flex-col items-start space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: '', length: 0, width: 0, height: 0, quantity: 1 })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un composant
            </Button>
          </CardFooter>
        </Card>
      </form>
      
      <div className="mt-8">
        <Card className="bg-accent/10 border-accent shadow-xl">
          <CardHeader>
            <CardTitle className="text-accent-foreground text-2xl">
              Résultat Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-5xl font-bold transition-colors duration-500 ${isCalculating ? 'text-primary' : 'text-foreground'}`}>
              {totalVolume.toFixed(2)} m³
            </p>
            <p className="text-muted-foreground mt-1">Volume total de l'ouvrage</p>
          </CardContent>
        </Card>
      </div>
    </Form>
  );
}
