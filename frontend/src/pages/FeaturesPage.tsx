import { motion } from "framer-motion";
import { GitBranch, Code2, Bot, Zap, Shield, Globe, Lock, Mail, BarChart } from "lucide-react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";

function FeatureCard({ icon: Icon, title, description, delay }: { icon: any; title: string; description: string; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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

export function FeaturesPage() {
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
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-gradient">Features Overview</h1>
                        <p className="text-muted-foreground text-xl">
                            GitTEnz brings together the best tools for modern development workflows with enterprise-grade security. Explore all the features available below.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
            </main>
            
            <LandingFooter />
        </div>
    );
}
