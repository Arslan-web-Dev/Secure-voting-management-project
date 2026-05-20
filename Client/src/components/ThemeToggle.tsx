import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
      title="Toggle Dark Mode"
    >
      <span className="sr-only">Toggle theme</span>
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-amber-500" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-500" />
      )}
    </button>
  );
}
