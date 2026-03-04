import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Linkedin, ExternalLink, MessageSquare, Star, Loader2, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export function HelpSection() {
    const { token } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a star rating");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ rating, comment: feedback })
            });

            if (!res.ok) throw new Error("Failed to submit");

            toast.success("Thank you for your feedback!");
            setRating(0);
            setFeedback("");
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto space-y-8 pb-10"
        >
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Help & Feedback</h2>
                <p className="text-muted-foreground">
                    We're here to help! Reach out to the developer team for support, feedback, or just to say hi.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Developer */}
                <Card className="glass-card hover:border-primary/50 transition-colors">
                    <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                            <Mail className="w-6 h-6 text-blue-500" />
                        </div>
                        <CardTitle>Contact Support</CardTitle>
                        <CardDescription>
                            Have a bug to report or a feature request? Drop us an email directly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a href={`mailto:${import.meta.env.VITE_DEVELOPER_EMAIL}`}>
                            <Button className="w-full gap-2" variant="outline">
                                <Mail className="w-4 h-4" />
                                {import.meta.env.VITE_DEVELOPER_EMAIL}
                            </Button>
                        </a>
                    </CardContent>
                </Card>

                {/* LinkedIn Connection */}
                <Card className="glass-card hover:border-blue-700/50 transition-colors">
                    <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-blue-700/10 flex items-center justify-center mb-4">
                            <Linkedin className="w-6 h-6 text-blue-700" />
                        </div>
                        <CardTitle>Connect with Developer</CardTitle>
                        <CardDescription>
                            Follow for updates, future roadmap announcements, and behind-the-scenes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a
                            href={import.meta.env.VITE_DEVELOPER_LINKEDIN_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button className="w-full gap-2 bg-[#0077b5] hover:bg-[#0077b5]/90 text-white border-0">
                                <Linkedin className="w-4 h-4" />
                                Follow on LinkedIn
                                <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                            </Button>
                        </a>
                    </CardContent>
                </Card>
            </div>

            {/* Feedback Form */}
            <Card className="glass-card border-primary/20 bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Send Feedback</CardTitle>
                            <CardDescription>
                                Your feedback helps shape the future of GitTEnz. Let us know how we can improve!
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmitFeedback} className="space-y-6">
                        <div className="space-y-3">
                            <Label>How would you rate your experience?</Label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="relative focus:outline-none transition-transform hover:scale-110"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-colors ${(hoverRating || rating) >= star
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-muted-foreground/30"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="feedback">What can we improve?</Label>
                            <Textarea
                                id="feedback"
                                placeholder="Tell us what you like or what isn't working..."
                                className="min-h-[120px] bg-black/20 focus:border-primary/50 resize-none"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                className="glow-blue gap-2 min-w-[140px]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Submit Feedback
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
