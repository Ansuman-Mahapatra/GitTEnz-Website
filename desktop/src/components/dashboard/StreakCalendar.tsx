import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCalendarProps {
    loginDates: string[]; // ISO string dates
    streakCount: number;
}

export function StreakCalendar({ loginDates, streakCount }: StreakCalendarProps) {
    // Generate calendar days for current month
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay(); // 0 = Sunday

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const isDayLoggedIn = (day: number) => {
        const checkDate = new Date(today.getFullYear(), today.getMonth(), day).toDateString();
        return loginDates.some(date => new Date(date).toDateString() === checkDate);
    };

    return (
        <div className="bg-card rounded-xl border p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-lg">Daily Streak</h3>
                    <p className="text-sm text-muted-foreground">Keep coding every day!</p>
                </div>
                <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 px-3 py-1.5 rounded-full border border-orange-500/20">
                    <Flame className="w-5 h-5 fill-orange-500 animate-pulse" />
                    <span className="font-bold text-lg">{streakCount} Days</span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={d + i} className="text-muted-foreground text-xs py-1">{d}</div>
                ))}
                {paddingDays.map((_, i) => (
                    <div key={`pad-${i}`} />
                ))}
                {days.map(day => {
                    const loggedIn = isDayLoggedIn(day);
                    const isToday = day === today.getDate();

                    return (
                        <div
                            key={day}
                            className={cn(
                                "aspect-square flex items-center justify-center rounded-md text-sm transition-all relative group",
                                loggedIn ? "bg-primary text-primary-foreground font-bold shadow-sm" : "bg-muted/30 text-muted-foreground",
                                isToday && !loggedIn && "border-2 border-primary text-primary bg-transparent"
                            )}
                        >
                            {day}
                            {loggedIn && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute inset-0 bg-blue-500/20 rounded-md"
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
