import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Github, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config";

export function SignupPage() {
    const { signUpWithEmail } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [otp, setOtp] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        name: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (!isVerified) {
            toast.error("Please verify your email first.");
            return;
        }

        setIsLoading(true);
        try {
            await signUpWithEmail({ ...formData, otp });
            toast.success("Account created successfully!");
            navigate("/login");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!formData.email) {
            toast.error("Please enter your email first.");
            return;
        }
        setIsSendingOtp(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/send-signup-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Failed to send code.");
            }
            toast.info("Verification code sent to your email!");
            setOtpSent(true);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSendingOtp(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-github p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-card rounded-2xl p-8 space-y-6 border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Create Account
                        </h1>
                        <p className="text-muted-foreground">Join GitTEnz today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                placeholder="John Doe"
                                className="bg-black/20 border-white/10 focus:border-primary/50"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input
                                placeholder="johndoe"
                                className="bg-black/20 border-white/10 focus:border-primary/50"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Email</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    className="bg-black/20 border-white/10 focus:border-primary/50 flex-1"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    disabled={otpSent || isVerified}
                                />
                                {!isVerified && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleSendOtp}
                                        disabled={!formData.email || isSendingOtp || otpSent}
                                        className="shrink-0"
                                    >
                                        {isSendingOtp ? "Sending..." : (otpSent ? "Sent" : "Verify")}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {otpSent && !isVerified && (
                            <div className="space-y-2 p-3 border border-primary/20 bg-primary/5 rounded-lg">
                                <Label className="text-primary">Verification Code</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="000000"
                                        className="bg-black/20 border-primary/30 focus:border-primary/50 tracking-[0.3em] font-mono flex-1"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                        maxLength={6}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => setIsVerified(true)}
                                        disabled={otp.length !== 6}
                                        className="glow-blue font-semibold shrink-0"
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </div>
                        )}

                        {isVerified && (
                            <div className="text-sm text-blue-400 flex items-center gap-2 mb-2 p-2 bg-blue-500/10 rounded-lg">
                                <CheckCircle2 className="w-4 h-4" /> Email Verified
                            </div>
                        )}

                        <div className="space-y-2 mt-4">
                            <Label>Password</Label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="bg-black/20 border-white/10 focus:border-primary/50"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Confirm Password</Label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="bg-black/20 border-white/10 focus:border-primary/50"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full glow-blue font-semibold mt-6" disabled={isLoading || (!isVerified && !isLoading)}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up"}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-4">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Log in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
