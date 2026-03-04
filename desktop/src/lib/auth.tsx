import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { API_URL } from "@/config";

const INACTIVITY_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
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
    // HashRouter navigates via hash — must use hash form for Electron
    window.location.hash = '#/login';
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
          window.location.hash = '#/login';
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchUser]);

  // 30-day inactivity auto-logout (rolling session)
  useEffect(() => {
    if (!user || !token) return;

    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    let activityTimer: ReturnType<typeof setTimeout> | null = null;

    const checkAndResetTimer = () => {
      const now = Date.now();
      const lastActivityStr = localStorage.getItem("lastActivityTimestamp");
      
      // If returning after being away too long, log out immediately
      if (lastActivityStr) {
        const lastActivity = parseInt(lastActivityStr, 10);
        if (now - lastActivity > INACTIVITY_TIMEOUT_MS) {
          if (typeof window !== "undefined") {
            window.alert("Session expired. You have been logged out due to 30 days of inactivity. Please log in again.");
          }
          signOut();
          return;
        }
      }
      
      // Update activity timestamp in local storage
      localStorage.setItem("lastActivityTimestamp", now.toString());

      // Set the active session timeout
      if (activityTimer) clearTimeout(activityTimer);
      activityTimer = setTimeout(() => {
        if (typeof window !== "undefined") {
          window.alert("Session expired. You have been logged out due to 30 days of inactivity. Please log in again.");
        }
        signOut();
      }, INACTIVITY_TIMEOUT_MS);
    };

    // Throttle the local storage writes so they only happen max once every 30 seconds
    const handleActivity = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        checkAndResetTimer();
        throttleTimer = null;
      }, 30000); 
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    
    // Initial check on mount
    checkAndResetTimer();

    events.forEach((ev) => window.addEventListener(ev, handleActivity));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      if (activityTimer) clearTimeout(activityTimer);
      if (throttleTimer) clearTimeout(throttleTimer);
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
    // Desktop: open GitHub OAuth in the system browser (Electron cannot handle OAuth redirects internally)
    window.open(`${API_URL}/oauth2/authorization/github`, '_blank');
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

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGitHub, signInWithEmail, signUpWithEmail, verifySignupOtp, verifyOtp, signOut, token, setToken }}>
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
