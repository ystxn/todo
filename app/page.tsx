"use client"

import { useEffect, useState } from 'react';
import App from './app';
import { LoginGoogle } from './google-login';

export default () => {
  const [ email, setEmail ] = useState('');
  const success = (input : string) => {
    window.localStorage.setItem('email', input);
    setEmail(input);
  };

  useEffect(() => {
    if (window.localStorage.getItem('email')) {
      setEmail(window.localStorage.getItem('email') as string);
    }
  }, []);

  return email ? <App email={email} /> : (
    <LoginGoogle login={success} denied={email === null} />
  );
};
