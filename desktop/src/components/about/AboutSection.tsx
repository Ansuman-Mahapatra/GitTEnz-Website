import { motion } from "framer-motion";
import { Github, Mail, Linkedin, Code2, Coffee, Heart, Sparkles, Terminal, Rocket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AboutSection() {
    const techStack = [
        { name: "React 18", icon: "⚛️" },
        { name: "TypeScript", icon: "📘" },
        { name: "Spring Boot 3", icon: "🍃" },
        { name: "MongoDB", icon: "🍃" },
        { name: "WebGL/GLSL", icon: "🎨" },
        { name: "Tailwind CSS", icon: "💨" },
    ];

    const features = [
        "AI-Powered Code Assistant",
        "Real-time Repository Sync",
        "Advanced Analytics Dashboard",
        "Secure OTP Authentication",
        "Custom WebGL Shaders",
        "Premium UI/UX Design",
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 pb-10"
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">About GitTEnz</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight font-['Space_Grotesk']">
                    <span className="text-gradient">Built with Passion</span>
                </h1>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    A next-generation GitHub dashboard combining cutting-edge design with powerful developer tools
                </p>
            </motion.div>

            {/* Creator Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="glass-card border-primary/20">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Avatar */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="relative"
                            >
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-primary/30 shadow-lg shadow-primary/20">
                                    <span className="text-5xl font-bold text-primary">AM</span>
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-3">
                                    <Code2 className="w-5 h-5" />
                                </div>
                            </motion.div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-3xl font-bold mb-2 text-gradient">Ansuman Mahapatra</h2>
                                <p className="text-lg text-muted-foreground mb-4">Full-Stack Developer & UI/UX Enthusiast</p>

                                <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                                    A passionate developer who believes in creating beautiful, functional applications that solve real problems.
                                    GitTEnz is a testament to the power of modern web technologies and thoughtful design.
                                </p>

                                {/* Social Links */}
                                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 glow-blue"
                                        onClick={() => window.open(import.meta.env.VITE_DEVELOPER_GITHUB_URL, "_blank")}
                                    >
                                        <Github className="w-4 h-4" />
                                        GitHub
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => window.location.href = `mailto:${import.meta.env.VITE_DEVELOPER_EMAIL}`}
                                    >
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => window.open(import.meta.env.VITE_DEVELOPER_LINKEDIN_URL, "_blank")}
                                    >
                                        <Linkedin className="w-4 h-4" />
                                        LinkedIn
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Tech Stack & Features Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Tech Stack */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="glass-card h-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Terminal className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle>Tech Stack</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                {techStack.map((tech, index) => (
                                    <motion.div
                                        key={tech.name}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 + index * 0.05 }}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-all"
                                    >
                                        <span className="text-2xl">{tech.icon}</span>
                                        <span className="font-medium text-sm">{tech.name}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="glass-card h-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Rocket className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle>Key Features</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={feature}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + index * 0.05 }}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-all"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="font-medium text-sm">{feature}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Stats Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="glass-card border-primary/20">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary mb-1">50+</div>
                                <div className="text-xs text-muted-foreground">Components</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary mb-1">10K+</div>
                                <div className="text-xs text-muted-foreground">Lines of Code</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary mb-1">100%</div>
                                <div className="text-xs text-muted-foreground">TypeScript</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary mb-1">∞</div>
                                <div className="text-xs text-muted-foreground">Possibilities</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <Separator className="bg-primary/10" />

            {/* Footer Message */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center"
            >
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                    <span className="text-sm">Made with</span>
                    <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                    <span className="text-sm">and</span>
                    <Coffee className="w-4 h-4 text-primary" />
                    <span className="text-sm">by Ansuman Mahapatra</span>
                </div>

                <p className="text-xs text-muted-foreground">
                    GitTEnz © 2026 | Open Source Project
                </p>
            </motion.div>
        </motion.div>
    );
}
