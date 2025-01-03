import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { categories } from '../data/tasks';
import { useTaskCompletion } from '../hooks/useTaskCompletion';
import type { Task } from '../data/types';
import { ROUTES } from '../navigation';

interface TaskCardProps {
  categoryId: string;
  task: Task;
  isCompleted: boolean;
}

const BONUS_LETTERS = ['F', 'I', 'L', 'O', 'T', 'W', 'Z'] as const;
const LOADING_DELAY = 800;
const CELEBRATION_DURATION = 2000;
const COMPLETION_THRESHOLD = 100;

const BUTTON_BASE_STYLES = 'inline-flex items-center px-4 py-2 rounded-lg transition-all duration-300';
const BACK_BUTTON_STYLES = `${BUTTON_BASE_STYLES} bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 mb-6`;
const DIFFICULTY_STYLES = {
  'Lehké': 'bg-emerald-900/30 text-emerald-400',
  'Střední': 'bg-amber-900/30 text-amber-400',
  'Těžké': 'bg-red-900/30 text-red-400'
} as const;

const TaskCard: React.FC<TaskCardProps> = ({ categoryId, task, isCompleted }) => {
  const navigate = useNavigate();

  const cardStyles = `
    p-6 rounded-xl cursor-pointer transition-all duration-300 border backdrop-blur-sm
    ${isCompleted 
      ? 'bg-emerald-900/20 border-emerald-500/20' 
      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
    }
  `;

  return (
    <div 
      onClick={() => navigate(ROUTES.CATEGORY_TASK(categoryId, task.id))}
      className={cardStyles}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white">{task.title}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${DIFFICULTY_STYLES[task.difficulty]}`}>
          {task.difficulty}
        </span>
      </div>
      
      <p className="text-slate-400">{task.description}</p>
      
      {isCompleted && (
        <div className="mt-4 text-emerald-500 text-sm font-medium">
          ✓ Dokončeno
        </div>
      )}
    </div>
  );
};

const CategoryNotFound: React.FC = () => (
  <div className="max-w-[1400px] mx-auto px-8 py-8">
    <div className="rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-8">
      <h1 className="text-2xl font-bold text-white mb-4">Kategorie nenalezena</h1>
      <p className="text-slate-400 mb-6">
        Omlouváme se, ale požadovaná kategorie nebyla nalezena. Zkuste se vrátit na hlavní stránku.
      </p>
      <Link 
        to={ROUTES.CATEGORIES}
        className={`${BUTTON_BASE_STYLES} bg-gradient-to-r from-indigo-500 to-purple-600 
          text-white text-sm font-medium hover:from-indigo-600 hover:to-purple-700`}
      >
        ← Zpět na přehled kategorií
      </Link>
    </div>
  </div>
);


const useCategoryData = (id: string | undefined) => {
  const navigate = useNavigate();
  const category = id ? 
    Object.values(categories).find(cat => cat.letter === id.toUpperCase()) : 
    null;
  const isBonus = category?.letter && BONUS_LETTERS.includes(category.letter as typeof BONUS_LETTERS[number]);

  React.useEffect(() => {
    if (!category) {
      navigate(ROUTES.CATEGORIES);
    }
  }, [category, navigate]);

  return { category, isBonus };
};

const useLoadingState = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), LOADING_DELAY);
    return () => clearTimeout(timer);
  }, []);

  return isLoading;
};

const useCelebrationEffect = (category: any, isLoading: boolean) => {
  const [showCelebration, setShowCelebration] = React.useState(false);
  const { completedTasks, getCompletionRate } = useTaskCompletion();

  React.useEffect(() => {
    const completionRate = getCompletionRate(category?.tasks || []);
    if (category && completionRate === COMPLETION_THRESHOLD && !isLoading) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), CELEBRATION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [completedTasks, category, isLoading, getCompletionRate]);

  return showCelebration;
};

const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { category, isBonus } = useCategoryData(id);
  const isLoading = useLoadingState();
  const showCelebration = useCelebrationEffect(category, isLoading);
  const { completedTasks } = useTaskCompletion();

  if (!category) {
    return <CategoryNotFound />;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8">
      <div className="mb-8">
        <Link to={ROUTES.CATEGORIES} className={BACK_BUTTON_STYLES}>
          ← Zpět na přehled kategorií
        </Link>
        
        <h1 className={`text-3xl font-bold mb-4 ${
          isBonus 
            ? 'bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent' 
            : 'text-white'
        }`}>
          {category.letter}: {category.title}
        </h1>
        
        <p className="text-lg text-slate-400">{category.description}</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {category.tasks.map((task) => (
          <TaskCard
            key={task.id}
            categoryId={category.letter}
            task={task}
            isCompleted={completedTasks[task.id]}
          />
        ))}
      </div>

      {showCelebration}
    </div>
  );
};

export default CategoryPage;