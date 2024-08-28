export const decodeJWT = (jwt: string) => {
  const parts = jwt.split('.');
  return (parts.length !== 3) ? '' : JSON.parse(Buffer.from(parts[1], 'base64').toString());
};
