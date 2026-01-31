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

export function RepositoryCard({ repository, index }: RepositoryCardProps) {
  const navigate = useNavigate();
  const languageColor = languageColors[repository.language || ""] || languageColors.default;

  const handleNavigate = () => {
    // fullName is usually "owner/repo"
    if (repository.fullName) {
      const [owner, repo] = repository.fullName.split('/');
      navigate(`/dashboard/repository/${owner}/${repo}`);
    } else {
      // Fallback if fullName is missing (e.g. mock data), assuming single user
      // but for now, let's just log or try to navigate with just name
      console.warn("No fullName for repository", repository);
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
              <motion.h3
                className="font-semibold text-foreground group-hover:text-primary transition-colors truncate"
                whileHover={{ x: 2 }}
              >
                {repository.name}
              </motion.h3>
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
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                <span>{repository.stargazersCount}</span>
              </div>
              <div className="flex items-center gap-1">
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
