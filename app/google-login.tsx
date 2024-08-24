
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';

interface LoginGoogleProps {
    login: (email : string) => void;
    denied: boolean;
}
export function LoginGoogle({
  login, denied
} : LoginGoogleProps) {
  function handleError() {
    console.error('Failed to sign in with Google.');
  }

  function handleSuccess(creds : any) {
    const plaintext = decode(creds.credential);
    if (!plaintext) {
      return;
    }
    const payload = JSON.parse(plaintext);
    login(payload.email);
  }
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('Invalid/Missing environment variable: "NEXT_PUBLIC_GOOGLE_CLIENT_ID"');
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div
        style={{
          display: 'flex',
          flexFlow: 'column nowrap',
          alignItems: 'center',
          margin: '5rem auto',
          textAlign: 'center',
        }}
      >
        <h2>Please sign in to your Google account</h2>
        {denied ? (<em>Not authorised</em>) : (
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
          ></GoogleLogin>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

function decode(jwt : string) {
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    return '';
  }
  return window.atob(parts[1]);
}
