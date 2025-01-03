import { useState, useEffect, useCallback } from 'react';
import { categories } from '../data/tasks';
import { useNotifications } from '../contexts/NotificationContext';
import {
  CompletedTasks,
  TaskToggleFunction,
  CompletionRateFunction,
  HasCompletedTasksFunction,
} from '../data/types';

const STORAGE_KEYS = {
  COMPLETED_TASKS: 'completed_tasks',
  COMPLETED_CATEGORIES: 'completed_categories'
} as const;

interface StorageItem<T> {
  key: string;
  defaultValue: T;
}

const getStoredValue = <T,>({ key, defaultValue }: StorageItem<T>): T => {
  try {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const getCategoryByLetter = (letter: string) => 
  Object.values(categories).find(cat => cat.letter === letter);

const getNextCategoryLetter = (currentLetter: string): string => 
  String.fromCharCode(currentLetter.charCodeAt(0) + 1);

const createUnlockNotification = (currentLetter: string, nextLetter: string) => ({
  id: `unlock_${nextLetter}_${Date.now()}`,
  title: `Kategorie ${nextLetter} odemčena!`,
  message: `Dokončili jste kategorii ${currentLetter} a odemkli jste novou kategorii ${nextLetter}. Pokračujte ve svém postupu!`,
  type: 'unlock' as const,
  categoryLetter: nextLetter
});

const calculateCompletionRate = (completed: number, total: number): number =>
  total === 0 ? 0 : (completed / total) * 100;

export const useTaskCompletion = () => {
  const { addNotification } = useNotifications();

  const [completedTasks, setCompletedTasks] = useState<CompletedTasks>(() =>
    getStoredValue({ key: STORAGE_KEYS.COMPLETED_TASKS, defaultValue: {} })
  );

  const [completedCategories, setCompletedCategories] = useState<string[]>(() =>
    getStoredValue({ key: STORAGE_KEYS.COMPLETED_CATEGORIES, defaultValue: [] })
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify(completedTasks));
  }, [completedTasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_CATEGORIES, JSON.stringify(completedCategories));
  }, [completedCategories]);

  const handleCategoryCompletion = useCallback((categoryLetter: string, isCompleted: boolean) => {
    if (isCompleted && !completedCategories.includes(categoryLetter)) {
      const nextLetter = getNextCategoryLetter(categoryLetter);
      
      if (Object.values(categories).some(cat => cat.letter === nextLetter)) {
        setCompletedCategories(prev => [...prev, categoryLetter]);
        addNotification(createUnlockNotification(categoryLetter, nextLetter));
      }
    }
  }, [completedCategories, addNotification]);

  const toggleTaskCompletion = useCallback<TaskToggleFunction>((taskId: string) => {
    setCompletedTasks(prev => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      const categoryLetter = taskId.charAt(0).toUpperCase();
      const category = getCategoryByLetter(categoryLetter);

      if (category) {
        const allTasksCompleted = category.tasks.every(task => 
          task.id === taskId ? !prev[taskId] : updated[task.id]
        );
        handleCategoryCompletion(categoryLetter, allTasksCompleted);
      }

      return updated;
    });
  }, [handleCategoryCompletion]);

  const getCompletionRate = useCallback<CompletionRateFunction>((tasks, categoryLetter = null) => {
    if (!tasks) return 0;

    if (Array.isArray(tasks)) {
      const completedCount = tasks.filter(task => completedTasks[task.id]).length;
      return calculateCompletionRate(completedCount, tasks.length);
    }

    if (typeof tasks === 'number' && categoryLetter) {
      const completedCount = Object.entries(completedTasks)
        .filter(([taskId, isCompleted]) => 
          taskId.toLowerCase().startsWith(categoryLetter.toLowerCase()) && isCompleted
        ).length;
      return calculateCompletionRate(completedCount, tasks);
    }

    return 0;
  }, [completedTasks]);

  const hasCompletedTasksInCategory = useCallback<HasCompletedTasksFunction>((categoryLetter) => {
    return Object.entries(completedTasks)
      .some(([taskId, isCompleted]) => 
        taskId.toLowerCase().startsWith(categoryLetter.toLowerCase()) && isCompleted
      );
  }, [completedTasks]);

  return {
    completedTasks,
    toggleTaskCompletion,
    getCompletionRate,
    hasCompletedTasksInCategory,
  };
};