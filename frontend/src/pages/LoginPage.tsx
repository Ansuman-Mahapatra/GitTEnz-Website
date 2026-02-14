import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Github, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-github p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card rounded-2xl p-8 space-y-6 border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center glow-green border border-white/10">
                <img src="/logo1.png" alt="Logo" className="w-12 h-12 object-contain" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              {otpRequired ? "Authentication Required" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground">
              {otpRequired ? "Enter the OTP sent to your registered email" : "Log in to GitTEnz"}
            </p>
          </div>

          {!otpRequired ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email or Username</Label>
                <Input
                  placeholder="name@example.com"
                  className="bg-black/20 border-white/10 focus:border-primary/50"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Password</Label>
                  <span className="text-xs text-primary cursor-pointer hover:underline">Forgot password?</span>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-black/20 border-white/10 focus:border-primary/50"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full glow-green font-semibold" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log In"}
              </Button>

              <div className="relative pt-4">
                <div className="absolute inset-0 flex items-center pt-4">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase pt-4">
                  <span className="bg-background px-2 text-muted-foreground bg-black/40">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2 border-white/10 hover:bg-white/5"
                onClick={signInWithGitHub}
                type="button"
              >
                <Github className="w-4 h-4" />
                GitHub
              </Button>

              <p className="text-center text-sm text-muted-foreground pt-2">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>OTP Code</Label>
                <Input
                  placeholder="Enter 6-digit code"
                  className="bg-black/20 border-white/10 focus:border-primary/50 text-center text-2xl tracking-widest"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                />
              </div>

              <Button type="submit" className="w-full glow-green font-semibold" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Code"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground hover:text-white"
                onClick={() => setOtpRequired(false)}
              >
                Back to Login
              </Button>
            </form>
          )}

        </div>
      </motion.div>
    </div>
  );
}
