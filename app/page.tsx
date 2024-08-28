"use client"

import { useState } from 'react';
import App from './app';
import { LoginGoogle } from './google-login';

export default () => {
  const [ token, setToken ] = useState('');
  const success = (input : string) => {
    setToken(input);
  };

  return token ? <App token={token} /> : (
    <LoginGoogle login={success} denied={token === null} />
  );
};
