"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function DqeForm() {
  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>Devis Quantitatif Estimatif (DQE)</CardTitle>
            <CardDescription>
              Cette section centralisera bientôt vos calculs pour générer un devis complet.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-16">
          <p className="font-semibold text-lg">Fonctionnalité en cours de développement.</p>
          <p>Bientôt, vous pourrez définir les prix unitaires et générer un DQE détaillé ici.</p>
        </div>
      </CardContent>
    </Card>
  );
}
