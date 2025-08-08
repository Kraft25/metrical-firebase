import { CalculatorForm } from '@/components/calculator-form';
import { BlockCalculatorForm } from '@/components/block-calculator-form';
import { PlasterCalculatorForm } from '@/components/plaster-calculator-form';
import { WaterproofingCalculatorForm } from '@/components/waterproofing-calculator-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Ungroup, Layers, Droplets } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-8 lg:p-16 bg-background">
      <div className="w-full max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 sm:gap-4">
            <Calculator className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
              Métrical Pro
            </h1>
          </div>
          <p className="mt-2 text-md sm:text-lg text-muted-foreground">
            Calculez facilement et avec précision le métré de vos ouvrages.
          </p>
        </header>

        <Tabs defaultValue="volume" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="volume">
              <Calculator className="mr-2" /> Calcul de Volume
            </TabsTrigger>
            <TabsTrigger value="blocks">
              <Ungroup className="mr-2" /> Calcul de Parpaings
            </TabsTrigger>
            <TabsTrigger value="plaster">
              <Layers className="mr-2" /> Calcul d'Enduit
            </TabsTrigger>
            <TabsTrigger value="waterproofing">
              <Droplets className="mr-2" /> Calcul d'Étanchéité
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
        </Tabs>
      </div>
    </main>
  );
}
