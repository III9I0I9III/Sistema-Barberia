import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiService } from "../services/api";
import { AuthContextType, User } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiService.getProfile();

        if (data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem("token");
        }

      } catch {
        localStorage.removeItem("token");
      }

      setLoading(false);
    };

    initSession();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const data = await apiService.login(email, password);

    if (data.token && data.user) {
      localStorage.setItem("token", data.token);
      setUser(data.user);
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<void> => {

    const data = await apiService.register(name, email, password, phone);

    if (data.token && data.user) {
      localStorage.setItem("token", data.token);
      setUser(data.user);
    }
  };

  const logout = (): void => {
    apiService.logout();
    setUser(null);
  };

  const updateProfile = (data: Partial<User>): void => {
    setUser(prev => {
      if (!prev) return prev; // 😈 Protección contra null
      return { ...prev, ...data };
    });
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await apiService.changePassword(currentPassword, newPassword);
  };

  const deleteAccount = async (): Promise<void> => {
    await apiService.deleteAccount();
    setUser(null);
  };

  if (loading) return <div className="loading-screen">Cargando sesión...</div>;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
