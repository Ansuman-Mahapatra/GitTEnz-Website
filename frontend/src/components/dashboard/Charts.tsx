
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const languageData = [
    { name: "TypeScript", value: 45 },
    { name: "Python", value: 25 },
    { name: "Rust", value: 15 },
    { name: "Go", value: 10 },
    { name: "Other", value: 5 },
];

const activityData = [
    { name: "Mon", commits: 4 },
    { name: "Tue", commits: 7 },
    { name: "Wed", commits: 2 },
    { name: "Thu", commits: 12 },
    { name: "Fri", commits: 9 },
    { name: "Sat", commits: 3 },
    { name: "Sun", commits: 5 },
];

export function LanguageChart() {
    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="text-sm font-medium">Language Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={languageData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {languageData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-4">
                    {languageData.slice(0, 3).map((lang, i) => (
                        <div key={lang.name} className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                            {lang.name}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function ActivityChart() {
    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="text-sm font-medium">Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData}>
                            <defs>
                                <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00E676" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} strokeOpacity={0.5} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="commits"
                                stroke="#00E676"
                                fillOpacity={1}
                                fill="url(#colorCommits)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
