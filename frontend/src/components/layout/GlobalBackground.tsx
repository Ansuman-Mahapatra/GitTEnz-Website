import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AetherHero from "@/components/aether-hero";
import { Particles } from "@/components/ui/particles";

export const GlobalBackground = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-background">
            {/* Animated Gradient Follower */}
            <div className="absolute inset-0 z-0">
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

            {/* Global Tile Background with Lightning */}
            <div className="absolute inset-0 z-0 opacity-40">
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
            
            <Particles count={30} className="absolute inset-0 z-0" />
        </div>
    );
};
