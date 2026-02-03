import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Github, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SignupPage() {
    const { signUpWithEmail, signInWithGitHub } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
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

        setIsLoading(true);
        try {
            await signUpWithEmail(formData);
            toast.success("Account created successfully!");
            navigate("/dashboard");
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

                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                placeholder="john@example.com"
                                className="bg-black/20 border-white/10 focus:border-primary/50"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
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

                        <Button type="submit" className="w-full glow-green font-semibold" disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up"}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground bg-black/40">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full gap-2 border-white/10 hover:bg-white/5"
                        onClick={signInWithGitHub}
                        type="button"
                    >
                        <Github className="w-4 h-4" />
                        GitHub
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
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
