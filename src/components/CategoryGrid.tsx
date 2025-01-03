import React from 'react';
import CategoryCard from './CategoryCard';

interface Category {
  id: number;
  letter: string;
  description: string;
  tasks: number;
  isBonus: boolean;
}

interface CategoryData {
  description: string;
  tasks: number;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BONUS_LETTERS = ['F', 'I', 'L', 'O', 'T', 'W', 'Z'] as const;
const RESPONSIVE_GRID_CLASSES = 
  'grid grid-cols-4 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-6';

const CATEGORY_DATA: Record<string, CategoryData> = {
  'A': {
    description: "Základní dotazy pro seznámení s databází. Naučte se zobrazovat a filtrovat data o zvířatech.",
    tasks: 4
  },
  'B': {
    description: "Vyhledávání specifických zvířat. Zaměřeno na slony a další zajímavé druhy.",
    tasks: 3
  },
  'C': {
    description: "Objevte nejlehčí a nejtěžší zvířata v ZOO. Naučte se pracovat s řazením dat.",
    tasks: 3
  },
  'D': {
    description: "Pokročilé filtrování dat. Prozkoumejte váhové kategorie a jmenné vzory.",
    tasks: 3
  },
  'E': {
    description: "Kombinované dotazy s datumy a váhou. Najděte zvířata podle různých kritérií.",
    tasks: 3
  },
  'F': {
    description: "Bonusový úkol! Prozkoumejte nejtěžší zvířata v ZOO pomocí poddotazů.",
    tasks: 1
  },
  'G': {
    description: "Spojování tabulek. Objevte vztahy mezi zvířaty a jejich ošetřovateli.",
    tasks: 3
  },
  'H': {
    description: "Práce s preferencemi ošetřovatelů. Zjistěte, kdo se stará o jaká zvířata.",
    tasks: 3
  },
  'I': {
    description: "Bonusový úkol! Porovnání věku ošetřovatelů s váhou zvířat.",
    tasks: 1
  },
  'J': {
    description: "Agregační funkce. Spočítejte statistiky o zvířatech a ošetřovatelích.",
    tasks: 3
  },
  'K': {
    description: "Vztahy mezi zvířaty a ošetřovateli. Kdo má rád jaká zvířata?",
    tasks: 3
  },
  'L': {
    description: "Bonusové úkoly! Zamyslete se nad složitějšími aspekty SQL dotazů.",
    tasks: 2
  },
  'M': {
    description: "Statistické dotazy. Průměrné váhy a počty zvířat.",
    tasks: 3
  },
  'N': {
    description: "Skupinové operace. Analýza druhů a jejich charakteristik.",
    tasks: 3
  },
  'O': {
    description: "Bonusové úkoly! Pokročilé výpočty s oblíbenými zvířaty.",
    tasks: 2
  },
  'P': {
    description: "Komplexní dotazy s více tabulkami. Analýza vztahů v ZOO.",
    tasks: 4
  },
  'Q': {
    description: "Statistické analýzy. Průměrné váhy a počty krmení.",
    tasks: 3
  },
  'R': {
    description: "Negativní dotazy. Kdo nemá rád jaká zvířata?",
    tasks: 3
  },
  'S': {
    description: "Analýza vztahů. Zvířata a jejich ošetřovatelé.",
    tasks: 3
  },
  'T': {
    description: "Bonusový úkol! Najděte zvířata se speciální péčí.",
    tasks: 1
  },
  'U': {
    description: "Hledání extrémů. Nejlehčí a nejstarší zvířata.",
    tasks: 3
  },
  'V': {
    description: "Pokročilé analýzy dat. Vztahy mezi zvířaty a ošetřovateli.",
    tasks: 3
  },
  'W': {
    description: "Bonusový úkol! Speciální statistická analýza.",
    tasks: 1
  },
  'X': {
    description: "Časové analýzy. Narození zvířat a další statistiky.",
    tasks: 3
  },
  'Y': {
    description: "Komplexní dotazy s negací. Kdo neošetřuje jaká zvířata?",
    tasks: 3
  },
  'Z': {
    description: "Bonusový úkol! Analýza dnů v týdnu.",
    tasks: 1
  }
} as const;

const generateCategories = (): Category[] => {
  return Array.from(LETTERS).map((letter, index) => ({
    id: index + 1,
    letter,
    description: CATEGORY_DATA[letter].description,
    tasks: CATEGORY_DATA[letter].tasks,
    isBonus: BONUS_LETTERS.includes(letter as typeof BONUS_LETTERS[number])
  }));
};

export const CategoryGrid: React.FC = () => {
  const categories = React.useMemo(() => generateCategories(), []);

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      <div className={RESPONSIVE_GRID_CLASSES}>
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            {...category}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;