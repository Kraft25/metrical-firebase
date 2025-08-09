"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Info } from "lucide-react";

export function AppSummary() {
  const features = [
    {
      title: "Calcul de Volume (Béton)",
      description: "Estimez le volume de béton et les matériaux (ciment, sable, gravier, eau) pour tout type d'ouvrage : fondations, poteaux, poutres, dalles, etc."
    },
    {
      title: "Calcul de Parpaings (Maçonnerie)",
      description: "Calculez le nombre de parpaings nécessaires pour vos murs (base 20x40cm) et estimez le mortier de pose (ciment, sable) en fonction du dosage."
    },
    {
      title: "Calcul d'Enduit",
      description: "Déterminez la quantité d'enduit (ciment, sable) requise pour crépir vos surfaces, en fonction de l'épaisseur et du type d'enduit."
    },
    {
      title: "Calcul d'Étanchéité",
      description: "Évaluez la quantité de produit d'étanchéité nécessaire pour protéger vos surfaces en fonction de la consommation par couche."
    },
    {
      title: "Calcul des Aciers (Ferraillage)",
      description: "Estimez le poids total d'acier et le nombre de barres commerciales par diamètre pour le béton armé (poutres, poteaux), en distinguant étriers et épingles."
    }
  ];

  return (
    <Accordion type="single" collapsible className="w-full mb-8 shadow-lg rounded-lg bg-card border">
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger className="p-6 text-2xl font-semibold text-foreground hover:no-underline">
          <div className="flex items-center gap-3">
             <Info className="h-7 w-7 text-primary" />
            Récapitulatif des Fonctionnalités
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6">
           <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-6">
            Métrical Pro est votre assistant de chantier tout-en-un, conçu pour vous fournir des estimations précises et rapides pour les travaux de gros œuvre. Voici ce que vous pouvez faire :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <CheckCircle className="h-7 w-7 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
