"use client"

import { useEffect, useState } from 'react';
import App from './app';
import { LoginGoogle } from './google-login';

export default () => {
  const [ email, setEmail ] = useState('');
  const success = (input : string) => {
    window.sessionStorage.setItem('email', input);
    setEmail(input);
  };

  useEffect(() => {
    if (window.sessionStorage.getItem('email')) {
      setEmail(window.sessionStorage.getItem('email') as string);
    }
  }, []);

  return email ? <App email={email} /> : (
      <LoginGoogle login={success} denied={email === null} />
  );
};
