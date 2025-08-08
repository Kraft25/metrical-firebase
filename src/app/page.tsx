import { CalculatorForm } from '@/components/calculator-form';
import { Calculator } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-8 lg:p-16 bg-background">
      <div className="w-full max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 sm:gap-4">
            <Calculator className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold font-headline text-foreground">
              Métrical Pro
            </h1>
          </div>
          <p className="mt-2 text-md sm:text-lg text-muted-foreground">
            Calculez facilement et avec précision le métré de vos ouvrages.
          </p>
        </header>
        <CalculatorForm />
      </div>
    </main>
  );
}
