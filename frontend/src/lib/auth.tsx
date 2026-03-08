import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { API_URL } from "@/config";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes as requested

export interface User {
  username: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  id?: string;
  role?: string;
  onboardingCompleted?: boolean;
  notificationPreferences?: {
    emailAlerts: boolean;
    pushNotifications: boolean;
    commitActivityAlerts: boolean;
  };
  githubId?: string;
  lastGithubVerifiedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  githubVerificationRequired: boolean;
  signInWithGitHub: () => void;
  signInWithEmail: (data: any) => Promise<any>;
  signUpWithEmail: (data: any) => Promise<any>;
  verifySignupOtp: (identifier: string, otp: string) => Promise<void>;
  verifyOtp: (identifier: string, otp: string) => Promise<void>;
  signOut: () => void;
  token: string | null;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        signOut(false);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  }, []);

  const signOut = useCallback((withAlert = true) => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastActivityTimestamp");
    setTokenState(null);
    setUser(null);
    if (withAlert && typeof window !== "undefined") {
      // Small delay to ensure state updates or just direct redirect
    }
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

  // 15-minute inactivity auto-logout (rolling session)
  useEffect(() => {
    if (!token) return;

    const checkTimeout = () => {
      const now = Date.now();
      const lastActivityStr = localStorage.getItem("lastActivityTimestamp");
      
      if (lastActivityStr) {
        const lastActivity = parseInt(lastActivityStr, 10);
        if (now - lastActivity > INACTIVITY_TIMEOUT_MS) {
          window.alert("Session expired due to 15 minutes of inactivity. Please log in again.");
          signOut(false);
          return true;
        }
      }
      return false;
    };

    // Initial check
    if (checkTimeout()) return;

    const handleActivity = () => {
      localStorage.setItem("lastActivityTimestamp", Date.now().toString());
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    const intervalTimer = setInterval(checkTimeout, 30000); // Check every 30s

    events.forEach((ev) => window.addEventListener(ev, handleActivity));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      clearInterval(intervalTimer);
    };
  }, [token, signOut]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const lastActivityStr = localStorage.getItem("lastActivityTimestamp");
      
      if (storedToken) {
        // Sync check for timeout before fetching user to avoid blank page
        const now = Date.now();
        if (lastActivityStr) {
          const lastActivity = parseInt(lastActivityStr, 10);
          if (now - lastActivity > INACTIVITY_TIMEOUT_MS) {
            window.alert("Session expired due to 15 minutes of inactivity. Please log in again.");
            localStorage.removeItem("token");
            localStorage.removeItem("lastActivityTimestamp");
            setTokenState(null);
            setLoading(false);
            return;
          }
        }
        
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

    const result = await res.json();
    if (result.otpRequired) {
      return result;
    }

    const { token, user } = result;
    setToken(token);
    setUser(user);
    return result;
  };

  const verifyOtp = async (identifier: string, otp: string) => {
    const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, otp }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "OTP verification failed");
    }

    const { token, user } = await res.json();
    setToken(token);
    setUser(user);
  };

  const verifySignupOtp = async (identifier: string, otp: string) => {
    const res = await fetch(`${API_URL}/api/auth/verify-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, otp }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "OTP verification failed");
    }
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

    return await res.json();
  };

  const githubVerificationRequired = !!user && (!user.githubId || (user.lastGithubVerifiedAt ? (Date.now() - new Date(user.lastGithubVerifiedAt).getTime() > 3 * 24 * 60 * 60 * 1000) : true));

  return (
    <AuthContext.Provider value={{ user, loading, githubVerificationRequired, signInWithGitHub, signInWithEmail, signUpWithEmail, verifySignupOtp, verifyOtp, signOut, token, setToken }}>
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
