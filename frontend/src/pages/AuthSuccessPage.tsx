import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { CheckCircle, X } from "lucide-react";

export function AuthSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setToken } = useAuth();
    const [isDesktop, setIsDesktop] = useState(false);

    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const token = searchParams.get("token");
        const source = searchParams.get("source");

        if (source === "desktop") {
            // This tab was opened by the desktop app for GitHub verification.
            setIsDesktop(true);
            if (token) setToken(token);

            // 🚀 AUTOMATIC DEEP LINK REDIRECT
            // This tries to wake up the GitDense app and pass the token instantly
            if (token) {
                window.location.href = `gitdense://auth?token=${token}`;
                
                // Backup: countdown to close tab if redirect worked
                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            // Some browsers allow window.close() after protocol redirect
                        }
                        return prev - 1;
                    });
                }, 1000);
                return () => clearInterval(timer);
            }
            return;
        }

        // Normal web flow — navigate to dashboard
        if (token) {
            setToken(token);
            navigate("/dashboard", { replace: true });
        } else {
            navigate("/login", { replace: true });
        }
    }, [searchParams, setToken, navigate]);

    if (isDesktop) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
                    <div className="w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-foreground">
                            GitHub Verified!
                        </h1>
                        <p className="text-muted-foreground">
                            We're sending you back to the desktop application...
                        </p>
                        <p className="text-sm text-muted-foreground bg-muted/50 rounded-xl px-4 py-3 mt-3">
                            🖥️ The <strong>GitDense</strong> app should be opening now. 
                            <br />
                            <span className="opacity-70 text-[10px] mt-2 block">
                                If nothing happens, you can manually close this tab.
                            </span>
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={() => window.close()}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                            Close Tab ({countdown}s)
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground">Finalizing login...</p>
            </div>
        </div>
    );
}
