import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { AboutSection } from "@/components/about/AboutSection";

export function AboutPage() {
    return (
        <div className="min-h-screen bg-transparent text-foreground overflow-hidden flex flex-col">
            <LandingNavbar />
            
            <main className="flex-1 relative z-10 pt-32 pb-24">
                <div className="container px-6 mx-auto">
                    <AboutSection />
                </div>
            </main>
            
            <LandingFooter />
        </div>
    );
}
