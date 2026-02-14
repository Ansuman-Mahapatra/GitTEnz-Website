import { motion } from "framer-motion";

interface ParticlesProps {
    count?: number;
    color?: string;
    className?: string;
}

export function Particles({ count = 20, color = "#10b981", className = "" }: ParticlesProps) {
    return (
        <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: Math.random() * 4 + 2 + "px",
                        height: Math.random() * 4 + 2 + "px",
                        backgroundColor: color,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -100 - Math.random() * 200, 0],
                        x: [0, (Math.random() - 0.5) * 100, 0],
                        opacity: [0, 1, 0],
                        scale: [0.5, 1.5, 0.5],
                    }}
                    transition={{
                        duration: 5 + Math.random() * 5,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}
