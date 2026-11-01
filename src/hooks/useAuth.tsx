import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Profile } from '../types/database.types';
import { api, post, TOKEN_KEY } from '../lib/api';

type AuthResult = { access_token: string; profile: Profile };

interface AuthContextType {
  user: { id: string } | null;
  profile: Profile | null;
  session: { access_token: string } | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<Profile>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  signIn: async () => { throw new Error('AuthProvider missing'); },
  changePassword: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api<Profile>('/api/auth/me')
      .then(setProfile)
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setToken(null); })
      .finally(() => setLoading(false));
    // Only on mount: later token changes come with a fresh profile.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accept = (result: AuthResult) => {
    localStorage.setItem(TOKEN_KEY, result.access_token);
    setToken(result.access_token);
    setProfile(result.profile);
    return result.profile;
  };

  const signIn = async (email: string, password: string) =>
    accept(await post<AuthResult>('/api/auth/login', { email, password }));

  const changePassword = async (currentPassword: string, newPassword: string) => {
    accept(await post<AuthResult>('/api/auth/change-password', { current_password: currentPassword, new_password: newPassword }));
  };

  const signOut = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: profile ? { id: profile.id } : null,
        profile,
        session: token ? { access_token: token } : null,
        isLoading,
        signOut,
        signIn,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
