import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, FileText, MessageSquare, Shield, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface UserData {
    id: string;
    username: string;
    email: string;
    role: string;
    password?: string; // Hashed
}

interface FeedbackData {
    id: string;
    username: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export function AdminPage() {
    const { token, user } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
    const [privacyPolicy, setPrivacyPolicy] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Simple check: redirects happen in App.tsx or useAuth if not authenticated, 
    // but here we check role visually.
    if (user?.role !== "ADMIN") {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center space-y-4">
                    <Shield className="w-16 h-16 text-red-500 mx-auto" />
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-muted-foreground">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, feedbackRes, privacyRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${import.meta.env.VITE_API_URL}/api/admin/feedback`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${import.meta.env.VITE_API_URL}/api/admin/privacy-policy`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            if (feedbackRes.ok) setFeedbacks(await feedbackRes.json());
            if (privacyRes.ok) setPrivacyPolicy(await privacyRes.text()); // Assuming text response

        } catch (error) {
            toast.error("Failed to load admin data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleSavePrivacy = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/privacy-policy`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: privacyPolicy })
            });

            if (res.ok) toast.success("Privacy Policy updated");
            else toast.error("Failed to update policy");
        } catch (e) {
            toast.error("Error saving policy");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Shield className="w-8 h-8 text-primary" />
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">Manage users, settings, and feedback from one place.</p>
                </div>
                <Button onClick={fetchData} variant="outline" size="sm">
                    Refresh Data
                </Button>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : (
                <Tabs defaultValue="users" className="space-y-6">
                    <TabsList className="bg-black/20 border border-white/10">
                        <TabsTrigger value="users" className="gap-2">
                            <Users className="w-4 h-4" /> Users
                        </TabsTrigger>
                        <TabsTrigger value="privacy" className="gap-2">
                            <FileText className="w-4 h-4" /> Privacy Policy
                        </TabsTrigger>
                        <TabsTrigger value="feedback" className="gap-2">
                            <MessageSquare className="w-4 h-4" /> Feedback
                        </TabsTrigger>
                    </TabsList>

                    {/* Users Tab */}
                    <TabsContent value="users">
                        <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-white/5 border-white/10">
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Password Hash</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((u) => (
                                        <TableRow key={u.id} className="hover:bg-white/5 border-white/10">
                                            <TableCell className="font-medium">{u.username}</TableCell>
                                            <TableCell>{u.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                                                    {u.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[150px]">
                                                {u.password || "N/A (OAuth)"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" disabled>Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    {/* Privacy Policy Tab */}
                    <TabsContent value="privacy">
                        <div className="glass-card p-6 rounded-xl space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">Edit Privacy Policy</h3>
                                <p className="text-sm text-muted-foreground">Markdown is supported.</p>
                            </div>
                            <Textarea
                                value={privacyPolicy}
                                onChange={(e) => setPrivacyPolicy(e.target.value)}
                                className="min-h-[400px] font-mono text-sm bg-black/40 border-white/10"
                            />
                            <div className="flex justify-end">
                                <Button onClick={handleSavePrivacy} disabled={isSaving} className="gap-2 glow-green">
                                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    <Save className="w-4 h-4" /> Save Changes
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Feedback Tab */}
                    <TabsContent value="feedback">
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {feedbacks.map((f) => (
                                <div key={f.id} className="glass-card p-6 rounded-xl space-y-4 border border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                                                {f.username[0].toUpperCase()}
                                            </div>
                                            <span className="font-medium">{f.username}</span>
                                        </div>
                                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                            {f.rating} ★
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{f.comment}</p>
                                    <p className="text-xs text-muted-foreground opacity-50">
                                        {new Date(f.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
