import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { API_URL } from "@/config";
import { Shield, Loader2, Save, BarChart3, Users, GitFork, Star, Lock, Settings, LayoutDashboard, PieChart as PieIcon, MessageSquare, FileText, HelpCircle, Menu, Mail } from "lucide-react";
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

    // Email change states
    const [newEmail, setNewEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [pendingEmail, setPendingEmail] = useState("");
    const [isRequestingEmailChange, setIsRequestingEmailChange] = useState(false);
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const [showVerificationInput, setShowVerificationInput] = useState(false);

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

    const handleRequestEmailChange = async () => {
        if (!newEmail) return;
        setIsRequestingEmailChange(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/email/request-change`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ email: newEmail })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || "Verification code sent to your new email");
                setPendingEmail(data.pendingEmail);
                setShowVerificationInput(true);
            } else {
                toast.error(data || "Failed to send verification code");
            }
        } catch (e) {
            toast.error("Error requesting email change");
        } finally {
            setIsRequestingEmailChange(false);
        }
    };

    const handleVerifyEmailChange = async () => {
        if (!verificationCode) return;
        setIsVerifyingEmail(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/email/verify-change`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ code: verificationCode })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || "Email updated successfully");
                setNewEmail("");
                setVerificationCode("");
                setPendingEmail("");
                setShowVerificationInput(false);
                // Refresh user data
                window.location.reload();
            } else {
                toast.error(data || "Invalid verification code");
            }
        } catch (e) {
            toast.error("Error verifying email change");
        } finally {
            setIsVerifyingEmail(false);
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

    // Transform data for charts - Use real analytics data
    const userGrowthData = analytics?.userGrowth && Object.keys(analytics.userGrowth).length > 0
        ? Object.entries(analytics.userGrowth)
            .map(([date, count]) => ({
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count: Number(count)
            }))
            .sort((a, b) => {
                // Sort by actual date
                const dateA = new Date(Object.entries(analytics.userGrowth).find(([d]) =>
                    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === a.date
                )?.[0] || 0);
                const dateB = new Date(Object.entries(analytics.userGrowth).find(([d]) =>
                    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === b.date
                )?.[0] || 0);
                return dateA.getTime() - dateB.getTime();
            })
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
                                                    <CardDescription>Active vs Inactive users (excluding admin)</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="h-[250px]">
                                                        {(() => {
                                                            // Calculate status from usersList - EXCLUDE ADMIN
                                                            const regularUsers = usersList.filter(u => u.username !== 'admin');

                                                            const now = new Date().getTime();
                                                            const last24h = 24 * 60 * 60 * 1000;

                                                            const activeCount = regularUsers.filter(u => {
                                                                if (!u.lastActiveAt) return false;
                                                                const lastActive = new Date(u.lastActiveAt).getTime();
                                                                return (now - lastActive) < last24h;
                                                            }).length;

                                                            const inactiveCount = regularUsers.length - activeCount;

                                                            // Only show chart if there are regular users
                                                            if (regularUsers.length === 0) {
                                                                return (
                                                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                                                        <Users className="w-16 h-16 mb-4 opacity-50" />
                                                                        <p>No users registered yet</p>
                                                                    </div>
                                                                );
                                                            }

                                                            const data = [
                                                                { name: `Active (24h)`, value: activeCount },
                                                                { name: 'Inactive (>24h)', value: inactiveCount }
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

                                            {/* Feedback Ratings Pie Chart */}
                                            <Card className="glass-card border-white/10 col-span-1">
                                                <CardHeader>
                                                    <CardTitle>Satisfaction</CardTitle>
                                                    <CardDescription>User Feedback Ratings</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="h-[250px]">
                                                        {feedbackData.length > 0 ? (
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <PieChart>
                                                                    <Pie
                                                                        data={feedbackData}
                                                                        cx="50%"
                                                                        cy="50%"
                                                                        outerRadius={80}
                                                                        fill="#8884d8"
                                                                        dataKey="value"
                                                                    >
                                                                        {feedbackData.map((entry, index) => (
                                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                        ))}
                                                                    </Pie>
                                                                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                                                                    <Legend verticalAlign="bottom" height={36} />
                                                                </PieChart>
                                                            </ResponsiveContainer>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                                                <Star className="w-12 h-12 mb-2 opacity-50" />
                                                                <p className="text-sm">No feedback yet</p>
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
                                            <div className="text-2xl font-bold">{analytics?.totalUsers ? analytics.totalUsers - 1 : usersList.filter(u => u.username !== 'admin').length}</div>
                                            <p className="text-xs text-muted-foreground">Registered accounts (excluding admin)</p>
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
                                        <CardDescription>Manage registered users (excluding admin)</CardDescription>
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
                                                    {usersList.filter((u: any) => u.username !== 'admin').map((u: any) => {
                                                        const lastActive = u.lastActiveAt ? new Date(u.lastActiveAt) : null;
                                                        // Active if within last 24 hours
                                                        const isActive = lastActive && (new Date().getTime() - lastActive.getTime()) < (24 * 60 * 60 * 1000);

                                                        let statusBadge;
                                                        if (isActive) {
                                                            statusBadge = <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Active</Badge>;
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


                                {/* Feedback Ratings Chart - Histogram */}
                                <Card className="glass-card border-white/10">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-primary" />
                                            Feedback Ratings Distribution (Histogram)
                                        </CardTitle>
                                        <CardDescription>User satisfaction ratings across all feedback</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px]">
                                            {analytics?.feedbackRatings && Object.keys(analytics.feedbackRatings).length > 0 ? (() => {
                                                // Convert feedback ratings object to histogram data
                                                const feedbackData = Object.entries(analytics.feedbackRatings)
                                                    .map(([rating, count]) => ({
                                                        rating: `${rating} ⭐`,
                                                        count: Number(count)
                                                    }))
                                                    .sort((a, b) => parseInt(a.rating) - parseInt(b.rating));

                                                return (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={feedbackData} margin={{ bottom: 20, left: 10, right: 10 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                                            <XAxis
                                                                dataKey="rating"
                                                                stroke="#888888"
                                                                fontSize={12}
                                                                tickLine={false}
                                                                axisLine={false}
                                                                interval={0}
                                                            />
                                                            <YAxis
                                                                stroke="#888888"
                                                                fontSize={12}
                                                                tickLine={false}
                                                                axisLine={false}
                                                                label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fill: '#888888' } }}
                                                            />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                                                itemStyle={{ color: '#fff' }}
                                                                cursor={{ fill: 'rgba(173, 250, 29, 0.1)' }}
                                                            />
                                                            <Bar
                                                                dataKey="count"
                                                                fill="#adfa1d"
                                                                radius={[4, 4, 0, 0]}
                                                                barSize={60}
                                                            />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                );
                                            })() : (
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
                                        <CardDescription>Recent feedback submissions with user information</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoadingTab ? (
                                            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                                        ) : feedbackList.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[100px]">Rating</TableHead>
                                                        <TableHead>Message</TableHead>
                                                        <TableHead className="w-[150px]">User</TableHead>
                                                        <TableHead className="w-[120px]">Date</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {feedbackList.map((f: any, i: number) => (
                                                        <TableRow key={i}>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                                    <span className="font-semibold">{f.rating}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="max-w-md">
                                                                <p className="line-clamp-2">{f.message || 'No message'}</p>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    {f.user?.username ? (
                                                                        <>
                                                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                                                                                {f.user.username.charAt(0).toUpperCase()}
                                                                            </div>
                                                                            <span className="font-medium text-foreground">{f.user.username}</span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="italic">Anonymous</span>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground text-xs">
                                                                {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'N/A'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                                                <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                                                <p>No feedback submissions yet</p>
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
                                                        className="glow-green"
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
                                                        className="glow-green"
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
                                                className="w-full glow-green"
                                            >
                                                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Change Password
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Email Change Card */}
                                    <Card className="glass-card border-white/10">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Mail className="w-5 h-5 text-primary" />
                                                Admin Email
                                            </CardTitle>
                                            <CardDescription>
                                                Change your administrator email address
                                                {user?.email && (
                                                    <div className="mt-2 text-sm">
                                                        Current: <span className="text-primary font-medium">{user.email}</span>
                                                    </div>
                                                )}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {!showVerificationInput ? (
                                                <>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                            New Email Address
                                                        </label>
                                                        <Input
                                                            type="email"
                                                            value={newEmail}
                                                            onChange={(e) => setNewEmail(e.target.value)}
                                                            placeholder="Enter new email address"
                                                            className="bg-black/20"
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            A verification code will be sent to this email
                                                        </p>
                                                    </div>
                                                    <Button
                                                        onClick={handleRequestEmailChange}
                                                        disabled={!newEmail || isRequestingEmailChange}
                                                        className="w-full glow-green"
                                                    >
                                                        {isRequestingEmailChange && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Send Verification Code
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                                                        <p className="text-sm">
                                                            Verification code sent to: <span className="font-medium text-primary">{pendingEmail}</span>
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Code expires in 10 minutes
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                            Verification Code
                                                        </label>
                                                        <Input
                                                            type="text"
                                                            value={verificationCode}
                                                            onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                                            placeholder="Enter 6-digit code"
                                                            className="bg-black/20 text-center text-2xl tracking-widest"
                                                            maxLength={6}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={handleVerifyEmailChange}
                                                            disabled={verificationCode.length !== 6 || isVerifyingEmail}
                                                            className="flex-1 glow-green"
                                                        >
                                                            {isVerifyingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            Verify & Update Email
                                                        </Button>
                                                        <Button
                                                            onClick={() => {
                                                                setShowVerificationInput(false);
                                                                setVerificationCode("");
                                                                setPendingEmail("");
                                                            }}
                                                            variant="outline"
                                                            className="border-white/10"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
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
