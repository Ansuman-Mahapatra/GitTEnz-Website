import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GitBranch, Code2, Bot, Zap, Shield, Globe, Star, Users, TrendingUp, Lock, Mail, BarChart } from "lucide-react";
import { useEffect, useState } from "react";
import AetherHero from "@/components/aether-hero";
import { Particles } from "@/components/ui/particles";

export function HomePage() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 300], [0, 100]);
    const y2 = useTransform(scrollY, [0, 300], [0, -100]);
    const opacity = useTransform(scrollY, [0, 200], [1, 0]);

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-background text-foreground overflow-hidden relative"
        >
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <motion.div
                    className="absolute w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]"
                    animate={{
                        x: mousePosition.x - 250,
                        y: mousePosition.y - 250,
                    }}
                    transition={{ type: "spring", damping: 30, stiffness: 200 }}
                />
                <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            {/* Navbar */}
            <nav className="border-b border-border/40 backdrop-blur-md bg-background/80 fixed w-full z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-blue">
                            <GitBranch className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-gradient">GitTEnz</span>
                    </motion.div>
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-4"
                    >
                        <Link to="/login">
                            <Button variant="ghost" className="hover:text-primary">Log In</Button>
                        </Link>
                        <Link to="/login">
                            <Button className="glow-blue">Get Started</Button>
                        </Link>
                    </motion.div>
                </div>
            </nav>

            {/* Global Tile Background with Lightning */}
            <div className="fixed inset-0 z-0 opacity-50">
                <AetherHero
                    title=""
                    subtitle=""
                    ctaLabel=""
                    ctaHref=""
                    align="center"
                    height="100vh"
                    textColor="transparent"
                    overlayGradient="radial-gradient(circle at center, transparent, hsl(var(--background)))"
                />
            </div>

            {/* Hero Section Content */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex items-center">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight font-['Space_Grotesk'] text-gradient"
                    >
                        Commits, Decoded.<br />Development, Evolved.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
                    >
                        Experience a revolutionary way to manage your repositories. Visualize branches, analyze code with AI, and streamline your workflow with powerful admin tools and real-time insights.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/login">
                            <Button size="lg" className="glow-blue px-8 h-14 rounded-xl text-lg font-bold transition-all hover:scale-105">
                                Start for Free
                            </Button>
                        </Link>
                        <a href="#features">
                            <Button size="lg" variant="outline" className="px-8 h-14 rounded-xl text-lg font-semibold border-white/10 hover:bg-white/5 transition-all">
                                Explore Features
                            </Button>
                        </a>
                    </motion.div>
                </div>
                <Particles count={40} className="z-10" />
            </div>

            {/* Features Section */}
            <section id="features" className="py-24 bg-muted/30 relative">
                <div className="container px-6 mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything you need to ship faster</h2>
                        <p className="text-muted-foreground text-lg">
                            GitTEnz brings together the best tools for modern development workflows with enterprise-grade security.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Bot}
                            title="AI-Powered Assistant"
                            description="Get intelligent code suggestions, bug fixes, and explanations directly in your editor. Context-aware AI reads your README for better insights."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={GitBranch}
                            title="Visual Branching"
                            description="Understand your git history at a glance with beautiful, interactive commit graphs. Track every change with ease."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={Code2}
                            title="Cloud Editor"
                            description="Edit your files from anywhere with a powerful, VS Code-like web environment. Syntax highlighting included."
                            delay={0.3}
                        />
                        <FeatureCard
                            icon={Lock}
                            title="Admin Dashboard"
                            description="Comprehensive admin panel with user management, analytics, feedback system, and privacy policy controls."
                            delay={0.4}
                        />
                        <FeatureCard
                            icon={Mail}
                            title="Email OTP Security"
                            description="Secure two-factor authentication for admin login via Gmail. Change email with verification process."
                            delay={0.5}
                        />
                        <FeatureCard
                            icon={BarChart}
                            title="Real-time Analytics"
                            description="Track user growth, repository statistics, and system usage with beautiful visual insights and charts."
                            delay={0.6}
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Instant Sync"
                            description="Changes are synced to GitHub in real-time. No more command line lag. Auto-refresh every 5 seconds."
                            delay={0.7}
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Enterprise Security"
                            description="Bank-grade encryption, OAuth2 integration, and BCrypt password hashing keep your code safe."
                            delay={0.8}
                        />
                        <FeatureCard
                            icon={Globe}
                            title="Accessible Everywhere"
                            description="Works on any device. Your development environment, now in the browser with full dark mode support."
                            delay={0.9}
                        />
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="container px-6 mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Built with Modern Technologies</h2>
                        <p className="text-muted-foreground text-lg">
                            Powered by industry-leading frameworks and tools for maximum performance and reliability.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
                    >
                        <TechCard name="React 18" description="Frontend Framework" />
                        <TechCard name="Spring Boot" description="Backend Framework" />
                        <TechCard name="MongoDB" description="Database" />
                        <TechCard name="OpenAI" description="AI Integration" />
                        <TechCard name="Tailwind CSS" description="Styling" />
                        <TechCard name="TypeScript" description="Type Safety" />
                        <TechCard name="Docker" description="Containerization" />
                        <TechCard name="JWT" description="Authentication" />
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 bg-[size:50px_50px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
                <div className="container px-6 mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl mx-auto space-y-8"
                    >
                        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                            Ready to transform your workflow?
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Join thousands of developers who are streamlining their development process with GitTEnz.
                            Start for free, no credit card required.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link to="/login">
                                <Button size="lg" className="h-12 px-8 text-lg glow-blue w-full sm:w-auto">
                                    Sign Up Now
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button size="lg" variant="outline" className="h-12 px-8 text-lg w-full sm:w-auto">
                                    Log In
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border/40 bg-muted/20">
                <div className="container px-6 mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                    <GitBranch className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <span className="text-xl font-bold">GitTEnz</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Modern GitHub dashboard with AI-powered insights and enterprise security.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Legal</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-border/40 text-center text-muted-foreground">
                        <p className="font-medium">© 2024 GitTEnz. All rights reserved.</p>
                        <p className="mt-2 text-sm opacity-70">
                            Built with ❤️ by <span className="text-primary hover:underline cursor-pointer">Ansuman Mahapatra</span>
                        </p>
                    </div>
                </div>
            </footer>
        </motion.div>
    );
}

function StatCard({ number, label, icon: Icon }: { number: string; label: string; icon: any }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center"
        >
            <div className="flex items-center justify-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-primary" />
                <div className="text-3xl font-bold text-gradient">{number}</div>
            </div>
            <div className="text-sm text-muted-foreground">{label}</div>
        </motion.div>
    );
}

function FeatureCard({ icon: Icon, title, description, delay }: { icon: any; title: string; description: string; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/50 transition-all group relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </div>
        </motion.div>
    );
}

function TechCard({ name, description }: { name: string; description: string }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/50 transition-all text-center"
        >
            <div className="font-semibold mb-1">{name}</div>
            <div className="text-xs text-muted-foreground">{description}</div>
        </motion.div>
    );
}
