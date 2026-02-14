import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Github, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import AetherHero from "@/components/aether-hero";
import { Particles } from "@/components/ui/particles";

export function LoginPage() {
  const { signInWithEmail, signInWithGitHub, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: ""
  });
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // @ts-ignore
      const result = await signInWithEmail(formData);
      if (result && result.otpRequired) {
        setOtpRequired(true);
        toast.info("OTP sent to your email");
      } else {
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await verifyOtp(formData.identifier, otp);
      toast.success("Verified!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-['Space_Grotesk']">
      {/* Background Texture (Aether Hero + Particles) */}
      <div className="absolute inset-0 z-0">
        <AetherHero
          height="100vh"
          align="center"
          textColor="transparent"
          overlayGradient="radial-gradient(circle at center, transparent, hsl(var(--background) / 0.85))"
        />
      </div>
      <Particles count={30} className="z-0" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none z-0" />

      {/* Main Content (Inspired by shadcnblocks/signup-1) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10 px-6"
      >
        <div className="flex flex-col items-center gap-8">
          {/* Logo Section */}
          <Link to="/" className="group transition-transform hover:scale-110">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center glow-green border border-white/10 backdrop-blur-md">
              <img src="/logo1.png" alt="GitTEnz" className="w-12 h-12 object-contain" />
            </div>
          </Link>

          {/* Form Card */}
          <div className="w-full bg-background/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-gradient">
                {otpRequired ? "Verify Identity" : "Welcome Back"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {otpRequired ? "A 6-digit code has been sent to your email" : "Enter your credentials to access your dashboard"}
              </p>
            </div>

            {!otpRequired ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider opacity-70">Identifier</Label>
                  <Input
                    placeholder="Username or Email"
                    className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider opacity-70">Password</Label>
                    <span className="text-[10px] text-primary uppercase font-bold tracking-widest cursor-pointer hover:underline">Forgot?</span>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl glow-green font-bold text-base transition-all hover:scale-[1.02]" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold">
                    <span className="bg-transparent px-4 text-muted-foreground">
                      Third Party
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl gap-3 border-white/10 hover:bg-white/5 transition-all hover:scale-[1.02]"
                  onClick={signInWithGitHub}
                  type="button"
                >
                  <Github className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Continue with GitHub</span>
                </Button>

                <p className="text-center text-xs text-muted-foreground pt-2">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:underline font-bold transition-colors">
                    Register Now
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-xs font-semibold uppercase tracking-wider opacity-70 text-center block w-full">Security Code</Label>
                  <Input
                    placeholder="000000"
                    className="h-20 bg-white/5 border-white/10 focus:border-primary/50 text-center text-4xl tracking-[0.5em] font-bold rounded-2xl"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                  />
                </div>

                <Button type="submit" className="w-full h-14 rounded-xl glow-green font-bold text-lg transition-all hover:scale-[1.02]" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors"
                  onClick={() => setOtpRequired(false)}
                >
                  <ArrowLeft className="w-3 h-3 mr-2" />
                  Back to Sign In
                </Button>
              </form>
            )}
          </div>

          {/* Footer Info */}
          <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Secure Enterprise Access</p>
            <p className="text-[8px] uppercase tracking-[0.1em]">© 2024 GittEnz Advanced Systems</p>
          </div>
        </div>
      </motion.div>

      {/* Floating Corner Patterns */}
      <div className="absolute top-0 left-0 w-64 h-64 border-l border-t border-white/5 rounded-tl-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 border-r border-b border-white/5 rounded-br-full translate-x-1/3 translate-y-1/3" />
    </div>
  );
}
