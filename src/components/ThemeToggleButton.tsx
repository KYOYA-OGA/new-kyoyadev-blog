import { useEffect, useState } from 'react';
import type { Theme } from 'src/types';

export default function ThemeToggleButton() {
  const [theme, setTheme] = useState<Theme | undefined>(undefined);

  const getCurrentTheme = (): Theme => {
    if (
      (typeof localStorage.getItem('theme') === 'string' &&
        localStorage.getItem('theme') === 'dark') ||
      (typeof window.localStorage.getItem('theme') !== 'string' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      return 'dark';
    } else {
      return 'light';
    }
  };

  useEffect(() => {
    const currentTheme = getCurrentTheme();
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex-shrink-0 leading-tight text-xl md:text-2xl bg-gray-400 p-2 lg:py-2 lg:px-3 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      {theme === 'light' ? '🌙' : '🌞'}
    </button>
  );
}
