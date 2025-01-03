export type TaskDifficulty = 'Lehké' | 'Střední' | 'Těžké';

export interface Task {
  id: string;
  title: string;
  description: string;
  hint: string;
  showHint: boolean;
  difficulty: TaskDifficulty;
}

export interface Category {
  letter: string;
  title: string;
  description: string;
  tasks: Task[];
}

export type Categories = Record<string, Category>;

export type CompletedTasks = Record<string, boolean>;

export interface TaskManagementFunctions {
  toggleTask: (taskId: string) => void;
  getCompletionRate: (tasks: Task[] | number, categoryLetter?: string | null) => number;
  hasCompletedTasks: (categoryLetter: string) => boolean;
}

export type TaskToggleFunction = TaskManagementFunctions['toggleTask'];
export type CompletionRateFunction = TaskManagementFunctions['getCompletionRate'];
export type HasCompletedTasksFunction = TaskManagementFunctions['hasCompletedTasks'];

export type CategoryLetter = Category['letter'];
export type TaskId = Task['id'];