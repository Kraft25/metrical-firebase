
"use client";

import { useForm } from 'react-hook-form';
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { FileText, Ungroup, Layers, Droplets, GitCommitHorizontal, Loader, Send, MessageSquare, User, Paintbrush } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppSummary } from '@/components/app-summary';
import type { FormValues as VolumeFormValues } from '@/components/calculator-form';
import type { FormValues as BlockFormValues } from '@/components/block-calculator-form';
import type { FormValues as PlasterFormValues } from '@/components/plaster-calculator-form';
import type { FormValues as WaterproofingFormValues } from '@/components/waterproofing-calculator-form';
import type { FormValues as SteelFormValues } from '@/components/steel-calculator-form';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LoadingComponent = () => (
  <div className="flex items-center justify-center p-16">
    <Loader className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const CalculatorForm = dynamic(() => import('@/components/calculator-form').then(mod => mod.CalculatorForm), {
  loading: () => <LoadingComponent />,
});
const BlockCalculatorForm = dynamic(() => import('@/components/block-calculator-form').then(mod => mod.BlockCalculatorForm), {
  loading: () => <LoadingComponent />,
});
const FinishesCalculatorForm = dynamic(() => import('@/components/finishes-calculator-form').then(mod => mod.FinishesCalculatorForm), {
  loading: () => <LoadingComponent />,
});
const SteelCalculatorForm = dynamic(() => import('@/components/steel-calculator-form').then(mod => mod.SteelCalculatorForm), {
  loading: () => <LoadingComponent />,
});
const DqeForm = dynamic(() => import('@/components/dqe-form').then(mod => mod.DqeForm), {
  loading: () => <LoadingComponent />,
});

type Suggestion = {
    name: string;
    suggestion: string;
};

const defaultValues = {
  volume: { ouvrages: [] },
  blocks: {
    blockLength: 0.4,
    blockHeight: 0.2,
    blockThickness: 0.15,
    components: []
  },
  plaster: {
    thickness: 0.015,
    dosage: "300" as const,
  },
  waterproofing: {
    consumption: 1.5,
    layers: 2,
    components: []
  },
  steel: { ouvrages: [] }
};

export default function Home() {
  const volumeForm = useForm<VolumeFormValues>({ defaultValues: defaultValues.volume });
  const blockForm = useForm<BlockFormValues>({ defaultValues: defaultValues.blocks });
  const plasterForm = useForm<PlasterFormValues>({ defaultValues: defaultValues.plaster });
  const waterproofingForm = useForm<WaterproofingFormValues>({ defaultValues: defaultValues.waterproofing });
  const steelForm = useForm<SteelFormValues>({ defaultValues: defaultValues.steel });

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Suggestion>();

  useEffect(() => {
    try {
      const savedSuggestions = localStorage.getItem('suggestions');
      if (savedSuggestions) {
        setSuggestions(JSON.parse(savedSuggestions));
      }
    } catch (error) {
      console.error("Failed to load suggestions from localStorage", error);
    }
  }, []);

  const handleSendSuggestion = (data: Suggestion) => {
    const newSuggestions = [...suggestions, data];
    setSuggestions(newSuggestions);
    try {
      localStorage.setItem('suggestions', JSON.stringify(newSuggestions));
    } catch (error) {
       console.error("Failed to save suggestions to localStorage", error);
    }
    reset();
  };
  
  const blockFormValues = blockForm.watch();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 sm:p-8 lg:p-16 bg-background">
      <div className="w-full max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 sm:gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 sm:h-12 sm:w-12 text-primary"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="17" x2="12" y2="17"/></svg>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
              Métrical
            </h1>
          </div>
          <p className="mt-2 text-md sm:text-lg text-muted-foreground">
            Calculez facilement et avec précision le métré de vos ouvrages.
          </p>
        </header>

        <Tabs defaultValue="volume" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="volume">
              <FileText className="mr-2" /> Calcul de Volume
            </TabsTrigger>
            <TabsTrigger value="blocks">
              <Ungroup className="mr-2" /> Calcul Maçonnerie
            </TabsTrigger>
            <TabsTrigger value="finishes">
              <Paintbrush className="mr-2" /> Enduits & Finitions
            </TabsTrigger>
            <TabsTrigger value="steel">
              <GitCommitHorizontal className="mr-2" /> Calcul Aciers
            </TabsTrigger>
             <TabsTrigger value="dqe">
              <FileText className="mr-2" /> DQE
            </TabsTrigger>
          </TabsList>
          <TabsContent value="volume" className="mt-6">
            <CalculatorForm form={volumeForm} />
          </TabsContent>
          <TabsContent value="blocks" className="mt-6">
            <BlockCalculatorForm form={blockForm} />
          </TabsContent>
          <TabsContent value="finishes" className="mt-6">
            <FinishesCalculatorForm
              plasterForm={plasterForm}
              waterproofingForm={waterproofingForm}
              blockFormValues={blockFormValues}
            />
          </TabsContent>
          <TabsContent value="steel" className="mt-6">
            <SteelCalculatorForm form={steelForm} />
          </TabsContent>
          <TabsContent value="dqe" className="mt-6">
            <DqeForm />
          </TabsContent>
        </Tabs>

        <section className="mt-16 w-full max-w-3xl mx-auto">
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <MessageSquare className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle>Suggestions & Améliorations</CardTitle>
                            <CardDescription>
                                Votre avis est précieux. Laissez un commentaire public pour nous aider à améliorer l'application.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit(handleSendSuggestion)}>
                    <CardContent className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Nom (obligatoire)</label>
                            <div className="relative">
                               <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                               <Input
                                  id="name"
                                  placeholder="Votre nom..."
                                  {...register("name", { required: "Le nom est obligatoire." })}
                                  className="pl-10"
                                />
                            </div>
                            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="suggestion" className="block text-sm font-medium text-foreground mb-1">Suggestion</label>
                            <Textarea
                                id="suggestion"
                                placeholder="Écrivez votre suggestion ici..."
                                rows={5}
                                {...register("suggestion", { required: "Veuillez laisser une suggestion."})}
                                className="text-base"
                            />
                            {errors.suggestion && <p className="text-sm text-destructive mt-1">{errors.suggestion.message}</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto ml-auto">
                            <Send className="mr-2 h-4 w-4" />
                            Publier
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {suggestions.length > 0 && (
                <div className="mt-8 space-y-4">
                    <h3 className="text-2xl font-bold text-center">Suggestions Récentes</h3>
                    {suggestions.slice().reverse().map((s, i) => (
                        <Card key={i} className="bg-card/50">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <User className="h-6 w-6 text-primary"/>
                                    <CardTitle className="text-xl">{s.name}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{s.suggestion}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </section>

        <div className="mt-16">
          <AppSummary />
        </div>

      </div>
      <footer className="w-full text-center mt-16 max-w-3xl mx-auto">
        <p className="text-sm text-muted-foreground">
          Développée par Daniel Hoba, étudiant en génie civil, cette application vise à optimiser les calculs et la gestion de projets BTP pour les professionnels et les étudiants.
        </p>
      </footer>
    </main>
  );
}
