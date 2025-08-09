
"use client";

import { Separator } from "@/components/ui/separator";
import { PlasterCalculatorForm, FormValues as PlasterFormValues } from "./plaster-calculator-form";
import { WaterproofingCalculatorForm, FormValues as WaterproofingFormValues } from "./waterproofing-calculator-form";
import type { FormValues as BlockFormValues } from './block-calculator-form';
import { UseFormReturn } from "react-hook-form";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Info } from "lucide-react";

interface FinishesCalculatorFormProps {
    plasterForm: UseFormReturn<PlasterFormValues>;
    waterproofingForm: UseFormReturn<WaterproofingFormValues>;
    blockFormValues: BlockFormValues;
}

export function FinishesCalculatorForm({ plasterForm, waterproofingForm, blockFormValues }: FinishesCalculatorFormProps) {
    
    const totalSurfaceFromBlocks = (blockFormValues.components || []).reduce((acc, comp) => {
        const length = Number(comp.length) || 0;
        const height = Number(comp.height) || 0;
        return acc + (length * height);
    }, 0);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex-row items-center gap-4">
                   <Info className="h-8 w-8 text-primary" />
                   <div>
                    <CardTitle>Information Importante</CardTitle>
                    <CardDescription>
                        Les calculs d'enduit et d'étanchéité ci-dessous se basent sur la surface totale des murs définie dans l'onglet "Calcul Maçonnerie".
                        Si aucune surface n'est définie là-bas, vous ne verrez aucun résultat ici.
                    </CardDescription>
                   </div>
                </CardHeader>
           </Card>

            <PlasterCalculatorForm form={plasterForm} blockFormValues={blockFormValues} />
            <Separator className="my-8" />
            <WaterproofingCalculatorForm form={waterproofingForm} />
        </div>
    );
}
