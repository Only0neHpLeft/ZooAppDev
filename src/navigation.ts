export const ROUTES = {
  ROOT: '/',
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: (id: string) => `/categories/${id}`,
  CATEGORY_TASK: (id: string, taskId: string) => `/categories/${id}/task/${taskId}`,
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  DASHBOARD: '/dashboard'
} as const;

export const PAGE_TITLES: Record<string, string> = {
  [ROUTES.ROOT]: 'Sbírka Úkolů',
  [ROUTES.CATEGORIES]: 'Sbírka Úkolů',
  [ROUTES.SETTINGS]: 'Nastavení',
  [ROUTES.NOTIFICATIONS]: 'Oznámení',
  DEFAULT: 'Detail Kategorie'
} as const;

export type Routes = typeof ROUTES;