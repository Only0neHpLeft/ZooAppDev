import { categories } from '../data/tasks';

type CompletionRateFunction = (taskCount: number, letter: string) => number;

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' as const;
const FIRST_CATEGORY = 'A' as const;

export const getPreviousCategoryLetter = (letter: string): string | null => {
  const index = ALPHABET.indexOf(letter);
  return index > 0 ? ALPHABET[index - 1] : null;
};

export const isCategoryAccessible = (
  letter: string,
  getCompletionRate: CompletionRateFunction
): boolean => {
  if (letter === FIRST_CATEGORY) return true;

  const previousLetter = getPreviousCategoryLetter(letter);
  if (!previousLetter) return false;

  const previousCategory = Object.values(categories).find(
    (category) => category.letter === previousLetter
  );
  
  if (!previousCategory) return false;

  const COMPLETION_THRESHOLD = 100;
  const previousCategoryCompletion = getCompletionRate(
    previousCategory.tasks.length, 
    previousLetter
  );
  
  return previousCategoryCompletion === COMPLETION_THRESHOLD;
};

export type { CompletionRateFunction };