import { useState, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OnboardingModal } from "@/components/dashboard/OnboardingModal";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { LocalRepoViewer } from "@/components/dashboard/LocalRepoViewer";

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localPath, setLocalPath] = useState("C:/Users/ansum/OneDrive/Desktop");
  const [localReposResults, setLocalReposResults] = useState<any[]>([]);
  const [selectedLocalRepo, setSelectedLocalRepo] = useState<any>(null);

  // Onboarding & Streak State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [streakData, setStreakData] = useState({ count: 0, dates: [] as string[] });

  const { token } = useAuth();

  useEffect(() => {
    // Check Onboarding
    const onboardingDone = localStorage.getItem("gitten_onboarding_completed");
    if (!onboardingDone) {
      setShowOnboarding(true);
    }

    // Check Streak
    const storedStreak = localStorage.getItem("gitten_streak");
    let currentStreak = storedStreak ? JSON.parse(storedStreak) : { count: 0, dates: [], lastLogin: null };

    const todayStr = new Date().toDateString();
    const lastLoginDate = currentStreak.lastLogin ? new Date(currentStreak.lastLogin).toDateString() : null;

    // If first time login today
    if (lastLoginDate !== todayStr) {
      let newCount = currentStreak.count;

      if (lastLoginDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (yesterday.toDateString() === lastLoginDate) {
          // Streak continues
          newCount++;
        } else {
          // Streak broken
          newCount = 1;
        }
      } else {
        // First ever login
        newCount = 1;
      }

      currentStreak = {
        count: newCount,
        dates: [...currentStreak.dates, new Date().toISOString()],
        lastLogin: new Date().toISOString()
      };

      localStorage.setItem("gitten_streak", JSON.stringify(currentStreak));
    }

    setStreakData({ count: currentStreak.count, dates: currentStreak.dates });

  }, []);

  const handleOnboardingComplete = (data: any) => {
    localStorage.setItem("gitten_onboarding_completed", "true");
    localStorage.setItem("gitten_user_preferences", JSON.stringify(data));
    setShowOnboarding(false);
  };


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
            {/* Onboarding Modal */}
            <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingComplete} />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsData.map((stat, index) => (
                <StatsCard key={stat.title} {...stat} index={index} />
              ))}
            </div>

            {/* Charts Section including Streak */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <StreakCalendar loginDates={streakData.dates} streakCount={streakData.count} />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <LanguageChart data={realLanguageData.length > 0 ? realLanguageData : undefined} />
                <ActivityChart data={realActivityData} />
              </div>
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
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Local Repositories</h2>
                {localReposResults.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Found {localReposResults.length} projects
                  </div>
                )}
              </div>

              <Card className="glass-card border-dashed border-2 border-muted-foreground/20">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <FolderGit2 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Select your Projects Folder</h3>
                  <p className="text-muted-foreground max-w-md">
                    Select a directory to scan for local projects. We'll look for package.json, pom.xml, and other indicators.
                    <br /><span className="text-xs opacity-70">(Your files stay on your device)</span>
                  </p>
                  <Button
                    size="lg"
                    className="glow-green gap-2"
                    onClick={async () => {
                      try {
                        // @ts-ignore - File System Access API
                        const dirHandle = await window.showDirectoryPicker();
                        const newRepos: any[] = [];

                        // Iterate through subdirectories
                        // @ts-ignore
                        for await (const entry of dirHandle.values()) {
                          if (entry.kind === 'directory') {
                            const repoName = entry.name;

                            // Check for specific project files
                            let language = "Unknown";
                            let description = "Local Project";

                            try {
                              // Check for package.json (Node/JS/TS)
                              // @ts-ignore
                              const pkgHandle = await entry.getFileHandle('package.json').catch(() => null);
                              if (pkgHandle) language = "JavaScript/TypeScript";

                              // Check for pom.xml (Java)
                              // @ts-ignore
                              const pomHandle = await entry.getFileHandle('pom.xml').catch(() => null);
                              if (pomHandle) language = "Java";

                              // Check for requirements.txt (Python)
                              // @ts-ignore
                              const pyHandle = await entry.getFileHandle('requirements.txt').catch(() => null);
                              if (pyHandle) language = "Python";

                              // Check for Cargo.toml (Rust)
                              // @ts-ignore
                              const rustHandle = await entry.getFileHandle('Cargo.toml').catch(() => null);
                              if (rustHandle) language = "Rust";

                              // If we found a language indicator, treat as valid repo
                              if (language !== "Unknown" || pkgHandle || pomHandle) {
                                newRepos.push({
                                  name: repoName,
                                  description: `Local ${language} project`,
                                  language: language,
                                  visibility: "local",
                                  stargazersCount: 0,
                                  forksCount: 0,
                                  updatedAt: new Date().toISOString(),
                                  handle: entry // Store the handle!
                                });
                              }
                            } catch (e) {
                              console.error("Error determining repo type", e);
                            }
                          }
                        }

                        // @ts-ignore
                        setLocalReposResults(newRepos);

                      } catch (err) {
                        console.error("User cancelled or API not supported", err);
                      }
                    }}
                  >
                    <FolderGit2 className="w-4 h-4" />
                    Browse Folder
                  </Button>
                </CardContent>
              </Card>
            </div>

            {localReposResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localReposResults.map((repo: any, index: number) => (
                  <div key={repo.name + index} onClick={() => setSelectedLocalRepo(repo)} className="cursor-pointer hover:scale-[1.01] transition-transform">
                    <RepositoryCard repository={repo} index={index} />
                  </div>
                ))}
              </div>
            ) : null}

            {/* Local Repo Viewer Modal */}
            {selectedLocalRepo && (
              <LocalRepoViewer
                isOpen={!!selectedLocalRepo}
                onClose={() => setSelectedLocalRepo(null)}
                repoName={selectedLocalRepo.name}
                dirHandle={selectedLocalRepo.handle}
              />
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
