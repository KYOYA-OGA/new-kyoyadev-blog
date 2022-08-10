import { MenuIcon, XIcon } from '@heroicons/react/outline';
import { useEffect, useState } from 'react';
import type { Theme } from 'src/types';
import Container from './Container';
import SocialIcons from './SocialIcons';
import ThemeToggleButton from './ThemeToggleButton';

// import ThemeToggleButton from './ThemeToggleButton';

export default function Header() {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleMenuClick = () => {
    setMenuIsOpen(!menuIsOpen);
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  return (
    <div className="overflow-hidden">
      <header className="py-5 md:py-5 shadow relative z-20">
        <Container>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight">
              <a href="/">KyoyaDev Blog</a>
            </h2>
            <div className="flex items-center space-x-5">
              <ThemeToggleButton theme={theme} onClick={handleThemeToggle} />
              <button onClick={handleMenuClick}>
                {menuIsOpen ? (
                  <XIcon className="w-10 h-10" />
                ) : (
                  <MenuIcon className="w-10 h-10" />
                )}
              </button>
            </div>
          </div>
        </Container>
      </header>
      <nav
        className={`z-10 fixed top-0 right-0 h-screen w-1/2 max-w-md lg:w-1/6 bg-gray-500 text-soft-white transition-transform ${
          menuIsOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <ul className="px-3 py-20 space-y-5 text-center text-xl">
          <li>
            <a className="hover:opacity-80 transition-opacity" href="/blogs">
              Blogs
            </a>
          </li>
          <li>
            <a className="hover:opacity-80 transition-opacity" href="/about">
              About
            </a>
          </li>
          <li>
            <a className="hover:opacity-80 transition-opacity" href="/projects">
              Projects
            </a>
          </li>
          <li>
            <a className="hover:opacity-80 transition-opacity" href="/contact">
              Contact
            </a>
          </li>
        </ul>
        <SocialIcons />
      </nav>
    </div>
  );
}
