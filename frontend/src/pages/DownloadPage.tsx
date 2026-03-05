import { motion } from "framer-motion";
import { DownloadCloud, Monitor, Cpu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { Card, CardContent } from "@/components/ui/card";

export function DownloadPage() {
    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden flex flex-col">
            <LandingNavbar />
            
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-50">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
            </div>

            <main className="flex-1 relative z-10 pt-32 pb-24">
                <div className="container px-6 mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-4xl mx-auto mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                            <Monitor className="w-5 h-5 text-primary" />
                            <span className="text-sm font-semibold text-primary">Native App - GitDense</span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight text-gradient">Take GitTEnz to the Desktop</h1>
                        <p className="text-muted-foreground text-xl mb-12">
                            Experience the full power of GitTEnz natively on your machine under the name <strong className="text-white">GitDense</strong>. Enjoy faster local performance, better OS integration, and a distraction-free environment.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Button 
                                size="lg" 
                                className="glow-green h-16 px-10 rounded-2xl text-lg font-bold transition-all hover:scale-105"
                                onClick={() => {
                                    window.open("https://github.com/Ansuman-Mahapatra/GitDense/raw/main/dist-electron/GitDense-Setup-1.0.0.exe", "_blank");
                                }}
                            >
                                <DownloadCloud className="w-6 h-6 mr-3" />
                                Download GitDense
                            </Button>
                        </div>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-24">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="glass-card text-center h-full pt-6">
                                <CardContent>
                                    <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                        <Sparkles className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Native Feel</h3>
                                    <p className="text-muted-foreground">Runs smoothly on Windows as a standalone application instead of cluttering your browser tabs.</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="glass-card text-center h-full pt-6 border-primary/30">
                                <CardContent>
                                    <div className="w-12 h-12 mx-auto rounded-xl bg-primary/20 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                                        <Monitor className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Distraction Free</h3>
                                    <p className="text-muted-foreground">Focus solely on your code and repositories without internet tabs pulling away your attention.</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="glass-card text-center h-full pt-6">
                                <CardContent>
                                    <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                        <Cpu className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Maximum Power</h3>
                                    <p className="text-muted-foreground">Takes full advantage of the Chromium engine under the hood for snappy performance.</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </main>
            
            <LandingFooter />
        </div>
    );
}
