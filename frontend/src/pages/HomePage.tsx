
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GitBranch, Code2, Bot, Zap, Shield, Globe } from "lucide-react";

export function HomePage() {
    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden">
            {/* Navbar */}
            <nav className="border-b border-border/40 backdrop-blur-md bg-background/80 fixed w-full z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-green">
                            <GitBranch className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-gradient">GitTEnz</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" className="hover:text-primary">Log In</Button>
                        </Link>
                        <Link to="/login">
                            <Button className="glow-green">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />

                <div className="container px-6 mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto space-y-8"
                    >
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                            Commits, <span className="text-gradient">Decoded</span>.
                            <br />
                            Development, <span className="text-primary">Evolved</span>.
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Experience a new way to manage your repositories. Visualize branches, analyze code with AI, and streamline your workflow in one powerful platform.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link to="/login">
                                <Button size="lg" className="h-12 px-8 text-lg glow-green w-full sm:w-auto">
                                    Start for Free
                                </Button>
                            </Link>
                            <Link to="#features">
                                <Button size="lg" variant="outline" className="h-12 px-8 text-lg w-full sm:w-auto hover:bg-white/5">
                                    Explore Features
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="mt-20 relative mx-auto max-w-5xl rounded-xl border border-border/50 bg-background/50 shadow-2xl overflow-hidden backdrop-blur-sm"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-purple-500/10 opacity-50" />
                        <div className="p-2 bg-muted/50 border-b border-border/50 flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        </div>
                        <div className="w-full bg-zinc-950/80 overflow-hidden">
                            <img src="/logo.png" alt="App Dashboard Preview" className="w-full h-auto" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-muted/30">
                <div className="container px-6 mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">Everything you need to ship faster</h2>
                        <p className="text-muted-foreground text-lg">
                            GitTEnz brings together the best tools for modern development workflows.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Bot}
                            title="AI Assistant"
                            description="Get intelligent code suggestions, bug fixes, and explanations directly in your editor."
                        />
                        <FeatureCard
                            icon={GitBranch}
                            title="Visual Branching"
                            description="Understand your git history at a glance with beautiful, interactive commit graphs."
                        />
                        <FeatureCard
                            icon={Code2}
                            title="Cloud Editor"
                            description="Edit your files from anywhere with a powerful, VS Code-like web environment."
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Instant Sync"
                            description="Changes are synced to GitHub in real-time. No more command line lag."
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Enterprise Security"
                            description="Bank-grade encryption and OAuth2 integration keep your code safe."
                        />
                        <FeatureCard
                            icon={Globe}
                            title="Accessible Everywhere"
                            description="Works on any device. Your development environment, now in the browser."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 bg-[size:50px_50px]" />
                <div className="container px-6 mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl mx-auto space-y-8"
                    >
                        <h2 className="text-4xl font-bold tracking-tight">
                            Ready to explore?
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Join thousands of developers who are streamlining their workflow with GitTEnz.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link to="/login">
                                <Button size="lg" variant="outline" className="h-12 px-8 text-lg w-full sm:w-auto">
                                    Log In
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button size="lg" className="h-12 px-8 text-lg glow-green w-full sm:w-auto">
                                    Sign Up Now
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border/40">
                <div className="container px-6 mx-auto text-center text-muted-foreground">
                    <p>© 2024 GitTEnz. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/50 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}
