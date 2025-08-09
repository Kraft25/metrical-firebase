"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

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
    <Card className="shadow-lg mb-8 bg-card">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-foreground">Récapitulatif des Fonctionnalités</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground max-w-3xl mx-auto">
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
      </CardContent>
    </Card>
  );
}
