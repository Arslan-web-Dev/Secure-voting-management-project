// Application Constants

// API Configuration
export const SUPABASE_CONFIG = {
  URL: import.meta.env.VITE_SUPABASE_URL || 'https://ljahemnijeldzqflpxejn.supabase.co',
  ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
} as const;

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ELECTION_CREATOR: 'election_creator',
  VOTER: 'voter',
} as const;

// Election Status
export const ELECTION_STATUS = {
  DRAFT: 'draft',
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  REGISTRATION_CLOSED: 'registration_closed',
  COMPLETED: 'completed',
} as const;

// Request Status
export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// Time Formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm:ss';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// Theme
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  THEME: 'secure-vote-theme',
  AUTH_TOKEN: 'secure-vote-auth',
  USER_PREFERENCES: 'secure-vote-preferences',
} as const;

// API Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Please log in to continue',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Please check your input and try again',
  SERVER_ERROR: 'Something went wrong. Please try again later',
  NETWORK_ERROR: 'Network error. Please check your connection',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully',
  CREATED: 'Created successfully',
  DELETED: 'Deleted successfully',
  UPDATED: 'Updated successfully',
  SUBMITTED: 'Submitted successfully',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  CREATOR: '/creator',
  VOTER: '/voter',
} as const;
