import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { API_URL } from "@/config";
import { motion } from "framer-motion";
import { FolderGit2, GitBranch, GitCommit, Star, Menu, Search, Rocket, RefreshCw, Bell, Trash2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { RepositoryCard } from "@/components/dashboard/RepositoryCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { InlineAiProvider } from "@/components/ai/InlineAiProvider";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { LanguageChart, ActivityChart } from "@/components/dashboard/Charts";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OnboardingModal } from "@/components/dashboard/OnboardingModal";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { LocalRepoViewer } from "@/components/dashboard/LocalRepoViewer";
import { HelpSection } from "@/components/dashboard/HelpSection";
import { PrivacyPolicySection } from "@/components/dashboard/PrivacyPolicySection";
import { toast } from "sonner";
import { EtheralShadow } from "@/components/ui/etheral-shadow";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { GitPushAnalyzerModal } from "@/components/dashboard/GitPushAnalyzerModal";

export function DashboardPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localPath, setLocalPath] = useState("C:/Users/ansum/OneDrive/Desktop");
  const [localReposResults, setLocalReposResults] = useState<any[]>([]);
  const [selectedLocalRepo, setSelectedLocalRepo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Onboarding & Streak State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [streakData, setStreakData] = useState({ count: 0, dates: [] as string[] });

  // Activity State
  const [activityTimeframe, setActivityTimeframe] = useState<"weekly" | "monthly">("weekly");

  // Git Analyzer Modal State
  const [analyzerParams, setAnalyzerParams] = useState<{ dirHandle: any } | null>(null);

  // Dialog state for notifications
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Yes",
    cancelText: "Cancel",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const confirmDialog = (title: string, description: string, confirmText = "Yes", cancelText = "Cancel") => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        isOpen: true,
        title,
        description,
        confirmText,
        cancelText,
        onConfirm: () => {
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  };

  // ─── Caching Helpers (User-Specific) ──────────────────────────
  const getCached = (key: string) => {
    try {
      const userKey = user?.username || "anon";
      const cached = localStorage.getItem(`gittenz_cache_${userKey}_${key}`);
      return cached ? JSON.parse(cached) : undefined;
    } catch {
      return undefined;
    }
  };
  const setCached = (key: string, data: any) => {
    try {
      const userKey = user?.username;
      if (!userKey) return;
      localStorage.setItem(`gittenz_cache_${userKey}_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to cache data", e);
    }
  };

  // Clear search when switching tabs
  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  const { token, user, setToken, signOut } = useAuth();
  // We can't update user easily in AuthContext without a setUser exposed. 
  // For now we just hide modal, next reload will be fine if backend updated.

  useEffect(() => {
    // Validate username in URL
    if (user && username && user.username !== username) {
      // If user is trying to access another user's dashboard (which is private), redirect to their own
      navigate(`/dashboard/${user.username}`, { replace: true });
      return;
    }

    // Check Onboarding via User Profile
    if (user && user.onboardingCompleted === false) {
      setShowOnboarding(true);
    } else if (user && user.onboardingCompleted === true) {
      setShowOnboarding(false);
    }

    // Check Streak (per-user: each user has their own streak)
    if (user) {
      const streakKey = `gitten_streak_${user.username || user.id || "anonymous"}`;
      const storedStreak = localStorage.getItem(streakKey);
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

        localStorage.setItem(streakKey, JSON.stringify(currentStreak));
      }

      setStreakData({ count: currentStreak.count, dates: currentStreak.dates });
    }

  }, [user]);

  const handleOnboardingComplete = async (data: any) => {
    try {
      if (token) {
        await fetch(`${API_URL}/api/user/onboarding`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        // Force page reload to refresh user state or just hide modal
        // Ideally we update context, but for now:
        window.location.reload();
      }
    } catch (e) {
      console.error("Failed to save onboarding status", e);
    }
    localStorage.setItem("gitten_user_preferences", JSON.stringify(data));
    setShowOnboarding(false);
  };


  const { data: repositories, isLoading, refetch: refetchRepos } = useQuery({
    queryKey: ["repositories"],
    initialData: getCached("repos"),
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch(`${API_URL}/api/repos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) signOut();
        throw new Error("Failed to fetch repositories");
      }
      const data = await res.json();
      setCached("repos", data);
      return data;
    },
    enabled: !!token,
    refetchInterval: 300000, 
  });

  const { data: deletedRepositoriesData, refetch: refetchDeleted } = useQuery({
    queryKey: ["deleted-repositories"],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch(`${API_URL}/api/repos/deleted`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch deleted repositories");
      return await res.json();
    },
    enabled: !!token,
    refetchInterval: 300000,
  });

  // Data processing
  const activeRepos = repositories || [];
  const deletedRepos = deletedRepositoriesData || [];
  const displayRepos = activeRepos; // Default list and charts focus on live projects

  // FIXED: Use a Map to aggregate totals across ALL repos for accuracy
  const languageMap = new Map<string, number>();
  displayRepos.forEach((repo: any) => {
    if (repo.language) {
      const count = languageMap.get(repo.language) || 0;
      languageMap.set(repo.language, count + 1);
    }
  });

  const realLanguageData = Array.from(languageMap.entries())
    .map(([name, value]) => ({ name, value }))
    .slice(0, 10); // Show top 10
    
  // Fetch Notifications
  const { data: notifications, refetch: refetchNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return await res.json();
    },
    enabled: !!token,
    refetchInterval: 60000, // Refresh every minute
  });

  const markNotificationRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      refetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Real GitHub Activity
  const { data: activityEvents } = useQuery({
    queryKey: ["github-activity", activityTimeframe],
    initialData: getCached(`activity_${activityTimeframe}`),
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch(`${API_URL}/api/user/activity`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) signOut();
        throw new Error("Failed to fetch activity");
      }
      const data = await res.json();
      setCached(`activity_${activityTimeframe}`, data);
      return data;
    },
    enabled: !!token,
    refetchInterval: 300000,
  });

  // Toaster Notification for Real-Time Activity
  const [prevEventCount, setPrevEventCount] = useState(0);

  useEffect(() => {
    const safeEvents = Array.isArray(activityEvents) ? activityEvents : [];
    if (safeEvents.length > 0) {
      // On first load, just set the count
      if (prevEventCount === 0) {
        setPrevEventCount(safeEvents.length);
      }
      // If new events arrived
      else if (safeEvents.length > prevEventCount) {
        const newEventsCount = safeEvents.length - prevEventCount;
        const latestEvent = safeEvents[0]; // Assuming API returns sorted by latest

        // Find simpler message
        let eventType = "Activity";
        if (latestEvent.type === "PushEvent") eventType = "New Push";
        else if (latestEvent.type === "PullRequestEvent") eventType = "New Pull Request";
        else if (latestEvent.type === "IssuesEvent") eventType = "New Issue";
        else if (latestEvent.type === "CreateEvent") eventType = "New Repository/Branch";

        if (user?.notificationPreferences?.pushNotifications !== false) {
          toast.info(eventType, {
            description: `Detected in ${latestEvent.repo?.name || 'repository'}`,
          });
        }

        setPrevEventCount(safeEvents.length);
      }
    }
  }, [activityEvents, prevEventCount, user]);

  const { data: starredRepos } = useQuery({
    queryKey: ["starred-repositories"],
    initialData: getCached("starred"),
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch(`${API_URL}/api/user/starred`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) signOut();
        throw new Error("Failed to fetch starred repos");
      }
      const data = await res.json();
      setCached("starred", data);
      return data;
    },
    enabled: !!token,
    refetchInterval: 300000,
  });

  // Safely handle API objects vs arrays
  let safeEvents: any[] = [];
  if (Array.isArray(activityEvents)) {
    safeEvents = activityEvents;
  }
  
  const calculateRealActivity = () => {
    // If no events loaded yet, just return zeros for the timeframe
    // This prevents "empty" chart flashing if loading is slow
    const activityMap: Record<string, number> = {};
    const today = new Date();

    // Determine data range (Weekly = 7 days, Monthly = 30 days)
    const daysToShow = activityTimeframe === 'weekly' ? 7 : 30;

    // Initialize chart with 0s for every day in the range
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
      activityMap[key] = 0;
    }

    if (safeEvents && safeEvents.length > 0) {
      safeEvents.forEach((event: any) => {
        // We only care about PushEvent (commits), but also include specific other events for "User Activity"
        // Parsing dates from API which are UTC
        const eventDate = new Date(event.created_at);
        const dateKey = eventDate.toISOString().split('T')[0];

        if (activityMap[dateKey] !== undefined) {
          let contribution = 0;
          if (event.type === "PushEvent") {
            contribution = event.payload?.size || 1;
          } else if (event.type === "PullRequestEvent" || event.type === "CreateEvent") {
            contribution = 1;
          }

          if (contribution > 0) {
            activityMap[dateKey] += contribution;
          }
        }
      });
    }

    // Convert map to array for Recharts
    return Object.entries(activityMap)
      .map(([date, count]) => {
        const d = new Date(date);
        let name;
        if (activityTimeframe === 'weekly') {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          // Use UTC day to avoid timezone shifting issues as the KEY is date string (UTC)
          name = days[d.getUTCDay()];
        } else {
          // Format: "1 Jan"
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          name = `${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
        }
        return { name, date, commits: count };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const realActivityData = calculateRealActivity();

  // Filter for Last 90 Days activity metrics to capture the user's historical pushes
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const last90DaysEvents = safeEvents.filter((e: any) => new Date(e.created_at) >= ninetyDaysAgo);

  const totalPushes = last90DaysEvents.filter((e: any) => e.type === "PushEvent").length;
  const totalPRs = last90DaysEvents.filter((e: any) => e.type === "PullRequestEvent").length;

  // Filter Data based on Search Query
  const filteredRepos = displayRepos
    .filter((repo: any) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        repo.name?.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query) ||
        repo.language?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const filteredActivity = safeEvents.filter((event: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    // Check repo name
    if (event.repo?.name?.toLowerCase().includes(query)) return true;

    // Check commit messages
    if (event.type === "PushEvent" && event.payload?.commits) {
      if (event.payload.commits.some((c: any) => c.message.toLowerCase().includes(query))) return true;
    }

    // Check PR/Issue titles
    if (event.type === "PullRequestEvent" && event.payload?.pull_request) {
      if (event.payload.pull_request.title?.toLowerCase().includes(query)) return true;
    }
    if (event.type === "IssuesEvent" && event.payload?.issue) {
      if (event.payload.issue.title?.toLowerCase().includes(query)) return true;
    }

    return false;
  });

  const filteredLocalRepos = localReposResults
    .filter((repo: any) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return repo.name.toLowerCase().includes(query);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const statsData = [
    { title: "Total Repositories", value: displayRepos.length, icon: FolderGit2, trend: "Synced from GitHub", trendUp: true },
    { title: "Total Pushes", value: totalPushes, icon: GitCommit, trend: "Last 90 Days", trendUp: totalPushes > 0 },
    { title: "Total Pull Requests", value: totalPRs, icon: GitBranch, trend: "Last 90 Days", trendUp: totalPRs > 0 },
    { title: "Unread Notifications", value: notifications?.filter((n: any) => !n.read).length || 0, icon: Bell, trend: "New alerts", trendUp: (notifications?.filter((n: any) => !n.read).length || 0) > 0 },
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
            {/* Sync Data Button (Top Left) */}
            <div className="flex justify-start">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 text-xs h-8 bg-background/50 hover:bg-primary/10 border-white/10"
                onClick={() => {
                  window.location.reload();
                }}
              >
                <Rocket className="w-3.5 h-3.5" />
                Sync Data
              </Button>
            </div>

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
                <ActivityChart
                  data={realActivityData}
                  timeframe={activityTimeframe}
                  onTimeframeChange={setActivityTimeframe}
                />
              </div>
            </div>

            {/* Recently Worked Repositories */}
            {!searchQuery && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <GitCommit className="w-5 h-5 text-primary" />
                  Recently Worked Repositories
                </h2>
                {(() => {
                  // Derive unique repositories from activity log
                  const recentRepoNames = new Set<string>();
                  const recentRepos: any[] = [];

                  if (safeEvents && safeEvents.length > 0) {
                    safeEvents.forEach((event: any) => {
                      if (event.repo && !recentRepoNames.has(event.repo.name)) {
                        recentRepoNames.add(event.repo.name);
                        const fullRepo = displayRepos.find((r: any) => r.full_name === event.repo.name || r.name === event.repo.name);
                        if (fullRepo) {
                          recentRepos.push(fullRepo);
                        } else {
                          recentRepos.push({
                            id: event.repo.id,
                            name: event.repo.name,
                            description: "Recently active",
                            language: "Unknown",
                            stargazers_count: 0,
                            forks_count: 0,
                            updated_at: event.created_at
                          });
                        }
                      }
                    });
                  }

                  // Fallback: If no activity found, show latest updated repos from the general list
                  if (recentRepos.length === 0 && displayRepos.length > 0) {
                    const sortedRepos = [...displayRepos].sort((a, b) => 
                      new Date(b.updated_at || b.pushed_at || 0).getTime() - 
                      new Date(a.updated_at || a.pushed_at || 0).getTime()
                    );
                    recentRepos.push(...sortedRepos.slice(0, 4));
                  }

                  // Take top 4
                  const slicedRecent = recentRepos.slice(0, 4);

                  if (slicedRecent.length === 0) {
                    return <p className="text-muted-foreground text-sm">No recent activity found. Start working to see repositories here!</p>;
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {slicedRecent.map((repo: any, index: number) => (
                        <RepositoryCard key={'recent-' + repo.id} repository={repo} index={index} />
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Main Content: All Repositories removed from Dashboard, moved to Repositories tab */}
            {/* Show matching commits/activity if searching */}
            {searchQuery && (
              <div className="space-y-4 pt-4">
                <h2 className="text-lg font-semibold">Matching Commits & Activity</h2>
                {filteredActivity.length > 0 ? (
                  <div className="max-w-3xl">
                    <ActivityFeed events={filteredActivity.slice(0, 5)} />
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No matching commits or activity found.</p>
                )}
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
              <h2 className="text-2xl font-bold">All Repositories</h2>
              <div className="text-sm text-muted-foreground">
                {filteredRepos.length} repositories
              </div>
            </div>

            {filteredRepos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredRepos.map((repo: any, index: number) => (
                  <RepositoryCard key={repo.id} repository={repo} index={index} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <p>No repositories found. {searchQuery && "Try adjusting your search."}</p>
              </div>
            )}
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
                        const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
                        setAnalyzerParams({ dirHandle });
                      } catch (err: any) {
                        if (err.name === 'AbortError') {
                          console.log("User cancelled selection");
                        } else {
                          console.error("Local repo error", err);
                          toast.error("Failed to access folder. Browser may not support this feature or permission denied.");
                        }
                      }
                    }}
                  >
                    <FolderGit2 className="w-4 h-4" />
                    Select Project Folder
                  </Button>
                </CardContent>
              </Card>
            </div>

            {filteredLocalRepos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLocalRepos.map((repo: any, index: number) => (
                  <div key={repo.name + index} onClick={() => setSelectedLocalRepo(repo)} className="cursor-pointer hover:scale-[1.01] transition-transform">
                    <RepositoryCard repository={repo} index={index} />
                  </div>
                ))}
              </div>
            ) : null}

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

      case "notifications":
        return (
          <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Notifications</h2>
                <p className="text-muted-foreground text-sm">Read notifications will be automatically cleared on next refresh.</p>
              </div>
              {(notifications || []).some((n: any) => !n.read) && (
                <Button variant="outline" size="sm" onClick={() => notifications.forEach((n: any) => !n.read && markNotificationRead(n.id))} className="border-primary/20 text-primary">
                  Mark all as read
                </Button>
              )}
            </div>

            <div className="max-w-2xl space-y-3">
              {notifications && notifications.length > 0 ? (
                notifications.map((notif: any) => (
                  <Card key={notif.id} className={`glass-card transition-all ${notif.read ? 'opacity-60 grayscale' : 'border-primary/20 bg-primary/5'}`}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.read ? 'bg-muted-foreground' : 'bg-primary animate-pulse'}`} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            notif.type === 'PUSH' ? 'bg-blue-400/10 text-blue-400' :
                            notif.type === 'PULL' ? 'bg-purple-400/10 text-purple-400' :
                            notif.type === 'ISSUE' ? 'bg-orange-400/10 text-orange-400' :
                            'bg-green-400/10 text-green-400'
                          }`}>
                            {notif.type}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{notif.message}</p>
                        {notif.link && (
                          <a href={notif.link} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                            <Rocket className="w-3 h-3" /> View Source
                          </a>
                        )}
                      </div>
                      {!notif.read && (
                        <Button variant="ghost" size="sm" onClick={() => markNotificationRead(notif.id)} className="h-8 text-xs">
                          Mark Read
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-20 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No new notifications. Everything looks clear!</p>
                </div>
              )}
            </div>
          </motion.div>
        );

      case "activity":
        return (
          <motion.div key="activity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <p className="text-muted-foreground">Repositories you've recently used — pushes, pulls, PRs, and more</p>
            <div className="max-w-3xl"><ActivityFeed events={filteredActivity} /></div>
          </motion.div>
        );

      case "help":
        return (
          <motion.div key="help" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <HelpSection />
          </motion.div>
        );

      case "privacy":
        return (
          <motion.div key="privacy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <PrivacyPolicySection />
          </motion.div>
        );

      case "starred":
        return (
          <motion.div key="starred" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Starred Repositories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {starredRepos?.map((repo: any, index: number) => (
                <RepositoryCard key={repo.id} repository={repo} index={index} />
              ))}
            </div>
          </motion.div>
        );

      case "deleted-repos":
        return (
          <motion.div key="deleted-repos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Deleted Repositories</h2>
                <p className="text-muted-foreground text-sm">Repositories that were found in our data but are now missing from GitHub.</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {deletedRepos.length} total
              </div>
            </div>

            {deletedRepos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {deletedRepos.map((repo: any, index: number) => (
                  <div key={repo.id} className="relative group grayscale">
                    <RepositoryCard repository={repo} index={index} />
                    <div className="absolute top-2 right-2 bg-destructive/10 text-destructive text-[10px] px-2 py-0.5 rounded border border-destructive/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Deleted: {repo.deletedAt ? new Date(repo.deletedAt).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 border border-dashed rounded-xl border-white/10">
                <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">No deleted repositories found. Your sync is healthy!</p>
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-transparent overflow-hidden relative">
      <div className="relative z-10 flex w-full h-full">
        <AIAssistant />
        <InlineAiProvider />
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
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <header className="flex items-center justify-between p-4 lg:p-6 border-b border-border/50 sticky top-0 bg-background/50 backdrop-blur-md z-30">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-gradient hidden sm:block">GitTEnz</h1>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-primary/20 hover:border-primary/50 hidden sm:flex"
                onClick={() => {
                  refetchRepos();
                  refetchDeleted();
                  toast.success("Synchronizing with GitHub...");
                }}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sync Data</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {activeTab === "repositories" && (
              <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search repositories..."
                    className="pl-9 bg-background/50 border-white/10 focus-visible:ring-primary/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Website Notification Dialog */}
      <AlertDialog open={dialogState.isOpen} onOpenChange={(open) => !open && dialogState.onCancel()}>
        <AlertDialogContent className="glass-card border-primary/20 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogState.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {dialogState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={dialogState.onCancel} className="hover:bg-white/5 border-white/10">
              {dialogState.cancelText || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={dialogState.onConfirm} className="glow-green flex-1 sm:flex-none">
              {dialogState.confirmText || "Yes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* GitPushAnalyzer Modal */}
      <GitPushAnalyzerModal 
        isOpen={!!analyzerParams} 
        onClose={() => setAnalyzerParams(null)} 
        dirHandle={analyzerParams?.dirHandle || null} 
        username={user?.username || 'user'}
        onContinue={(analysis) => {
           if(analyzerParams?.dirHandle) {
             const newRepo = {
                name: analyzerParams.dirHandle.name,
                description: `Local ${analysis.language} project`,
                language: analysis.language,
                visibility: "local",
                stargazersCount: 0,
                forksCount: 0,
                updatedAt: new Date().toISOString(),
                handle: analyzerParams.dirHandle
             };
             // @ts-ignore
             setLocalReposResults([newRepo]);
             toast.success("Project successfully onboarded and loaded!");
           }
           setAnalyzerParams(null);
        }}
      />
    </div>
  );
}
