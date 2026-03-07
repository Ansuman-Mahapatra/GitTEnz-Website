import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { AboutSection } from "@/components/about/AboutSection";

export function AboutPage() {
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
                    <AboutSection />
                </div>
            </main>
            
            <LandingFooter />
        </div>
    );
}
