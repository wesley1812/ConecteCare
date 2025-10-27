import { createContext, useContext, useState } from "react";

interface AuthContextProps {
  user: string | null;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

interface AuthProviderPRops {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderPRops) {
  const [user, setUser] = useState<string | null>(() => {
    return localStorage.getItem("user");
  });

  function login(username: string) {
    setUser(username);
    localStorage.setItem("user", username);
  }

  function logout() {
    localStorage.removeItem("user");
    setUser(null); 
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}