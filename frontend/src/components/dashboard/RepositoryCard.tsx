import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, GitFork, Eye, Circle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Repository {
  id: string | number;
  name: string;
  fullName?: string;
  description: string | null;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  watchersCount: number;
  visibility: string;
  updatedAt: string;
  htmlUrl: string;
  likedUserIds?: string[];
  deletedOnGithub?: boolean;
  deletedAt?: string;
}

interface RepositoryCardProps {
  repository: Repository;
  index: number;
}

const languageColors: Record<string, string> = {
  TypeScript: "hsl(var(--github-blue))",
  JavaScript: "hsl(var(--github-orange))",
  Python: "hsl(212, 92%, 56%)",
  Rust: "hsl(20, 80%, 50%)",
  Go: "hsl(195, 80%, 50%)",
  default: "hsl(var(--muted-foreground))",
};

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { API_URL } from "@/config";
import { useToast } from "@/components/ui/use-toast";

export function RepositoryCard({ repository, index }: RepositoryCardProps) {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [likedUserIds, setLikedUserIds] = useState<string[]>(repository.likedUserIds || []);
  // Ensure we compare strings properly
  const isLiked = user?.id ? likedUserIds.includes(user.id) : false;

  const languageColor = languageColors[repository.language || ""] || languageColors.default;

  const handleNavigate = () => {
    if (repository.fullName) {
      const [owner, repo] = repository.fullName.split('/');
      navigate(`/dashboard/repository/${owner}/${repo}`);
    } else {
      console.warn("No fullName for repository", repository);
    }
  };

  const handleStar = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation
    if (!token || !user?.id) {
      toast({ title: "Login Required", description: "You must be logged in to star repositories." });
      return;
    }

    const originalLikes = [...likedUserIds];
    const newLikes = isLiked
      ? originalLikes.filter(id => id !== user.id)
      : [...originalLikes, user.id];

    setLikedUserIds(newLikes);

    try {
      // Use repository.id here (which should be the MongoDB ID)
      const res = await fetch(`${API_URL}/api/repos/${repository.id}/toggle-star`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to star");
    } catch (error) {
      setLikedUserIds(originalLikes);
      toast({ title: "Error", description: "Could not update star status.", variant: "destructive" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="cursor-pointer"
      onClick={handleNavigate}
    >
      <Card className="h-full glass-card hover:border-primary/30 transition-all duration-300 group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <motion.h3
                  className="font-semibold text-foreground group-hover:text-primary transition-colors truncate"
                  whileHover={{ x: 2 }}
                >
                  {repository.name}
                </motion.h3>
                {repository.deletedOnGithub && (
                  <Badge variant="destructive" className="text-[10px] h-4 px-1.5 animate-pulse shrink-0">
                    Deleted
                  </Badge>
                )}
              </div>
              <Badge variant="outline" className="mt-1 text-xs capitalize">
                {repository.visibility}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {repository.description || "No description provided"}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              {repository.language && (
                <div className="flex items-center gap-1.5">
                  <Circle
                    className="w-3 h-3"
                    style={{ fill: languageColor, color: languageColor }}
                  />
                  <span>{repository.language}</span>
                </div>
              )}
              {/* Local Stars */}
              <div
                className={`flex items-center gap-1 hover:text-yellow-500 transition-colors ${isLiked ? "text-yellow-500" : ""}`}
                onClick={handleStar}
                title="Local GitTEnz Star"
              >
                <Star className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                <span>{likedUserIds.length}</span>
              </div>

              {/* GitHub Stars (Small separate indicator if needed, or remove as per user request 'only not fetch from github') */}
              {/* User said: 'make anyone can star the repos in my site only not fetch from github' */}
              {/* I replaced the main Star indicator with the local one. I'll hide the GitHub one to strictly follow 'not fetch from github' visually, or maybe label it differently. */}

              <div className="flex items-center gap-1" title="GitHub Forks">
                <GitFork className="w-3.5 h-3.5" />
                <span>{repository.forksCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{repository.watchersCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
