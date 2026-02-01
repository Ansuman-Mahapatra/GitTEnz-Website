import { motion } from "framer-motion";
import { GitCommit, GitBranch, GitMerge, Star, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Activity {
  id: string;
  type: "commit" | "branch" | "merge" | "star" | "create";
  message: string;
  repo: string;
  time: string;
}

const mockActivities: Activity[] = [
  { id: "1", type: "commit", message: "Fixed authentication bug", repo: "gittenz/core", time: "2 minutes ago" },
  { id: "2", type: "branch", message: "Created feature/new-ui", repo: "gittenz/frontend", time: "15 minutes ago" },
  { id: "3", type: "merge", message: "Merged PR #42", repo: "gittenz/api", time: "1 hour ago" },
  { id: "4", type: "star", message: "Starred repository", repo: "awesome/project", time: "2 hours ago" },
  { id: "5", type: "create", message: "Created new repository", repo: "my-new-app", time: "3 hours ago" },
  { id: "6", type: "commit", message: "Updated dependencies", repo: "gittenz/core", time: "5 hours ago" },
];

const activityIcons = {
  commit: GitCommit,
  branch: GitBranch,
  merge: GitMerge,
  star: Star,
  create: Plus,
};

const activityColors = {
  commit: "text-github-green",
  branch: "text-github-purple",
  merge: "text-github-blue",
  star: "text-github-orange",
  create: "text-primary",
};

interface ActivityFeedProps {
  events?: any[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  const activities = events && events.length > 0
    ? events.slice(0, 10).map((event: any) => {
      let type: "commit" | "branch" | "merge" | "star" | "create" = "commit";
      let message = "Unknown activity";
      let repo = event.repo?.name || "repository";

      if (event.type === "PushEvent") {
        type = "commit";
        message = `Pushed ${event.payload?.size || 1} commit(s)`;
        if (event.payload?.commits?.[0]?.message) {
          message = event.payload.commits[0].message;
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
      }

      return {
        id: event.id,
        type,
        message,
        repo: repo.replace("Ansuman-Mahapatra/", ""),
        time: new Date(event.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      };
    })
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
          <div className="space-y-4 pb-6">
            {activities.map((activity: any, index: number) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-start gap-3 group"
                >
                  <motion.div
                    className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${colorClass}`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.repo} • {activity.time}
                    </p>
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
