import type { Theme } from 'src/types';

interface Props {
  theme: Theme;
  onClick: () => void;
}

export default function ThemeToggleButton({ theme, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 leading-tight text-xl md:text-2xl bg-gray-400 p-2 lg:py-2 lg:px-3 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      {theme === 'light' ? '🌙' : '🌞'}
    </button>
  );
}
