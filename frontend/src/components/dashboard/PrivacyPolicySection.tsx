import { motion } from "framer-motion";
import { Shield, Lock, FileText, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PrivacyPolicySection() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto space-y-6"
        >
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Shield className="w-8 h-8 text-green-500" />
                    Privacy Policy
                </h2>
                <p className="text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>

            <Card className="glass-card">
                <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-16rem)] p-6">
                        <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">

                            <section className="space-y-3">
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-primary" />
                                    1. Data Collection and Usage
                                </h3>
                                <p>
                                    GitTEnz respects your privacy. We collect minimal data necessary to provide our services.
                                    When you authenticate with GitHub, we receive your public profile information and access tokens to
                                    manage your repositories as authorized by you.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <Server className="w-5 h-5 text-purple-500" />
                                    2. Local Data Processing
                                </h3>
                                <p>
                                    <strong>Your Code Stays Yours.</strong> GitTEnz includes powerful features for managing local repositories.
                                    When you use the "Local Repos" feature:
                                </p>
                                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                                    <li>We do NOT upload your local source code to our servers.</li>
                                    <li>All file scanning and editing happens locally within your browser using the File System Access API.</li>
                                    <li>Local file metadata is processed in-memory and not persistently stored on any external backend.</li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    3. Cookies and Storage
                                </h3>
                                <p>
                                    We use local storage and cookies solely for authentication persistency and saving your user preferences
                                    (such as theme settings and dashboard layout). No third-party tracking cookies are used.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-lg font-semibold text-foreground">4. Third-Party Services</h3>
                                <p>
                                    Our application integrates with the GitHub API. Use of GitHub's services is subject to
                                    <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noreferrer" className="text-primary hover:underline ml-1">
                                        GitHub's Privacy Statement
                                    </a>.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-lg font-semibold text-foreground">5. Contact Us</h3>
                                <p>
                                    If you have any questions about this Privacy Policy, please contact us at
                                    <a href="mailto:ansuman197463@gmail.com" className="text-primary hover:underline ml-1">
                                        ansuman197463@gmail.com
                                    </a>.
                                </p>
                            </section>

                            <div className="pt-8 border-t border-white/10 text-xs text-center text-muted-foreground">
                                <p>By using GitTEnz, you agree to the terms outlined in this policy.</p>
                            </div>

                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </motion.div>
    );
}
