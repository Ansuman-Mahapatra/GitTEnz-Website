import { motion } from "framer-motion";
import { Github, GitBranch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function LoginPage() {
  const { signInWithGitHub, loading } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen flex items-center justify-center bg-gradient-github p-4"
    >
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 4 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 space-y-8">
          {/* Logo */}
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute top-1 left-1 w-24 h-24 rounded-2xl bg-white/10 blur-xl" />
              <motion.div
                className="relative w-24 h-24 rounded-2xl bg-[#0d1117] flex items-center justify-center glow-green shadow-xl border border-white/10 overflow-hidden p-2"
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img src="/logo.png" alt="GitTEnz Logo" className="w-full h-full object-contain" />
              </motion.div>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gradient">GitTEnz</h1>
              <p className="text-muted-foreground mt-1">
                Commits, decoded
              </p>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            {[
              "Manage repositories with ease",
              "Track branches and commits",
              "AI-powered code assistance",
            ].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                {feature}
              </motion.div>
            ))}
          </motion.div>

          {/* Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              size="lg"
              className="w-full gap-3 h-14 text-lg glow-green"
              onClick={signInWithGitHub}
              disabled={loading}
            >
              <Github className="w-6 h-6" />
              Continue with GitHub
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>
        </div>

        {/* Bottom decoration */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          &copy; {new Date().getFullYear()} GitTEnz. All rights reserved.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
