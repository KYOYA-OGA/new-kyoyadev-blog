import { MenuIcon, XIcon } from '@heroicons/react/outline/index';
import { useState } from 'react';
import Container from './Container';
import Navbar from './Navbar';
import SocialIcons from './SocialIcons';
import ThemeToggleButton from './ThemeToggleButton';

export default function Header() {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

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
              {/* <ThemeToggleButton /> */}
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
      <Navbar menuIsOpen={menuIsOpen} />
    </>
  );
}
