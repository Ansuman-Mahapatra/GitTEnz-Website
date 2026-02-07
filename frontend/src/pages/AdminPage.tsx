import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Loader2, Save, BarChart3, Users, GitFork, Star, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
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
    Cell
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsData {
    totalUsers: number;
    totalRepos: number;
    totalFeedback: number;
    userGrowth: Record<string, number>;
    activeUsers: { username: string; repoCount: number }[];
    feedbackRatings: Record<string, number>;
}

export function AdminPage() {
    const { token, user } = useAuth();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

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

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/analytics`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setAnalytics(await res.json());
            } else {
                toast.error("Failed to load analytics");
            }
        } catch (error) {
            toast.error("Error loading data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleChangePassword = async () => {
        if (!newPassword) return;
        setIsChangingPassword(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/change-password`, {
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

    // Transform data for charts
    const userGrowthData = analytics ? Object.entries(analytics.userGrowth)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        : [];
    const feedbackData = analytics ? Object.entries(analytics.feedbackRatings).map(([rating, count]) => ({ name: `${rating} Stars`, value: count })) : [];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Shield className="w-8 h-8 text-primary" />
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">Platform Analytics & Security</p>
                </div>
                <Button onClick={fetchData} variant="outline" size="sm">
                    Refresh Data
                </Button>
            </header>

            {isLoading || !analytics ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Overview Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="glass-card border-white/10">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card border-white/10">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
                                <GitFork className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics.totalRepos}</div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card border-white/10">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                                <Star className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics.totalFeedback}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Section */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4 glass-card border-white/10">
                            <CardHeader>
                                <CardTitle>User Growth</CardTitle>
                                <CardDescription>New user registrations over time</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={userGrowthData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Line type="monotone" dataKey="count" stroke="#adfa1d" strokeWidth={2} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-3 glass-card border-white/10">
                            <CardHeader>
                                <CardTitle>Feedback Ratings</CardTitle>
                                <CardDescription>User satisfaction distribution</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={feedbackData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {feedbackData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="glass-card border-white/10">
                            <CardHeader>
                                <CardTitle>Top Active Users</CardTitle>
                                <CardDescription>Users with the most repositories</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.activeUsers} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff20" />
                                            <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis dataKey="username" type="category" width={100} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Bar dataKey="repoCount" fill="#adfa1d" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

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
                                    className="w-full"
                                >
                                    {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Change Password
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
