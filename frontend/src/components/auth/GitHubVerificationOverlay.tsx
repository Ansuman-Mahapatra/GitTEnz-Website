import { motion, AnimatePresence } from "framer-motion";
import { Github, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function GitHubVerificationOverlay() {
    const { githubVerificationRequired, signInWithGitHub, user } = useAuth();

    if (!githubVerificationRequired || !user) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/80 backdrop-blur-xl"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md p-8 rounded-3xl border border-primary/20 bg-card shadow-2xl overflow-hidden"
                >
                    {/* Animated Glow Background */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
                    
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Github className="w-10 h-10 text-primary" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center animate-bounce">
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">GitHub Verification Required</h2>
                            <p className="text-muted-foreground">
                                {user.githubId 
                                    ? "Your GitHub session has expired (3-day security check). Please re-verify to continue." 
                                    : "To access repository features, you must link your GitHub account."}
                            </p>
                        </div>

                        <div className="w-full space-y-3">
                            <Button 
                                onClick={signInWithGitHub}
                                className="w-full h-12 text-lg font-bold glow-green rounded-xl group"
                            >
                                Verify with GitHub
                                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                            
                            <p className="text-xs text-muted-foreground">
                                You will be redirected to GitHub for secure authentication.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
