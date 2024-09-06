"use client"

import { useEffect, useState } from 'react';
import App from './client/app';
import { LoginGoogle } from './client/google-login';

const decodeJWT = (jwt: string) => {
  const parts = jwt.split('.');
  return (parts.length !== 3) ? '' : JSON.parse(Buffer.from(parts[1], 'base64').toString());
};

const Loading = () => (
  <div className="flex flex-1 self-center flex-col items-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-e-transparent text-white">
    </div>
  </div>
);

export default () => {
  const [ loading, setLoading ] = useState(true);
  const [ darkMode, setDarkMode ] = useState<boolean | null>(null);
  const [ token, setToken ] = useState('');
  const success = (input : string) => {
    window.localStorage.setItem('token', input);
    setToken(input);
  };

  useEffect(() => {
    const tokenString = window.localStorage.getItem('token');
    if (!tokenString) {
      setLoading(false);
      return;
    }
    const token = decodeJWT(tokenString);
    if ((new Date().getTime()) < (token.exp * 1000)) {
      setToken(tokenString);
    } else {
      window.localStorage.removeItem('token');
    }
    setLoading(false);
  }, []);

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

  if (loading) {
    return <Loading />;
  } else if (token) {
    return <App token={token} darkMode={darkMode} setDarkMode={setDarkMode} />;
  } else {
    return <LoginGoogle login={success} denied={token === null} />;
  }
};
