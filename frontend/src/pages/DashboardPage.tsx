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
import { LanguageChart, ActivityChart } from "@/components/dashboard/Charts";

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localPath, setLocalPath] = useState("C:/Users/ansum/OneDrive/Desktop");
  const { token } = useAuth();

  const { data: repositories, isLoading } = useQuery({
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

  const { data: localRepositories, refetch: fetchLocalRepos } = useQuery({
    queryKey: ["local-repositories", localPath],
    queryFn: async () => {
      if (!localPath) return [];
      const res = await fetch(`http://localhost:8080/api/repos/local?path=${encodeURIComponent(localPath)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: false, // Wait for user action
  });

  // Data processing
  const displayRepos = repositories || [];

  const languageCounts: Record<string, number> = {};
  displayRepos.forEach((repo: any) => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });
  const realLanguageData = Object.entries(languageCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const calculateActivity = () => {
    // Mock activity based on updatedAt day just for demonstration if no commit history
    const activityCounts: Record<string, number> = {};
    const dayMap: Record<number, string> = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };

    displayRepos.forEach((repo: any) => {
      if (repo.updatedAt) {
        const d = new Date(repo.updatedAt);
        const dayName = dayMap[d.getDay()];
        activityCounts[dayName] = (activityCounts[dayName] || 0) + 1;
      }
    });

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      name: day,
      commits: activityCounts[day] || 0
    }));
  };
  const realActivityData = calculateActivity();

  const statsData = [
    { title: "Total Repositories", value: displayRepos.length, icon: FolderGit2, trend: "Synced from GitHub", trendUp: true },
    { title: "Total Forks", value: displayRepos.reduce((acc: number, r: any) => acc + (r.forksCount || 0), 0), icon: GitBranch, trend: "Across all repos", trendUp: true },
    { title: "Total Stars", value: displayRepos.reduce((acc: number, r: any) => acc + (r.stargazersCount || 0), 0), icon: Star, trend: "Across all repos", trendUp: true },
    { title: "Total Open Issues", value: displayRepos.reduce((acc: number, r: any) => acc + (r.openIssuesCount || 0), 0), icon: GitCommit, trend: "Needs attention", trendUp: false },
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsData.map((stat, index) => (
                <StatsCard key={stat.title} {...stat} index={index} />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LanguageChart data={realLanguageData.length > 0 ? realLanguageData : undefined} />
              <ActivityChart data={realActivityData} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold">Recent Repositories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayRepos.slice(0, 4).map((repo: any, index: number) => (
                    <RepositoryCard key={repo.id} repository={repo} index={index} />
                  ))}
                </div>
              </div>
              <div><ActivityFeed /></div>
            </div>
          </motion.div>
        );

      case "local-repos":
        return (
          <motion.div
            key="local-repos"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Local Repositories</h2>
              <div className="flex gap-4 items-center bg-card p-4 rounded-lg border">
                <input
                  type="text"
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  className="flex-1 bg-background border rounded px-3 py-2 text-sm text-foreground"
                  placeholder="Enter directory path (e.g. C:/Projects)"
                />
                <button
                  onClick={() => fetchLocalRepos()}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 text-sm font-medium"
                >
                  Scan Directory
                </button>
              </div>
            </div>

            {localRepositories && localRepositories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localRepositories.map((repo: any, index: number) => (
                  <RepositoryCard key={repo.name + index} repository={repo} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed text-muted-foreground">
                No local repositories found or scanned yet. enter a valid path and click Scan.
              </div>
            )}
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
            <CodeEditor initialCode="// Select a file to view code" />
          </motion.div>
        );

      case "settings":
        return (
          <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <SettingsPanel />
          </motion.div>
        );

      case "activity":
        return (
          <motion.div key="activity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Activity</h2>
            <div className="max-w-2xl"><ActivityFeed /></div>
          </motion.div>
        );

      case "starred":
        return (
          <motion.div key="starred" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Starred Repositories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayRepos.filter((_: any, i: number) => i % 2 === 0).map((repo: any, index: number) => (
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
    <div className="flex h-screen bg-background overflow-hidden relative">
      <AIAssistant />
      <div className="hidden lg:block">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
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
            <Sidebar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setMobileMenuOpen(false); }} />
          </motion.div>
        </motion.div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
