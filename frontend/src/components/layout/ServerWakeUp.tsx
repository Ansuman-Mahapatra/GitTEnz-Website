import { useState, useEffect } from "react";
import { API_URL } from "@/config";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ServerWakeUp({ children }: { children: React.ReactNode }) {
    const [isWaking, setIsWaking] = useState(true);
    const [showLongWaitMessage, setShowLongWaitMessage] = useState(false);

    useEffect(() => {
        let mounted = true;
        
        // Timer to show extra context if the cold start takes a long time
        const waitTimer = setTimeout(() => {
            if (mounted) setShowLongWaitMessage(true);
        }, 5000); // Only show the explanation if it takes longer than 5 seconds

        const pingServer = async () => {
            while (mounted) {
                try {
                    const response = await fetch(`${API_URL}/api/public/health`, {
                        // Fast local timeouts to trigger retries if down
                        signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined
                    });
                    
                    if (response.ok) {
                        if (mounted) {
                            setIsWaking(false);
                            break;
                        }
                    }
                } catch (error) {
                    // Ignore, just retry
                }
                
                // Wait 2 seconds before pinging again
                if (mounted) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        };
        
        pingServer();

        return () => {
            mounted = false;
            clearTimeout(waitTimer);
        };
    }, []);

    if (isWaking) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
                <AnimatePresence>
                    {showLongWaitMessage ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center space-y-6 text-center p-8 bg-black/60 border border-white/10 rounded-3xl shadow-2xl max-w-sm"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
                            </div>
                            
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary/60">
                                    Waking up the Engine
                                </h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Our cloud servers sleep after periods of inactivity. It takes about <span className="text-white font-medium">50 seconds</span> for a cold start. Your patience is appreciated!
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-center"
                        >
                            <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return <>{children}</>;
}
