import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect } from 'react';
import { decodeJWT } from './util';

interface LoginGoogleProps {
  login: (email : string) => void;
  denied: boolean;
};

export const LoginGoogle = ({
  login, denied
} : LoginGoogleProps) => {
  const handleError = () => {
    console.error('Failed to sign in with Google.');
  };

  const handleSuccess = (creds : CredentialResponse) => {
    if (!creds.credential) {
      return;
    }
    window.localStorage.setItem('token', creds.credential);
    login(creds.credential);
  };

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('Invalid/Missing environment variable: "NEXT_PUBLIC_GOOGLE_CLIENT_ID"');
  }

  useEffect(() => {
    const tokenString = window.localStorage.getItem('token');
    if (!tokenString) {
      return;
    }
    const token = decodeJWT(tokenString);
    if ((new Date().getTime()) < (token.exp * 1000)) {
      login(tokenString);
    }
  }, []);

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
};
