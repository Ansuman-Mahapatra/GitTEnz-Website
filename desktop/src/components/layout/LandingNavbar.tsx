import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GitBranch } from "lucide-react";

export function LandingNavbar() {
    return (
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
                    <Link to="/">
                        <span className="text-xl font-bold text-gradient">GitTEnz</span>
                    </Link>
                </motion.div>

                <motion.div
                    className="hidden md:flex items-center gap-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Home</Link>
                    <Link to="/features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</Link>
                    <Link to="/download" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Download</Link>
                    <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</Link>
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
    );
}
