import { motion } from "framer-motion";
import { GitCommit, GitBranch, GitMerge, Star, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Activity {
  id: string;
  type: "commit" | "branch" | "merge" | "star" | "create";
  repo: string;
  time: string;
  commits?: { message: string; sha: string }[];
  message?: string;
  sha?: string;
}

const activityIcons = {
  commit: GitCommit,
  branch: GitBranch,
  merge: GitMerge,
  star: Star,
  create: Plus,
};

const activityColors = {
  commit: "text-green-500",
  branch: "text-purple-500",
  merge: "text-blue-500",
  star: "text-yellow-500",
  create: "text-primary",
};

interface ActivityFeedProps {
  events?: any[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  const activities = events && events.length > 0
    ? events.map((event: any) => {
      let type: "commit" | "branch" | "merge" | "star" | "create" = "commit";
      let message = "";
      let commits: { message: string; sha: string }[] = [];
      let repo = event.repo?.name || "repository";

      if (event.type === "PushEvent") {
        type = "commit";
        if (event.payload?.commits && event.payload.commits.length > 0) {
          commits = event.payload.commits.map((c: any) => ({
            message: c.message,
            sha: c.sha.substring(0, 7)
          }));
        } else {
          message = `Pushed to ${event.payload?.ref?.replace('refs/heads/', '')}`;
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
        type = "merge";
        message = `${event.payload?.action} PR #${event.payload?.number}`;
      } else if (event.type === "WatchEvent") {
        type = "star";
        message = "Starred repository";
      } else {
        message = event.type;
      }

      return {
        id: event.id,
        type,
        message,
        commits,
        repo: repo.replace("Ansuman-Mahapatra/", ""),
        time: new Date(event.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      };
    })
      .filter((a: any) => a)
      .slice(0, 15)
    : [];

  if (!activities || activities.length === 0) {
    return (
      <Card className="glass-card h-full">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-muted-foreground text-sm">
          No recent activity found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card h-full">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] px-6">
          <div className="space-y-6 pb-6 pt-2">
            {activities.map((activity: any, index: number) => {
              const Icon = activityIcons[activity.type] || GitCommit;
              const colorClass = activityColors[activity.type] || "text-gray-500";

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 group"
                >
                  <motion.div
                    className={`mt-1 w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${colorClass}`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                      <span>{activity.repo}</span>
                      <span>{activity.time}</span>
                    </div>

                    {activity.commits && activity.commits.length > 0 ? (
                      <div className="space-y-1.5">
                        {activity.commits.map((commit: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-xs font-mono bg-muted px-1.5 rounded text-primary/70 shrink-0 mt-0.5">{commit.sha}</span>
                            <span className="text-foreground/90 leading-tight">{commit.message}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-foreground font-medium">
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
  );
}
