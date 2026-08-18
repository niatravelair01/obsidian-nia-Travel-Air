import { createContext, useContext, ReactNode } from "react";

interface AuthContextType {
  user: { id: string } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  // MVP mode: no auth, always "logged in"
  return (
    <AuthContext.Provider value={{ user: { id: "mvp" }, loading: false, signOut: async () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}
