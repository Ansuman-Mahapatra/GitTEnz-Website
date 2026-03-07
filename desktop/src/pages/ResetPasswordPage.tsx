import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config";
import AetherHero from "@/components/aether-hero";
import { Particles } from "@/components/ui/particles";

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email") || "";
    const token = searchParams.get("token") || "";

    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (!email || !token) {
            toast.error("Invalid reset link");
            navigate("/login");
        }
    }, [email, token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword: password }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Failed to reset password");
            }

            toast.success("Password reset successfully! You can now log in.");
            navigate("/login");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!email || !token) return null;

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-['Space_Grotesk']">
            <div className="absolute inset-0 z-0">
                <AetherHero
                    height="100vh"
                    align="center"
                    textColor="transparent"
                    overlayGradient="radial-gradient(circle at center, transparent, hsl(var(--background) / 0.85))"
                />
            </div>
            <Particles count={30} className="z-0" />
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none z-0" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm relative z-10 px-6"
            >
                <div className="flex flex-col items-center gap-8">
                    <Link to="/" className="group transition-transform hover:scale-110">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center glow-blue border border-white/10 backdrop-blur-md">
                            <img src="/logo1.png" alt="GitTEnz" className="w-12 h-12 object-contain" />
                        </div>
                    </Link>

                    <div className="w-full bg-background/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] space-y-6">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-gradient">
                                New Password
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Please create a new password below.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider opacity-70">New Password</Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider opacity-70">Confirm Password</Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full h-12 rounded-xl glow-blue font-bold text-base transition-all hover:scale-[1.02]" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
                            </Button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
