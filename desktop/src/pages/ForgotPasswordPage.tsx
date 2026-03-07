import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config";
import AetherHero from "@/components/aether-hero";
import { Particles } from "@/components/ui/particles";

export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Failed to send reset link");
            }

            toast.success("Reset link sent! Please check your email.");
            navigate("/login");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-['Space_Grotesk']">
            {/* Background Texture (Aether Hero + Particles) */}
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

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm relative z-10 px-6"
            >
                <div className="flex flex-col items-center gap-8">
                    {/* Logo Section */}
                    <Link to="/" className="group transition-transform hover:scale-110">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center glow-blue border border-white/10 backdrop-blur-md">
                            <img src="/logo1.png" alt="GitTEnz" className="w-12 h-12 object-contain" />
                        </div>
                    </Link>

                    {/* Form Card */}
                    <div className="w-full bg-background/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] space-y-6">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-gradient">
                                Reset Password
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Enter your email address to receive a password reset link.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider opacity-70">Email Address</Label>
                                <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full h-12 rounded-xl glow-blue font-bold text-base transition-all hover:scale-[1.02]" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors mt-2"
                                onClick={() => navigate("/login")}
                            >
                                <ArrowLeft className="w-3 h-3 mr-2" />
                                Back to Sign In
                            </Button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
