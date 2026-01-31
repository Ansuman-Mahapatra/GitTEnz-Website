import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const COLORS = ["#00E676", "#2979FF", "#FFC400", "#FF3D00", "#E040FB"];

interface LanguageData {
    name: string;
    value: number;
}

interface ActivityData {
    name: string;
    commits: number;
}

export function LanguageChart({ data }: { data?: LanguageData[] }) {
    const chartData = data && data.length > 0 ? data : [
        { name: "No Data", value: 1 }
    ];

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
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(10, 10, 10, 0.95)',
                                    border: '1px solid rgba(0, 230, 118, 0.4)',
                                    borderRadius: '8px',
                                    color: '#00E676',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
                                }}
                                itemStyle={{ color: '#00E676', fontWeight: 600 }}
                                labelStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center flex-wrap gap-4 text-xs text-muted-foreground mt-4">
                    {chartData.slice(0, 4).map((lang, i) => (
                        <div key={lang.name} className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            {lang.name}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export function ActivityChart({
    data,
    timeframe,
    onTimeframeChange
}: {
    data?: ActivityData[];
    timeframe: "weekly" | "monthly";
    onTimeframeChange: (val: "weekly" | "monthly") => void;
}) {
    const chartData = data && data.length > 0 ? data : [];

    return (
        <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Activity Report</CardTitle>
                <Select value={timeframe} onValueChange={(v: "weekly" | "monthly") => onTimeframeChange(v)}>
                    <SelectTrigger className="h-8 w-[100px] text-xs bg-muted/20 border-white/5">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00E676" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fill: '#666' }}
                                strokeOpacity={0.1}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                                interval={timeframe === 'monthly' ? 4 : 0}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(10, 10, 10, 0.95)',
                                    border: '1px solid rgba(0, 230, 118, 0.2)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
                                }}
                                cursor={{ stroke: 'rgba(0, 230, 118, 0.4)', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="commits"
                                stroke="#00E676"
                                strokeWidth={2}
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
