import SocialIcons from './SocialIcons';

interface Props {
  menuIsOpen: boolean;
}

export default function Navbar({ menuIsOpen }: Props) {
  return (
    <nav
      className={`z-10 fixed top-0 right-0 h-screen w-1/2 max-w-xs lg:w-1/5 bg-gray-500/90 text-soft-white transition-transform ${
        menuIsOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <ul className="px-3 pt-24 pb-10 lg:py-28 space-y-5 text-center text-xl">
        <li>
          <a className="hover:opacity-80 transition-opacity" href="/blogs/1">
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
      </ul>
      <SocialIcons />
    </nav>
  );
}
