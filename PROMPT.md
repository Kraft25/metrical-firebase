# Prompt de Description pour l'Application : Métrical Pro

## 1. Nom de l'application
Métrical Pro

## 2. Concept de base
Développer une application web professionnelle et intuitive, destinée aux ingénieurs, techniciens, et étudiants en génie civil. L'application doit fournir des outils de calcul rapides et précis pour le métré des ouvrages de construction (gros œuvre), incluant le béton, la maçonnerie, les enduits et les aciers.

## 3. Pile Technologique
- **Framework :** Next.js avec App Router
- **Langage :** TypeScript
- **Style :** Tailwind CSS
- **Composants UI :** ShadCN/UI
- **Icônes :** Lucide React

## 4. Guide de Style et Design
- **Palette de couleurs :**
    - **Primaire :** Un bleu doux et professionnel (`#77B5FE`) pour les éléments interactifs et les icônes.
    - **Arrière-plan :** Un gris très clair, presque blanc (`#F0F8FF`), pour un fond neutre et lisible.
    - **Accentuation :** Un orange vibrant (`#FFA500`) pour les résultats clés, les totaux et les boutons d'appel à l'action importants.
- **Typographie :** Utiliser la police 'Inter'.
- **Layout :**
    - Centré, avec une largeur maximale pour le contenu principal.
    - Utiliser des `Card` (cartes) de ShadCN pour regrouper les sections logiques.
    - Doit être entièrement **responsive** et s'adapter parfaitement aux écrans mobiles, tablettes et ordinateurs de bureau.
    - Utiliser des ombres subtiles et des coins arrondis pour donner une apparence moderne et professionnelle.

## 5. Structure de la Page et Fonctionnalités

### A. En-tête
- Afficher le logo de l'application et le nom "Métrical".
- Un sous-titre décrivant la mission de l'app : "Calculez facilement et avec précision le métré de vos ouvrages."

### B. Système d'Onglets Principal
Un composant `Tabs` de ShadCN pour naviguer entre les différents calculateurs :
1.  **Calcul de Volume** (Béton)
2.  **Calcul Maçonnerie**
3.  **Enduits & Finitions**
4.  **Calcul Aciers**
5.  **DQE** (Devis Quantitatif Estimatif)

### C. Détail des Fonctionnalités par Onglet

#### 1. Calcul de Volume (Béton)
- **Objectif :** Estimer le volume de béton et les matériaux nécessaires.
- **Organisation :** Permettre à l'utilisateur d'ajouter plusieurs "parcs d'ouvrages", chacun avec un dosage de béton différent (ex: béton de propreté, béton pour poteaux).
- **Champs par "parc d'ouvrage" :**
    - Un sélecteur pour le **dosage** (150, 250, 350 kg/m³, etc.).
    - Une liste de **composants** (fondations, poutres, etc.) que l'utilisateur peut ajouter dynamiquement.
- **Champs par composant :**
    - Nom du composant (ex: "Semelle S1").
    - Forme : **Rectangulaire** ou **Cylindrique**.
    - Dimensions : Longueur, Largeur, Hauteur (pour rectangle) ou Diamètre, Hauteur (pour cylindre).
    - Quantité.
- **Calculs et Affichage :**
    - Afficher le sous-total du volume pour chaque composant.
    - Dans un panneau de résultats "sticky" (qui reste visible au défilement) :
        - Afficher le **volume total de béton** pour tous les ouvrages.
        - Afficher le **total des matériaux requis** : ciment (en sacs de 50kg), sable (m³), gravier (m³), et eau (litres).
    - Afficher également un récapitulatif par type de dosage.

#### 2. Calcul Maçonnerie
- **Objectif :** Estimer la quantité de blocs/briques pour des murs.
- **Champs de saisie :**
    - Dimensions d'un bloc standard : Longueur, Hauteur, Épaisseur.
    - Une liste de **murs** que l'utilisateur peut ajouter dynamiquement.
- **Champs par mur :**
    - Nom (ex: "Mur Façade Ouest").
    - Longueur et Hauteur.
- **Calculs et Affichage :**
    - Dans un panneau de résultats "sticky" :
        - Afficher la **surface totale** des murs.
        - Afficher le **nombre total de blocs** nécessaires.
        - Fournir une aide indiquant le nombre de blocs par m².

#### 3. Enduits & Finitions
- **Objectif :** Calculer les matériaux pour les enduits et l'étanchéité, en se basant sur la surface calculée dans l'onglet Maçonnerie.
- **Structure :** Divisé en deux sous-calculateurs.
    - **Calcul d'Enduit :**
        - Champs : Type d'enduit (dosage) et épaisseur.
        - Calculs : Volume d'enduit, quantité de ciment et de sable.
    - **Calcul d'Étanchéité :**
        - Champs : Consommation du produit (kg/m²) et nombre de couches.
        - Permettre l'ajout de **surfaces manuelles** supplémentaires (ex: dalles).
        - Calculs : Quantité totale de produit d'étanchéité en kg.
- **Note Importante :** Afficher un message clair indiquant que ces calculs dépendent de la surface définie dans l'onglet Maçonnerie.

#### 4. Calcul Aciers
- **Objectif :** Estimer le poids d'acier pour des éléments en béton armé.
- **Organisation :** Permettre d'ajouter plusieurs ouvrages (poutre, poteau, semelle).
- **Champs par ouvrage :**
    - Nom, type, forme (rectangulaire/circulaire), dimensions, quantité.
    - **Aciers longitudinaux :** Diamètre et nombre de barres.
    - **Aciers transversaux :** Type (étrier/épingle), diamètre, espacement.
    - Enrobage.
- **Calculs et Affichage :**
    - Panneau de résultats "sticky" affichant :
        - Le **poids total d'acier**.
        - Un **détail par diamètre**, montrant le poids et le nombre de barres commerciales (12m) requis pour chaque diamètre.

#### 5. DQE (Devis Quantitatif Estimatif)
- **Objectif :** Centraliser tous les calculs pour générer un devis.
- **État Actuel :** Section placeholder indiquant que la fonctionnalité est en cours de développement.

### D. Autres Sections
- **Récapitulatif des fonctionnalités :** Un accordéon en bas de page qui décrit ce que chaque calculateur peut faire.
- **Avertissement :** Un accordéon qui précise que l'application est une aide à l'estimation et ne remplace pas une étude professionnelle.
- **Section Suggestions :** Un formulaire permettant aux utilisateurs de laisser leur nom et un commentaire public pour améliorer l'application. Les suggestions soumises doivent s'afficher sur la page.
- **Pied de page :** Une brève description de l'auteur et du but de l'application.