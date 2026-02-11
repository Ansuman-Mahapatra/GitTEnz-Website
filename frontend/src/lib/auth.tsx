import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { API_URL } from "@/config";

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export interface User {
  username: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  id?: string;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGitHub: () => void;
  signInWithEmail: (data: any) => Promise<void>;
  signUpWithEmail: (data: any) => Promise<void>;
  signOut: () => void;
  token: string | null;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUser = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem("token");
        setTokenState(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem("token");
    setTokenState(null);
    setUser(null);
    window.location.href = "/login";
  }, []);

  // Sync authentication state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        const newToken = e.newValue;
        if (newToken) {
          setTokenState(newToken);
          fetchUser(newToken);
        } else {
          setTokenState(null);
          setUser(null);
          window.location.href = "/login";
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchUser]);

  // 5-minute inactivity auto-logout
  useEffect(() => {
    if (!user || !token) return;

    const resetTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        if (typeof window !== "undefined") {
          window.alert("Session expired. You have been logged out due to 5 minutes of inactivity. Please log in again.");
        }
        signOut();
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    resetTimer();

    events.forEach((ev) => window.addEventListener(ev, resetTimer));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [user, token, signOut]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setTokenState(storedToken);
        await fetchUser(storedToken);
      }
      setLoading(false);
    };

    initAuth();
  }, [fetchUser]);

  const setToken = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setTokenState(newToken);
    fetchUser(newToken);
  };

  const signInWithGitHub = () => {
    window.location.href = `${API_URL}/oauth2/authorization/github`;
  };

  const signInWithEmail = async (data: any) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Login failed");
    }

    const { token, user } = await res.json();
    setToken(token);
    setUser(user);
  };

  const signUpWithEmail = async (data: any) => {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Signup failed");
    }

    const { token, user } = await res.json();
    setToken(token);
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGitHub, signInWithEmail, signUpWithEmail, signOut, token, setToken }}>
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
