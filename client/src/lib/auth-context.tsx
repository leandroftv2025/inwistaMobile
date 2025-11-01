import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string | null;
  cpf: string;
}

interface AuthContextType {
  user: User | null;
  login: (userId: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("inwista-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userId: string, userData: User) => {
    setUser(userData);
    localStorage.setItem("inwista-user", JSON.stringify(userData));
    localStorage.setItem("inwista-user-id", userId);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("inwista-user");
    localStorage.removeItem("inwista-user-id");
    localStorage.removeItem("inwista-pending-auth");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function getUserId(): string | null {
  return localStorage.getItem("inwista-user-id");
}
