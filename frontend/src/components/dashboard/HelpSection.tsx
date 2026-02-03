import { motion } from "framer-motion";
import { Mail, Linkedin, ExternalLink, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HelpSection() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto space-y-8"
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
                        <a href="mailto:ansuman197463@gmail.com">
                            <Button className="w-full gap-2" variant="outline">
                                <Mail className="w-4 h-4" />
                                ansuman197463@gmail.com
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
                            href="https://www.linkedin.com/in/ansumanmahapatra998/"
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

            <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl p-8 border border-white/5 text-center space-y-4">
                <div className="inline-flex p-3 rounded-full bg-primary/10 mb-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Your Feedback Matters</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    GitTEnz is actively developed. Your feedback helps shape the future of this tool.
                    Don't hesitate to reach out if you have ideas for new features or improvements.
                </p>
            </div>
        </motion.div>
    );
}
