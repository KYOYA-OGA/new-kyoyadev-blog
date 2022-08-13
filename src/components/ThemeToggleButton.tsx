// import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
// import { currentTheme, toggleTheme } from 'src/store/themeStore';
import type { Theme } from 'src/types';

export default function ThemeToggleButton() {
  const [theme, setTheme] = useState<Theme | undefined>(undefined);

  const getCurrentTheme = (): Theme => {
    if (
      typeof localStorage.getItem('theme') === 'string' &&
      localStorage.getItem('theme') === 'dark'
    ) {
      return 'dark';
    } else {
      return 'light';
    }
  };

  // const setThemePersistent = (theme: Theme) => {
  //   document.documentElement.classList.add('dark');
  //   localStorage.removeItem('theme');
  //   localStorage.setItem('theme', 'dark');
  // };

  useEffect(() => {
    setTheme(getCurrentTheme());
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
