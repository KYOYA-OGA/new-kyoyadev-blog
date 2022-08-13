export const setDarkThemeByDefault = () => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    console.log('Hi! dark theme');
    document.documentElement.classList.add('dark');
  }
};

export const setTheme = () => {
  const getTheme = ((): string | null => {
    if (
      typeof window.localStorage !== 'undefined' &&
      localStorage.getItem('theme')
    ) {
      return localStorage.getItem('theme');
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  })();

  if (getTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
  }
  if (getTheme !== null) {
    window.localStorage.setItem('theme', getTheme);
  }
};
