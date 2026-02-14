import { useNavigate } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import {
  Home,
  FolderGit2,
  Settings,
  Star,
  History,
  LogOut,
  Bell,
  Users,
  MessageSquare,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const userMenuItems = [
  { id: "dashboard", icon: Home, label: "Dashboard" },
  { id: "repositories", icon: FolderGit2, label: "Repositories" },
  { id: "local-repos", icon: FolderGit2, label: "Local Repos" },
  { id: "activity", icon: History, label: "Activity" },
  { id: "starred", icon: Star, label: "Starred" },
  { id: "settings", icon: Settings, label: "Settings" },
];

const adminMenuItems = [
  { id: "admin-dashboard", icon: Home, label: "Dashboard" },
  { id: "admin-users", icon: Users, label: "Users" },
  { id: "admin-feedbacks", icon: MessageSquare, label: "Feedbacks" },
  { id: "admin-settings", icon: Settings, label: "Settings" },
];

const bottomItems = [
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "help", icon: HelpCircle, label: "Help & Feedback" },
];

const sidebarVariants: Variants = {
  hidden: { x: -280, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      {/* Logo */}
      <motion.div
        variants={itemVariants}
        className="p-6 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center glow-green overflow-hidden">
          <img src="/logo1.png" alt="GitTEnz" className="w-full h-full object-cover" />
        </div>
        <span className="text-xl font-bold text-gradient">GitTEnz</span>
      </motion.div>

      <Separator className="mx-4 w-auto" />

      {/* User Profile */}
      {user && (
        <motion.div variants={itemVariants} className="p-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
            <Avatar className="w-10 h-10 ring-2 ring-primary/30">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.name || user.username}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-1">
          {(user?.username === "admin" ? adminMenuItems : userMenuItems).map((item) => (
            <motion.button
              key={item.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (user?.username === "admin") {
                  // For admin, we might want to route differently or pass a tab ID
                  // For now, let's assume the AdminPage handles these IDs as tabs if we are already there,
                  // OR we assume we are navigating to /admin with a query param?
                  // Simpler: The user asked for "different dashboard".
                  // Let's stick to onTabChange but if it's admin, we might need to handle routing.
                  // If the parent component (DashboardPage) is rendering this, it expects standard tabs.
                  // But the Admin view is likely separate.

                  // Actually, if we are in /admin, we want to control the admin tabs.
                  // If we are in /dashboard, access should probably redirect to /admin.

                  // Let's rely on standard onTabChange, but the parent needs to know what to do.
                  // Alternatively, standard user items redirect to /dashboard routes.
                  // Admin items redirect to /admin routes.

                  if (item.id.startsWith("admin-")) {
                    const tabMap: Record<string, string> = {
                      "admin-dashboard": "overview",
                      "admin-users": "users",
                      "admin-feedbacks": "feedback",
                      "admin-settings": "settings"
                    };
                    navigate(`/dashboard/admin?tab=${tabMap[item.id] || "overview"}`);
                  } else {
                    onTabChange(item.id);
                  }
                } else {
                  onTabChange(item.id);
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === item.id || (window.location.pathname === "/dashboard/admin" && (() => { const t = new URLSearchParams(window.location.search).get("tab") || "overview"; const m: Record<string, string> = { overview: "admin-dashboard", users: "admin-users", feedback: "admin-feedbacks", settings: "admin-settings" }; return item.id === m[t]; })())
                  ? "bg-primary text-primary-foreground glow-green"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </motion.button>
          ))}
        </div>
      </nav>

      <Separator className="mx-4 w-auto" />

      {/* Bottom Actions */}
      <div className="p-3 space-y-1">
        {/* Removed the extra "Admin Panel" button since they have a full menu now */}
        {/* Removed the extra "Admin Panel" button since they have a full menu now */}
        {bottomItems
          .filter(item => {
            if (user?.username === "admin") {
              // Admin should not see Help or duplicate Settings in bottom bar
              return item.id !== "help" && item.id !== "settings";
            }
            return true;
          })
          .map((item) => (
            <motion.button
              key={item.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === item.id
                  ? "bg-accent text-accent-foreground glow-purple"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </motion.button>
          ))}

        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start gap-3 px-4 py-3 h-auto text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </motion.aside>
  );
}
