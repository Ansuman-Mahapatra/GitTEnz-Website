import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { API_URL } from "@/config";

export function PrivacyPolicySection() {
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                // Use public endpoint - works for both authenticated and unauthenticated users
                const res = await fetch(`${API_URL}/api/public/privacy-policy`);
                if (res.ok) {
                    const data = await res.json();
                    setContent(data?.content || "No privacy policy set.");
                } else {
                    setContent("Failed to load privacy policy.");
                }
            } catch (error) {
                toast.error("Could not load privacy policy");
                setContent("Failed to load privacy policy.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPolicy();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto space-y-6"
        >
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Shield className="w-8 h-8 text-blue-500" />
                    Privacy Policy
                </h2>
                <p className="text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>

            <Card className="glass-card">
                <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-16rem)] p-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                                {content}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </motion.div>
    );
}
