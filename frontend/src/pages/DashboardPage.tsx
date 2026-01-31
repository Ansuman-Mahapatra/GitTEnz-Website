import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { FolderGit2, GitBranch, GitCommit, Star } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { RepositoryCard } from "@/components/dashboard/RepositoryCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

// Mock data
const mockRepositories = [
  { id: 1, name: "gittenz-core", description: "Core library for GitTEnz platform", language: "TypeScript", stargazersCount: 128, forksCount: 24, watchersCount: 56, visibility: "public", updatedAt: "2024-01-15", htmlUrl: "#" },
  { id: 2, name: "ai-assistant", description: "AI-powered code assistant module", language: "Python", stargazersCount: 89, forksCount: 12, watchersCount: 34, visibility: "public", updatedAt: "2024-01-14", htmlUrl: "#" },
  { id: 3, name: "dashboard-ui", description: "Beautiful dashboard components", language: "TypeScript", stargazersCount: 256, forksCount: 45, watchersCount: 78, visibility: "public", updatedAt: "2024-01-13", htmlUrl: "#" },
  { id: 4, name: "api-gateway", description: "API gateway and authentication", language: "Go", stargazersCount: 67, forksCount: 8, watchersCount: 23, visibility: "private", updatedAt: "2024-01-12", htmlUrl: "#" },
  { id: 5, name: "mobile-app", description: "React Native mobile application", language: "JavaScript", stargazersCount: 45, forksCount: 5, watchersCount: 18, visibility: "private", updatedAt: "2024-01-11", htmlUrl: "#" },
  { id: 6, name: "rust-utils", description: "High-performance utility functions", language: "Rust", stargazersCount: 112, forksCount: 19, watchersCount: 45, visibility: "public", updatedAt: "2024-01-10", htmlUrl: "#" },
];



export function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { token } = useAuth();

  const { data: repositories, isLoading, error } = useQuery({
    queryKey: ["repositories"],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch("http://localhost:8080/api/repos", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!token,
  });

  // Use real data or empty array. mockRepositories only if explicitly disconnected (not this case)
  const displayRepos = repositories || [];

  const totalStars = displayRepos.reduce((acc: number, repo: any) => acc + (repo.stargazersCount || 0), 0);
  const totalForks = displayRepos.reduce((acc: number, repo: any) => acc + (repo.forksCount || 0), 0);

  const statsData = [
    { title: "Total Repositories", value: displayRepos.length, icon: FolderGit2, trend: "Synced from GitHub", trendUp: true },
    { title: "Total Forks", value: totalForks, icon: GitBranch, trend: "Across all repos", trendUp: true },
    { title: "Total Stars", value: totalStars, icon: Star, trend: "Across all repos", trendUp: true },
    { title: "Total Open Issues", value: displayRepos.reduce((acc: number, repo: any) => acc + (repo.openIssuesCount || 0), 0), icon: GitCommit, trend: "Needs attention", trendUp: false },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsData.map((stat, index) => (
                <StatsCard key={stat.title} {...stat} index={index} />
              ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Repositories */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold">Recent Repositories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayRepos.slice(0, 4).map((repo: any, index: number) => (
                    <RepositoryCard key={repo.id} repository={repo} index={index} />
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div>
                <ActivityFeed />
              </div>
            </div>
          </motion.div>
        );

      case "repositories":
        return (
          <motion.div
            key="repositories"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Repositories</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayRepos.map((repo: any, index: number) => (
                <RepositoryCard key={repo.id} repository={repo} index={index} />
              ))}
            </div>
          </motion.div>
        );

      case "editor":
      case "branches":
      case "commits":
        return (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <CodeEditor />
          </motion.div>
        );

      case "ai-assistant":
        return (
          <motion.div
            key="ai"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-[calc(100vh-10rem)]"
          >
            <AIAssistant />
          </motion.div>
        );

      case "settings":
        return (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <SettingsPanel />
          </motion.div>
        );

      case "activity":
        return (
          <motion.div
            key="activity"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">Activity</h2>
            <div className="max-w-2xl">
              <ActivityFeed />
            </div>
          </motion.div>
        );

      case "starred":
        return (
          <motion.div
            key="starred"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">Starred Repositories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayRepos.filter((_, i) => i % 2 === 0).map((repo: any, index: number) => (
                <RepositoryCard key={repo.id} repository={repo} index={index} />
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Mobile Sidebar Overlay */}
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
            <Sidebar activeTab={activeTab} onTabChange={(tab) => {
              setActiveTab(tab);
              setMobileMenuOpen(false);
            }} />
          </motion.div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
