"use client"

import { useEffect, useState } from 'react';
import App from './client/app';
import { LoginGoogle } from './client/google-login';

export default () => {
  const [ darkMode, setDarkMode ] = useState<boolean | null>(null);
  const [ token, setToken ] = useState('');
  const success = (input : string) => setToken(input);

  useEffect(() => {
    if (darkMode === null) {
      let preDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const storedDark = window.localStorage.getItem('darkMode');
      if (storedDark) {
        preDark = eval(storedDark);
      }
      setDarkMode(preDark);
      return;
    }
    window.localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [ darkMode ]);

  return token ? <App token={token} darkMode={darkMode} setDarkMode={setDarkMode} /> : (
    <LoginGoogle login={success} denied={token === null} />
  );
};
