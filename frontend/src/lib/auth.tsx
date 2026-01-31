import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { API_URL } from "@/config";

export interface User {
  username: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGitHub: () => void;
  signOut: () => void;
  token: string | null;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setTokenState(storedToken);
        try {
          // Verify token and get user details from backend
          const response = await fetch(`${API_URL}/api/user/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token invalid or expired
            localStorage.removeItem("token");
            setTokenState(null);
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
          localStorage.removeItem("token");
          setTokenState(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const setToken = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setTokenState(newToken);
    // Optionally trigger a user fetch here or rely on page reload/effect
    // For smoother UX, we can manually fetch user immediately
    fetch(`${API_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${newToken}` }
    }).then(res => res.json()).then(data => setUser(data)).catch(() => { });
  };

  const signInWithGitHub = () => {
    window.location.href = `${API_URL}/oauth2/authorization/github`;
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGitHub, signOut, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
