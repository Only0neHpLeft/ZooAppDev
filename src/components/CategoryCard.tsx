import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useTaskCompletion } from '../hooks/useTaskCompletion';
import { isCategoryAccessible } from '../utils/categoryUtils';
import { ROUTES } from '../navigation';

interface CategoryCardProps {
  id: string | number;
  letter: string;
  description: string;
  tasks: number;
  isBonus?: boolean;
}

interface CardStyleProps {
  isAccessible: boolean;
  isBonus?: boolean;
}

interface CategoryProgressProps {
  completionRate: number;
  isCompleted: boolean;
}

const COMPLETION_THRESHOLD = 100;

const CardWrapper: React.FC<{ isAccessible: boolean; letter: string; children: React.ReactNode }> = ({
  isAccessible,
  letter,
  children
}) => {
  if (!isAccessible) {
    return <div className="cursor-not-allowed">{children}</div>;
  }
  return <Link to={ROUTES.CATEGORY_DETAIL(letter)} className="block">{children}</Link>;
};

const LockedOverlay: React.FC = () => (
  <div className="absolute inset-0 rounded-xl bg-slate-900/80 flex items-center justify-center">
    <div className="text-center">
      <Lock className="w-6 h-6 text-slate-500 mx-auto mb-2" />
      <span className="text-sm text-slate-500">Dokončete předchozí kategorii</span>
    </div>
  </div>
);

const CategoryProgress: React.FC<CategoryProgressProps> = ({ completionRate, isCompleted }) => (
  <div className="mt-auto space-y-2">
    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          isCompleted
            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
            : 'bg-gradient-to-r from-indigo-500 to-purple-500'
        }`}
        style={{ width: `${completionRate}%` }}
      />
    </div>
    <span
      className={`text-xs font-medium block ${
        isCompleted ? 'text-emerald-500' : 'text-slate-400'
      }`}
    >
      {isCompleted ? 'Dokončeno!' : `${Math.round(completionRate)}% Splněno`}
    </span>
  </div>
);

const TaskCount: React.FC<{ tasks: number; isBonus?: boolean }> = ({ tasks, isBonus }) => (
  <div className="space-x-2">
    {isBonus && (
      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-400 border-indigo-500/20 border">
        Bonus
      </span>
    )}
    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-400 border-slate-700 border">
      {tasks} {tasks === 1 ? 'Úkol' : tasks >= 2 && tasks <= 4 ? 'Úkoly' : 'Úkolů'}
    </span>
  </div>
);

const getCardStyles = ({ isAccessible, isBonus }: CardStyleProps) => {
  const baseStyles = 'relative flex flex-col h-44 p-5 rounded-xl border';
  const accessibilityStyles = isAccessible
    ? `border-slate-800 hover:border-slate-700 ${
        isBonus
          ? 'bg-gradient-to-br from-slate-900/80 via-indigo-950/30 to-purple-950/30'
          : 'bg-slate-900/80'
      }`
    : 'bg-slate-900/80 border-slate-800/50';
  const hoverStyles = isAccessible ? 'hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1' : '';

  return `${baseStyles} ${accessibilityStyles} group ${hoverStyles}`;
};

const CategoryCard: React.FC<CategoryCardProps> = ({
  letter,
  description,
  tasks,
  isBonus = false
}) => {
  const { getCompletionRate, hasCompletedTasksInCategory } = useTaskCompletion();

  const cardData = useMemo(() => {
    const completionRate = getCompletionRate(tasks, letter);
    const isCompleted = completionRate === COMPLETION_THRESHOLD;
    const hasCompleted = hasCompletedTasksInCategory(letter);
    const isAccessible = isCategoryAccessible(letter, getCompletionRate);

    return {
      completionRate,
      isCompleted,
      hasCompleted,
      isAccessible
    };
  }, [getCompletionRate, hasCompletedTasksInCategory, letter, tasks]);

  const { completionRate, isCompleted, hasCompleted, isAccessible } = cardData;

  return (
    <CardWrapper isAccessible={isAccessible} letter={letter}>
      <div className={getCardStyles({ isAccessible, isBonus })}>
        {isAccessible ? (
          <>
            <div className="flex justify-between items-start">
              <div className="relative">
                {isBonus && <div className="absolute inset-0 bg-indigo-500/20 blur-2xl" />}
                <h2
                  className={`
                    text-5xl font-bold leading-none mb-3 relative
                    ${
                      isBonus
                        ? 'bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent'
                        : 'bg-gradient-to-br from-slate-200 to-slate-400 bg-clip-text text-transparent'
                    }
                    transition-transform duration-500 group-hover:scale-110 origin-left
                  `}
                >
                  {letter}
                </h2>
              </div>
              <TaskCount tasks={tasks} isBonus={isBonus} />
            </div>

            <p className="text-sm leading-relaxed mb-6 line-clamp-2 transition-colors text-slate-400 group-hover:text-slate-300">
              {description}
            </p>

            {hasCompleted && (
              <CategoryProgress completionRate={completionRate} isCompleted={isCompleted} />
            )}

            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5" />
            </div>
          </>
        ) : (
          <LockedOverlay />
        )}
      </div>
    </CardWrapper>
  );
};

export default CategoryCard;