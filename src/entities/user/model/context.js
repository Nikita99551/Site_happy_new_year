import { createContext, useContext } from 'react';

export const SessionContext = createContext(null);

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession можно вызывать только внутри SessionProvider');
  return ctx;
}
