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
    const [formData, setFormData] = useState({
        username: "",
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

        setIsLoading(true);
        try {
            await signUpWithEmail({ ...formData, otp: "" });
            toast.success("Account created! You can log in right now.");
            navigate("/login");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
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

                        <Button type="submit" className="w-full glow-green font-semibold mt-6" disabled={isLoading}>
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
