import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { CheckCircle, X } from "lucide-react";

export function AuthSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setToken } = useAuth();
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const token = searchParams.get("token");
        const source = searchParams.get("source");

        if (source === "desktop") {
            // This tab was opened by the desktop app for GitHub verification.
            // Save the token silently (in case user wants to use the website too)
            // but show "close this tab" instead of navigating to the dashboard.
            setIsDesktop(true);
            if (token) setToken(token);
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
                            Your GitHub account has been verified successfully.
                        </p>
                        <p className="text-sm text-muted-foreground bg-muted/50 rounded-xl px-4 py-3 mt-3">
                            🖥️ You can now <strong>close this browser tab</strong> and return to the <strong>GitDense</strong> desktop application. It will update automatically.
                        </p>
                    </div>
                    <button
                        onClick={() => window.close()}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                        <X className="w-4 h-4" />
                        Close This Tab
                    </button>
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
