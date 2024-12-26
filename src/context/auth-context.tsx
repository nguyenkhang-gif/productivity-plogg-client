// auth-context.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthData {
  token: string | null;
  user: any | null;
}

interface AuthContextType {
  authData: AuthData;
  setAuthData: (data: AuthData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AuthProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [authData, setAuthData] = useState<AuthData>({
    token: null,
    user: null,
  });

  const logout = () => {
    setAuthData({ token: null, user: null });
    localStorage.removeItem("token"); // Xóa token khỏi localStorage
  };

  return (
    <AuthContext.Provider value={{ authData, setAuthData, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
