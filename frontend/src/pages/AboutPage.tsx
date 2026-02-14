import { motion } from "framer-motion";
import { Github, Mail, Linkedin, Code2, Coffee, Heart, Sparkles, Terminal, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Particles } from "@/components/ui/particles";

export default function AboutPage() {
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
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Effects */}
            <Particles count={50} className="opacity-30" />

            <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

            {/* Content */}
            <div className="container mx-auto px-6 py-16 relative z-10">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">About GitTEnz</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight font-['Space_Grotesk']">
                        <span className="text-gradient">Built with Passion</span>
                        <br />
                        <span className="text-foreground">Coded with Purpose</span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        A next-generation GitHub dashboard combining cutting-edge design with powerful developer tools
                    </p>
                </motion.div>

                {/* Creator Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-4xl mx-auto mb-20"
                >
                    <Card className="glass-card border-primary/20 overflow-hidden">
                        <CardContent className="p-8 md:p-12">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                {/* Avatar */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="relative"
                                >
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-primary/30 shadow-lg shadow-primary/20">
                                        <span className="text-6xl font-bold text-primary">AM</span>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-3">
                                        <Code2 className="w-6 h-6" />
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
                                            className="gap-2 glow-green"
                                            onClick={() => window.open("https://github.com/Ansuman-Mahapatra", "_blank")}
                                        >
                                            <Github className="w-4 h-4" />
                                            GitHub
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="gap-2"
                                            onClick={() => window.location.href = "mailto:ansuman197463@gmail.com"}
                                        >
                                            <Mail className="w-4 h-4" />
                                            Email
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="gap-2"
                                            onClick={() => window.open("https://linkedin.com/in/ansuman-mahapatra", "_blank")}
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
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mb-20">
                    {/* Tech Stack */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="glass-card h-full">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Terminal className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold">Tech Stack</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {techStack.map((tech, index) => (
                                        <motion.div
                                            key={tech.name}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 + index * 0.05 }}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-all"
                                        >
                                            <span className="text-2xl">{tech.icon}</span>
                                            <span className="font-medium">{tech.name}</span>
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
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="glass-card h-full">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Rocket className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold">Key Features</h3>
                                </div>

                                <div className="space-y-3">
                                    {features.map((feature, index) => (
                                        <motion.div
                                            key={feature}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + index * 0.05 }}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-all"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="font-medium">{feature}</span>
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
                    transition={{ delay: 0.6 }}
                    className="max-w-4xl mx-auto mb-20"
                >
                    <Card className="glass-card border-primary/20">
                        <CardContent className="p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-primary mb-2">50+</div>
                                    <div className="text-sm text-muted-foreground">Components</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                                    <div className="text-sm text-muted-foreground">Lines of Code</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-primary mb-2">100%</div>
                                    <div className="text-sm text-muted-foreground">TypeScript</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-primary mb-2">∞</div>
                                    <div className="text-sm text-muted-foreground">Possibilities</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <Separator className="max-w-4xl mx-auto mb-12 bg-primary/10" />

                {/* Footer Message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center max-w-2xl mx-auto"
                >
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                        <span>and</span>
                        <Coffee className="w-4 h-4 text-primary" />
                        <span>by Ansuman Mahapatra</span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        GitTEnz © 2026 | Open Source Project
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
