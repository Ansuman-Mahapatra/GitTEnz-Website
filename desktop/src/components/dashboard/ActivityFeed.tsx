import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GitCommit, GitBranch, GitMerge, Star, Plus, GitPullRequest, FolderGit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const activityIcons = {
  commit: GitCommit,
  branch: GitBranch,
  merge: GitMerge,
  star: Star,
  create: Plus,
  pull: GitPullRequest,
};

const activityColors = {
  commit: "text-blue-500",
  branch: "text-purple-500",
  merge: "text-blue-500",
  star: "text-yellow-500",
  create: "text-primary",
  pull: "text-orange-500",
};

const activityLabels = {
  commit: "Pushed",
  branch: "Created branch",
  merge: "Merged PR",
  star: "Starred",
  create: "Created repo",
  pull: "Pull request",
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface ActivityFeedProps {
  events?: any[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  const activities = events && events.length > 0
    ? events.map((event: any) => {
      let type: "commit" | "branch" | "merge" | "star" | "create" | "pull" = "commit";
      let message = "";
      let commits: { message: string; sha: string }[] = [];
      const repoFull = event.repo?.name || "unknown/repository";
      const parts = repoFull.split("/");
      const owner = parts[0] || "unknown";
      const repoName = parts[1] || "repository";

      if (event.type === "PushEvent") {
        type = "commit";
        if (event.payload?.commits && event.payload.commits.length > 0) {
          commits = event.payload.commits.map((c: any) => ({
            message: c.message,
            sha: (c.sha || "").substring(0, 7)
          }));
        } else {
          const branch = event.payload?.ref?.replace("refs/heads/", "") || "main";
          message = `Pushed to ${branch}`;
          if (event.payload?.head) {
            commits = [{ message: "Update", sha: event.payload.head.substring(0, 7) }];
          }
        }
      } else if (event.type === "CreateEvent") {
        if (event.payload?.ref_type === "branch") {
          type = "branch";
          message = `Created branch ${event.payload?.ref}`;
        } else {
          type = "create";
          message = "Created repository";
        }
      } else if (event.type === "PullRequestEvent") {
        const action = event.payload?.action || "opened";
        type = action === "opened" ? "pull" : "merge";
        message = `${action.charAt(0).toUpperCase() + action.slice(1)} PR #${event.payload?.number}`;
      } else if (event.type === "WatchEvent") {
        type = "star";
        message = "Starred repository";
      } else if (event.type === "IssuesEvent") {
        type = "pull";
        message = `${event.payload?.action} issue #${event.payload?.number}`;
      } else if (event.type === "ForkEvent") {
        type = "create";
        message = "Forked repository";
      } else {
        message = event.type?.replace("Event", "") || "Activity";
      }

      return {
        id: event.id,
        type,
        message,
        commits,
        repo: repoFull,
        repoName,
        owner,
        time: formatRelativeTime(event.created_at),
        timeFull: new Date(event.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      };
    })
      .filter((a: any) => a)
      .slice(0, 25)
    : [];

  // Recently used repos (unique, most recent first)
  const recentRepos = activities.length > 0
    ? [...new Map(activities.map((a: any) => [a.repo, a])).values()].slice(0, 5)
    : [];

  if (!activities || activities.length === 0) {
    return (
      <Card className="glass-card h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderGit2 className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <p className="text-sm text-muted-foreground">Pushes, pulls, and activity across your repositories</p>
        </CardHeader>
        <CardContent className="p-6 text-center text-muted-foreground text-sm">
          No recent activity found. Push code, open PRs, or star repos to see them here.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recently used repos */}
      {recentRepos.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recently Used Repositories</CardTitle>
            <p className="text-xs text-muted-foreground">Repos you've pushed, pulled, or contributed to recently</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentRepos.map((a: any) => (
                <Link
                  key={a.repo}
                  to={`/dashboard/repository/${a.owner}/${a.repoName}`}
                  className="inline-flex"
                >
                  <Badge variant="secondary" className="hover:bg-primary/20 hover:text-primary cursor-pointer transition-colors font-mono text-xs">
                    {a.repo}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity feed */}
      <Card className="glass-card h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderGit2 className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <p className="text-sm text-muted-foreground">Pushes, pulls, PRs, and more by repository</p>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[320px] px-6">
            <div className="space-y-5 pb-6 pt-2">
              {activities.map((activity: any, index: number) => {
                const Icon = activityIcons[activity.type] || GitCommit;
                const colorClass = activityColors[activity.type] || "text-gray-500";
                const label = activityLabels[activity.type] || "Activity";

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-start gap-3 group"
                  >
                    <motion.div
                      className={`mt-1 w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${colorClass}`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <Link
                          to={`/dashboard/repository/${activity.owner}/${activity.repoName}`}
                          className="text-sm font-medium text-primary hover:underline truncate"
                        >
                          {activity.repo}
                        </Link>
                        <span className="text-xs text-muted-foreground shrink-0" title={activity.timeFull}>
                          {activity.time}
                        </span>
                      </div>
                      <div className="mb-1">
                        <span className={`text-xs font-medium ${colorClass}`}>{label}</span>
                      </div>
                      {activity.commits && activity.commits.length > 0 ? (
                        <div className="space-y-1.5">
                          {activity.commits.map((commit: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-xs font-mono bg-muted px-1.5 rounded text-primary/70 shrink-0 mt-0.5">{commit.sha}</span>
                              <span className="text-foreground/90 leading-tight line-clamp-2">{commit.message}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-foreground/90">
                          {activity.message}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
