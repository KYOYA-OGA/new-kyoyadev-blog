import { MenuIcon, XIcon } from '@heroicons/react/outline/index';
import { useEffect, useState } from 'react';
import type { Theme } from 'src/types';
import Container from './Container';
import Navbar from './Navbar';
import ThemeToggleButton from './ThemeToggleButton';

export default function Header() {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme | undefined>(undefined);

  const getCurrentTheme = (): Theme => {
    return (typeof localStorage.getItem('theme') === 'string' &&
      localStorage.getItem('theme') === 'dark') ||
      (typeof window.localStorage.getItem('theme') !== 'string' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark'
      : 'light';
  };

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

  const handleMenuClick = () => {
    setMenuIsOpen(!menuIsOpen);
  };

  return (
    <>
      <header className="py-5 md:py-5 shadow-md relative z-20">
        <Container>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight">
              <a href="/">KyoyaDev Blog</a>
            </h2>
            <div className="flex items-center space-x-5">
              <ThemeToggleButton toggleTheme={toggleTheme} theme={theme} />
              <button aria-label="menu button" onClick={handleMenuClick}>
                {menuIsOpen ? (
                  <>
                    <XIcon className="w-10 h-10" />
                    <span className="sr-only">Close</span>
                  </>
                ) : (
                  <>
                    <MenuIcon className="w-10 h-10" />
                    <span className="sr-only">Open</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Container>
      </header>
      <Navbar menuIsOpen={menuIsOpen} />
      {menuIsOpen ? (
        <div
          className="fixed z-0 inset-0"
          onClick={() => setMenuIsOpen(false)}
        ></div>
      ) : null}
    </>
  );
}
