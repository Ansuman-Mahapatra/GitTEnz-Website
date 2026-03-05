import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import AetherHero from "@/components/aether-hero";
import { Particles } from "@/components/ui/particles";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";

export function HomePage() {
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
            <div className="fixed inset-0 pointer-events-none z-0">
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

            <LandingNavbar />

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
                            <Button size="lg" className="glow-green px-8 h-14 rounded-xl text-lg font-bold transition-all hover:scale-105">
                                Start for Free
                            </Button>
                        </Link>
                        <Link to="/features">
                            <Button size="lg" variant="outline" className="px-8 h-14 rounded-xl text-lg font-semibold border-white/10 hover:bg-white/5 transition-all">
                                Explore Features
                            </Button>
                        </Link>
                    </motion.div>
                </div>
                <Particles count={40} className="z-10" />
            </div>

            {/* Tech Stack Section */}
            <section className="py-24 relative overflow-hidden bg-muted/20 z-10">
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
            <section className="py-24 relative overflow-hidden z-10">
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
                                <Button size="lg" className="h-12 px-8 text-lg glow-green w-full sm:w-auto">
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

            <LandingFooter />
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
