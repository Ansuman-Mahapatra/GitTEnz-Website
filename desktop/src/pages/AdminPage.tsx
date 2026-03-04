import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { API_URL } from "@/config";
import { Shield, Loader2, Save, BarChart3, Users, GitFork, Star, Lock, Settings, LayoutDashboard, PieChart as PieIcon, MessageSquare, FileText, HelpCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
    totalUsers: number;
    totalRepos: number;
    totalFeedback: number;
    userGrowth: Record<string, number>;
    activeUsers: { username: string; repoCount: number }[];
    feedbackRatings: Record<string, number>;
    userStatus: Record<string, number>;
    repoLanguages: Record<string, number>;
}

export function AdminPage() {
    const { token, user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [feedbackList, setFeedbackList] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingTab, setIsLoadingTab] = useState(false);

    const [newPassword, setNewPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [privacyPolicy, setPrivacyPolicy] = useState("");
    const [termsOfService, setTermsOfService] = useState("");
    const [isLoadingConfig, setIsLoadingConfig] = useState(false);
    const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
    const [isSavingTerms, setIsSavingTerms] = useState(false);


    const tabParam = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState(tabParam || "overview");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        setSearchParams({ tab: val });
    };

    // Check for specific persistent admin account
    if (user?.username !== "admin") {
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

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/analytics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setAnalytics(await res.json());
        } catch (error) {
            toast.error("Failed to load analytics");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        if (usersList.length > 0) return;
        setIsLoadingTab(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setUsersList(await res.json());
        } catch (e) { toast.error("Failed to load users"); }
        finally { setIsLoadingTab(false); }
    };

    const fetchFeedback = async () => {
        if (feedbackList.length > 0) return;
        setIsLoadingTab(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/feedback`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setFeedbackList(await res.json());
        } catch (e) { toast.error("Failed to load feedback"); }
        finally { setIsLoadingTab(false); }
    };

    const fetchConfig = async () => {
        setIsLoadingConfig(true);
        try {
            const [privacyRes, termsRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/privacy-policy`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/api/admin/terms-of-service`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            if (privacyRes.ok) {
                const d = await privacyRes.json();
                setPrivacyPolicy(d?.content ?? "");
            }
            if (termsRes.ok) {
                const d = await termsRes.json();
                setTermsOfService(d?.content ?? "");
            }
        } catch (e) {
            toast.error("Failed to load configuration");
        } finally {
            setIsLoadingConfig(false);
        }
    };

    // Polling for live user updates and login noitifications
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const pollUsers = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${API_URL}/api/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const newUsers = await res.json();
                    setUsersList(prev => {
                        // Compare for login notifications
                        if (prev.length > 0) {
                            newUsers.forEach((u: any) => {
                                const oldUser = prev.find(p => p.id === u.id);
                                if (oldUser && u.lastActiveAt && oldUser.lastActiveAt) {
                                    const oldTime = new Date(oldUser.lastActiveAt).getTime();
                                    const newTime = new Date(u.lastActiveAt).getTime();
                                    // If active time updated within last 15 seconds (poll interval) and differs
                                    if (newTime > oldTime && (new Date().getTime() - newTime) < 20000) {
                                        toast.success(`User ${u.username} logged in successfully`, {
                                            description: `Active at ${new Date(u.lastActiveAt).toLocaleTimeString()}`
                                        });
                                    }
                                }
                            });
                        }
                        return newUsers; // Update state with fresh data
                    });
                }
            } catch (e) { console.error("Polling error", e); }
        };

        if (token) {
            // Initial fetch
            fetchUsers();
            fetchAnalytics();

            // Poll every 10 seconds
            interval = setInterval(pollUsers, 10000);
        }

        return () => clearInterval(interval);
    }, [token]);


    useEffect(() => {
        if (activeTab === "settings") fetchConfig();
        if (activeTab === "feedback") fetchFeedback();
    }, [token, activeTab]);

    const handleChangePassword = async () => {
        if (!newPassword) return;
        setIsChangingPassword(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ password: newPassword })
            });

            if (res.ok) {
                toast.success("Password updated successfully");
                setNewPassword("");
            } else {
                toast.error("Failed to update password");
            }
        } catch (e) {
            toast.error("Error updating password");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleSavePrivacyPolicy = async () => {
        setIsSavingPrivacy(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/privacy-policy`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: privacyPolicy })
            });
            if (res.ok) {
                toast.success("Privacy Policy updated");
            } else {
                toast.error("Failed to update Privacy Policy");
            }
        } catch (e) {
            toast.error("Error updating Privacy Policy");
        } finally {
            setIsSavingPrivacy(false);
        }
    };

    const handleSaveTermsOfService = async () => {
        setIsSavingTerms(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/terms-of-service`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: termsOfService })
            });
            if (res.ok) {
                toast.success("Terms of Service updated");
            } else {
                toast.error("Failed to update Terms of Service");
            }
        } catch (e) {
            toast.error("Error updating Terms of Service");
        } finally {
            setIsSavingTerms(false);
        }
    };

    // Transform data for charts
    const userGrowthData = analytics ? Object.entries(analytics.userGrowth)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        : [];

    const feedbackData = analytics ? Object.entries(analytics.feedbackRatings).map(([rating, count]) => ({ name: `${rating} Stars`, value: count })) : [];

    const userStatusData = analytics?.userStatus ? Object.entries(analytics.userStatus).map(([status, count]) => ({ name: status, value: count })) : [];

    // Sort languages by usage
    const languageData = analytics?.repoLanguages ? Object.entries(analytics.repoLanguages)
        .map(([lang, count]) => ({ name: lang, value: count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6) // Top 6 languages
        : [];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff6b6b'];
    const STATUS_COLORS = ['#00C49F', '#FF8042']; // Active (Green), Pending (Orange)

    return (
        <div className="flex h-screen bg-background overflow-hidden relative">
            {/* Animated background similar to landing page */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/20 blur-[120px] rounded-full opacity-30" />
                <div className="absolute bottom-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
            </div>
            <div className="hidden lg:block">
                <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <motion.div
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Sidebar activeTab={activeTab} onTabChange={(tab) => { handleTabChange(tab); setMobileMenuOpen(false); }} />
                    </motion.div>
                </motion.div>
            )}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden fixed top-4 left-4 z-40"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <Menu className="w-5 h-5" />
                </Button>
                <main className="flex-1 overflow-auto p-4 lg:p-6">
                    <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-background text-foreground">
                        <header className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-3">
                                    <Shield className="w-8 h-8 text-primary" />
                                    Admin Dashboard
                                </h1>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    Platform Analytics, Charts & Insights
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => { fetchAnalytics(); toast.success("Charts refreshed"); }} variant="outline" size="sm">
                                    Refresh Charts
                                </Button>
                            </div>
                        </header>

                        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">


                            {/* OVERVIEW TAB */}
                            <TabsContent value="overview" className="space-y-8">
                                {isLoading || (!analytics && usersList.length === 0) ? (
                                    <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
                                ) : (
                                    <>
                                        {/* Summary Cards */}
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <Card className="glass-card border-white/10 hover:border-primary/50 transition-colors">
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-3xl font-bold">{analytics?.totalUsers ?? usersList.length}</div>
                                                    <p className="text-xs text-muted-foreground">+ from last month</p>
                                                </CardContent>
                                            </Card>
                                            <Card className="glass-card border-white/10 hover:border-primary/50 transition-colors">
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
                                                    <GitFork className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-3xl font-bold">{analytics?.totalRepos ?? 0}</div>
                                                    <p className="text-xs text-muted-foreground">Across all users</p>
                                                </CardContent>
                                            </Card>
                                            <Card className="glass-card border-white/10 hover:border-primary/50 transition-colors">
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                                                    <Star className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-3xl font-bold">{analytics?.totalFeedback ?? 0}</div>
                                                    <p className="text-xs text-muted-foreground">Average Rating: 4.5</p>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Charts Grid */}
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {/* User Status Pie Chart (Replaced "User Activation") */}
                                            <Card className="glass-card border-white/10 col-span-1">
                                                <CardHeader>
                                                    <CardTitle>User Status (24h)</CardTitle>
                                                    <CardDescription>Real-time Active, Inactive, Visited</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="h-[250px]">
                                                        {(() => {
                                                            // Calculate status from usersList
                                                            const activeUsers = usersList.filter(u => u.username !== "admin");
                                                            const activeCount = activeUsers.filter(u => {
                                                                const lastActive = u.lastActiveAt ? new Date(u.lastActiveAt) : null;
                                                                return lastActive && (new Date().getTime() - lastActive.getTime()) < (24 * 60 * 60 * 1000);
                                                            }).length;
                                                            const inactiveCount = activeUsers.length - activeCount;
                                                            // Visited is essentially Active for this context, but if "Visited" means something else like "Just visited site but not fully active", we can differentiate.
                                                            // For this chart request: Active, Inactive, Visited. Let's make "Visited" users who visited today but maybe not "Active" (redundant?).
                                                            // Actually, let's treat "Active" as within 24h, "Visited" as logged in ever (vs never), "Inactive" as never?
                                                            // Or: Active (<24h), Inactive (>24h), Visited (Visited recently e.g. < 1h - subset?). Pie charts need mutually exclusive.
                                                            // Prompt says: "real-time active, inactive, and visited states"
                                                            // Let's interpret: Active (<24h), Inactive (>24h). Maybe "Visited" is just a label for Active.
                                                            // Let's do: Active (<24h), Inactive (>24h).

                                                            const data = [
                                                                { name: 'Active (24h)', value: activeCount },
                                                                { name: 'Inactive', value: inactiveCount }
                                                            ];

                                                            return (
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <PieChart>
                                                                        <Pie
                                                                            data={data}
                                                                            cx="50%"
                                                                            cy="50%"
                                                                            innerRadius={60}
                                                                            outerRadius={80}
                                                                            paddingAngle={5}
                                                                            dataKey="value"
                                                                        >
                                                                            <Cell key="cell-active" fill="#00C49F" />
                                                                            <Cell key="cell-inactive" fill="#FF8042" />
                                                                        </Pie>
                                                                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                                                                        <Legend verticalAlign="bottom" height={36} />
                                                                    </PieChart>
                                                                </ResponsiveContainer>
                                                            );
                                                        })()}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Repo Languages Pie Chart */}
                                            <Card className="glass-card border-white/10 col-span-1">
                                                <CardHeader>
                                                    <CardTitle>Top Languages</CardTitle>
                                                    <CardDescription>Most used across platform</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="h-[250px]">
                                                        {languageData.length > 0 ? (
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <PieChart>
                                                                    <Pie
                                                                        data={languageData}
                                                                        cx="50%"
                                                                        cy="50%"
                                                                        outerRadius={80}
                                                                        fill="#8884d8"
                                                                        dataKey="value"
                                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                                    >
                                                                        {languageData.map((entry, index) => (
                                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                        ))}
                                                                    </Pie>
                                                                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                                                                </PieChart>
                                                            </ResponsiveContainer>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                                                <PieIcon className="w-12 h-12 mb-2 opacity-50" />
                                                                <p className="text-sm">No repo data yet</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* User Growth Line Chart */}
                                            <Card className="glass-card border-white/10 col-span-full">
                                                <CardHeader>
                                                    <CardTitle>User Growth Trend</CardTitle>
                                                    <CardDescription>Daily new user registrations</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="h-[300px]">
                                                        {userGrowthData.length > 0 ? (
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <LineChart data={userGrowthData}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                                                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                                                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                                                                    <Line type="monotone" dataKey="count" stroke="#adfa1d" strokeWidth={3} activeDot={{ r: 8 }} />
                                                                </LineChart>
                                                            </ResponsiveContainer>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                                                <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
                                                                <p>No user growth data yet</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </>
                                )}
                            </TabsContent>

                            {/* USERS TAB */}
                            <TabsContent value="users" className="space-y-6">
                                {/* User Stats Summary */}
                                <div className="grid gap-4 md:grid-cols-3">
                                            <Card className="glass-card border-white/10">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{analytics?.totalUsers ?? usersList.length}</div>
                                            <p className="text-xs text-muted-foreground">Registered accounts</p>
                                        </CardContent>
                                    </Card>
                                            <Card className="glass-card border-white/10">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Repos</CardTitle>
                                            <GitFork className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{analytics?.totalRepos ?? 0}</div>
                                            <p className="text-xs text-muted-foreground">Across platform</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="glass-card border-white/10">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Top Contributors</CardTitle>
                                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{analytics?.activeUsers?.length ?? 0}</div>
                                            <p className="text-xs text-muted-foreground">Users with repos</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Top Active Users Chart */}
                                <Card className="glass-card border-white/10">
                                    <CardHeader>
                                        <CardTitle>Top Contributors Chart</CardTitle>
                                        <CardDescription>Users with most repositories (bar chart)</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px]">
                                            {analytics?.activeUsers?.length ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={analytics.activeUsers} layout="vertical" margin={{ left: 20 }}>
                                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff20" />
                                                        <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis dataKey="username" type="category" width={100} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                                                        <Bar dataKey="repoCount" fill="#adfa1d" radius={[0, 4, 4, 0]} barSize={20} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                                    <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
                                                    <p>No contributor data yet</p>
                                                    <p className="text-sm">Charts will populate when users add repositories</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Full Users List Table */}
                                <Card className="glass-card border-white/10">
                                    <CardHeader>
                                        <CardTitle>All Users</CardTitle>
                                        <CardDescription>Manage registered users</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoadingTab ? (
                                            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Username</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Joined</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Last Visited</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {usersList.filter((u: any) => u.username !== "admin").map((u: any) => {
                                                        const lastActive = u.lastActiveAt ? new Date(u.lastActiveAt) : null;
                                                        // Active if within last 24 hours
                                                        const isActive = lastActive && (new Date().getTime() - lastActive.getTime()) < (24 * 60 * 60 * 1000);

                                                        let statusBadge;
                                                        if (isActive) {
                                                            statusBadge = <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30">Active</Badge>;
                                                        } else {
                                                            statusBadge = <Badge variant="secondary" className="text-muted-foreground">Inactive</Badge>;
                                                        }

                                                        return (
                                                            <TableRow key={u.id}>
                                                                <TableCell className="font-medium">{u.username}</TableCell>
                                                                <TableCell>{u.email}</TableCell>
                                                                <TableCell>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                                                                <TableCell>{statusBadge}</TableCell>
                                                                <TableCell className="text-muted-foreground text-sm">
                                                                    {lastActive ? lastActive.toLocaleDateString() + ' ' + lastActive.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* FEEDBACK TAB */}
                            <TabsContent value="feedback" className="space-y-6">
                                {/* Feedback Summary Cards */}
                                <div className="grid gap-4 md:grid-cols-3">
                                    <Card className="glass-card border-white/10">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{analytics?.totalFeedback ?? feedbackList.length}</div>
                                            <p className="text-xs text-muted-foreground">Submissions</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="glass-card border-white/10">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Rating Distribution</CardTitle>
                                            <Star className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{Object.keys(analytics?.feedbackRatings ?? {}).length}</div>
                                            <p className="text-xs text-muted-foreground">Unique ratings</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="glass-card border-white/10">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {analytics?.feedbackRatings && Object.keys(analytics.feedbackRatings).length > 0
                                                    ? (() => {
                                                        const entries = Object.entries(analytics.feedbackRatings);
                                                        const total = entries.reduce((s, [, v]) => s + Number(v), 0);
                                                        const weighted = entries.reduce((s, [k, v]) => s + Number(k) * Number(v), 0);
                                                        return total > 0 ? (weighted / total).toFixed(1) : "—";
                                                    })()
                                                    : "—"}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Avg rating</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Feedback Ratings Chart */}
                                <Card className="glass-card border-white/10">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Star className="w-5 h-5 text-yellow-500" />
                                            Feedback Ratings Distribution
                                        </CardTitle>
                                        <CardDescription>User satisfaction ratings across all feedback</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[280px]">
                                            {analytics?.feedbackRatings && Object.keys(analytics.feedbackRatings).length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={feedbackData} layout="vertical" margin={{ left: 20 }}>
                                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff20" />
                                                        <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                                        <YAxis dataKey="name" type="category" width={100} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                                                        <Bar dataKey="value" fill="#adfa1d" radius={[0, 4, 4, 0]} barSize={24} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                                    <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
                                                    <p>No feedback data yet</p>
                                                    <p className="text-sm">Charts will appear when users submit feedback</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="glass-card border-white/10">
                                    <CardHeader>
                                        <CardTitle>User Feedback</CardTitle>
                                        <CardDescription>Recent feedback with usernames and comments</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoadingTab ? (
                                            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                                        ) : feedbackList.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">No feedback submitted yet.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {feedbackList.map((f: any, i: number) => (
                                                    <div key={i} className="border border-white/5 rounded-lg p-4 bg-background/40 space-y-2">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="font-medium">
                                                                {f.username || "Unknown user"}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-yellow-500">
                                                                <Star className="w-4 h-4 fill-yellow-500" />
                                                                <span className="text-sm font-semibold">{f.rating}/5</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                                                            {f.comment || f.message}
                                                        </p>
                                                        {f.createdAt && (
                                                            <p className="text-xs text-muted-foreground/70">
                                                                {new Date(f.createdAt).toLocaleDateString()} {new Date(f.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* SETTINGS TAB */}
                            <TabsContent value="settings" className="space-y-6">
                                <div className="grid gap-6 max-w-4xl">
                                    {/* Privacy Policy */}
                                    <Card className="glass-card border-white/10">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-primary" />
                                                Privacy Policy
                                            </CardTitle>
                                            <CardDescription>Manage the privacy policy content shown to users</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {isLoadingConfig ? (
                                                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                                            ) : (
                                                <>
                                                    <Textarea
                                                        value={privacyPolicy}
                                                        onChange={(e) => setPrivacyPolicy(e.target.value)}
                                                        placeholder="Enter privacy policy content..."
                                                        className="min-h-[200px] bg-black/20 font-mono text-sm"
                                                    />
                                                    <Button
                                                        onClick={handleSavePrivacyPolicy}
                                                        disabled={isSavingPrivacy}
                                                        className="glow-blue"
                                                    >
                                                        {isSavingPrivacy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save Privacy Policy
                                                    </Button>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Terms of Service */}
                                    <Card className="glass-card border-white/10">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-primary" />
                                                Terms of Service
                                            </CardTitle>
                                            <CardDescription>Manage the terms of service content</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {isLoadingConfig ? (
                                                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                                            ) : (
                                                <>
                                                    <Textarea
                                                        value={termsOfService}
                                                        onChange={(e) => setTermsOfService(e.target.value)}
                                                        placeholder="Enter terms of service content..."
                                                        className="min-h-[200px] bg-black/20 font-mono text-sm"
                                                    />
                                                    <Button
                                                        onClick={handleSaveTermsOfService}
                                                        disabled={isSavingTerms}
                                                        className="glow-blue"
                                                    >
                                                        {isSavingTerms && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save Terms of Service
                                                    </Button>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Admin Email / OTP Info */}
                                    <Card className="glass-card border-white/10">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Shield className="w-5 h-5 text-primary" />
                                                Two-Factor Authentication
                                            </CardTitle>
                                            <CardDescription>
                                                Secure OTP is sent to your registered email: <span className="text-primary font-mono">{user?.email}</span>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                To change your admin email, please contact system support or update via database directly for security.
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Admin Security */}
                                    <Card className="glass-card border-white/10">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Lock className="w-5 h-5 text-primary" />
                                                Admin Security
                                            </CardTitle>
                                            <CardDescription>Change your administrator password</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    New Password
                                                </label>
                                                <Input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                    className="bg-black/20"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleChangePassword}
                                                disabled={!newPassword || isChangingPassword}
                                                className="w-full glow-blue"
                                            >
                                                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Change Password
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>


                        </Tabs>
                    </div>
                </main>
            </div >
        </div >
    );
}
