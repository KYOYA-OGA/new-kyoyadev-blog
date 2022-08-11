import { persistentAtom } from '@nanostores/persistent';
import { action, atom } from 'nanostores';

export const currentTheme = persistentAtom<string>('theme', 'dark');

export const toggleTheme = action(currentTheme, 'toggleTheme', (store) => {
  const theme = store.get();
  if (theme === 'dark') {
    store.set('light');
  } else {
    store.set('dark');
  }
});
