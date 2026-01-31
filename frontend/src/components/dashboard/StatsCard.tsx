import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  index: number;
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp, index }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4, type: "spring" }}
      whileHover={{ y: -2 }}
    >
      <Card className="glass-card overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{title}</p>
              <motion.p 
                className="text-3xl font-bold text-foreground"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
              >
                {value}
              </motion.p>
              {trend && (
                <p className={`text-xs ${trendUp ? "text-github-green" : "text-github-red"}`}>
                  {trendUp ? "↑" : "↓"} {trend}
                </p>
              )}
            </div>
            <motion.div 
              className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
              whileHover={{ rotate: 10 }}
            >
              <Icon className="w-6 h-6 text-primary" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
