
import dynamic from 'next/dynamic';
import { FileText, Ungroup, Layers, Droplets, GitCommitHorizontal, Loader } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppSummary } from '@/components/app-summary';

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
const PlasterCalculatorForm = dynamic(() => import('@/components/plaster-calculator-form').then(mod => mod.PlasterCalculatorForm), {
  loading: () => <LoadingComponent />,
});
const WaterproofingCalculatorForm = dynamic(() => import('@/components/waterproofing-calculator-form').then(mod => mod.WaterproofingCalculatorForm), {
  loading: () => <LoadingComponent />,
});
const SteelCalculatorForm = dynamic(() => import('@/components/steel-calculator-form').then(mod => mod.SteelCalculatorForm), {
  loading: () => <LoadingComponent />,
});
const DqeForm = dynamic(() => import('@/components/dqe-form').then(mod => mod.DqeForm), {
  loading: () => <LoadingComponent />,
});


export default function Home() {
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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
            <TabsTrigger value="volume">
              <FileText className="mr-2" /> Calcul de Volume
            </TabsTrigger>
            <TabsTrigger value="blocks">
              <Ungroup className="mr-2" /> Calcul Maçonnerie
            </TabsTrigger>
            <TabsTrigger value="plaster">
              <Layers className="mr-2" /> Calcul d'Enduit
            </TabsTrigger>
            <TabsTrigger value="waterproofing">
              <Droplets className="mr-2" /> Calcul d'Étanchéité
            </TabsTrigger>
            <TabsTrigger value="steel">
              <GitCommitHorizontal className="mr-2" /> Calcul Aciers
            </TabsTrigger>
             <TabsTrigger value="dqe">
              <FileText className="mr-2" /> DQE
            </TabsTrigger>
          </TabsList>
          <TabsContent value="volume" className="mt-6">
            <CalculatorForm />
          </TabsContent>
          <TabsContent value="blocks" className="mt-6">
            <BlockCalculatorForm />
          </TabsContent>
          <TabsContent value="plaster" className="mt-6">
            <PlasterCalculatorForm />
          </TabsContent>
           <TabsContent value="waterproofing" className="mt-6">
            <WaterproofingCalculatorForm />
          </TabsContent>
          <TabsContent value="steel" className="mt-6">
            <SteelCalculatorForm />
          </TabsContent>
          <TabsContent value="dqe" className="mt-6">
            <DqeForm />
          </TabsContent>
        </Tabs>
        
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
