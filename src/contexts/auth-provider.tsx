import type { AuthFormModel } from "@/@types/auth/auth-form-model";
import type { AuthUserDataModel } from "@/@types/auth/auth-user-data-model";
import { authenticate } from "@/http/services/auth.service";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

interface AuthContextProps {
  user: AuthUserDataModel | null;
  login: (credentials: AuthFormModel) => Promise<void>;
  logout: () => void;
  isLogged: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUserDataModel | null>(null);

  const login = async (credentials: AuthFormModel) => {
    try {
      const user = await authenticate(credentials);
      setUser(user.data);
      localStorage.setItem("token", user.data.token)
    } catch (error: any) {
      toast.error(error.message || "Erro ao autenticar");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      setUser({ token } as AuthUserDataModel);
      window.location.href = '/';
    }
  }, [user]);

  console.log(user)


  const logout = () => {
    setUser(null)
    localStorage.removeItem("token")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLogged: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro do AuthProvider");
  return context;
}
