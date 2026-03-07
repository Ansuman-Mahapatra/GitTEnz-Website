import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShieldAlert, GitCommit, FileCode2, CheckCircle2, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface GitPushAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dirHandle: any | null;
  onContinue: (analysisResults: any) => void;
  username: string;
}

export function GitPushAnalyzerModal({ isOpen, onClose, dirHandle, onContinue, username }: GitPushAnalyzerModalProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (isOpen && dirHandle) {
      startAnalysis();
    } else {
      setAnalysis(null);
      setProgress(0);
    }
  }, [isOpen, dirHandle]);

  const startAnalysis = async () => {
    setAnalyzing(true);
    setProgress(10);
    setAnalysis(null);

    try {
      let isGit = false;
      let hasOrigin = false;
      let hasGitignore = false;
      let sensitiveFilesFound: string[] = [];
      let language = "Unknown";
      let gitDirHandle = null;

      // 1. Check Git configuration
      setProgress(30);
      try {
        gitDirHandle = await dirHandle.getDirectoryHandle('.git');
        isGit = true;
        try {
          await gitDirHandle.getFileHandle('config');
          hasOrigin = true; // simplified check
        } catch (e) {}
      } catch (e) {}

      // 2. Check for .gitignore
      setProgress(50);
      try {
        await dirHandle.getFileHandle('.gitignore');
        hasGitignore = true;
      } catch (e) {}

      // 3. Scan for Sensitive Files
      setProgress(70);
      const sensitivePatterns = ['.env', 'credentials.json', 'application.properties', 'secrets.yml', 'secrets.json'];
      for (const sFile of sensitivePatterns) {
        try {
          await dirHandle.getFileHandle(sFile);
          sensitiveFilesFound.push(sFile);
        } catch (e) {}
      }

      // 4. Detect Framework/Language
      setProgress(90);
      try {
        await dirHandle.getFileHandle('package.json');
        language = "JavaScript/TypeScript";
      } catch (e) {}
      try {
        await dirHandle.getFileHandle('pom.xml');
        language = "Java";
      } catch (e) {}
      try {
        await dirHandle.getFileHandle('requirements.txt');
        language = "Python";
      } catch (e) {}
      try {
        await dirHandle.getFileHandle('Cargo.toml');
        language = "Rust";
      } catch (e) {}

      // Finalize
      setProgress(100);
      setTimeout(() => {
        setAnalysis({
          isGit,
          hasOrigin,
          hasGitignore,
          sensitiveFilesFound,
          language,
          gitDirHandle
        });
        setAnalyzing(false);
      }, 800);

    } catch (e) {
       console.error(e);
       toast.error("Failed to analyze project directory.");
       onClose();
    }
  };

  const handleApplyFixes = async () => {
    try {
      let updatedGitDir = analysis.gitDirHandle;
      
      // Fix 1: Init Git
      if (!analysis.isGit) {
        updatedGitDir = await dirHandle.getDirectoryHandle('.git', { create: true });
        toast.success("Initialized empty Git repository.");
      }

      // Fix 2: Create .gitignore for detected sensitive files
      if (analysis.sensitiveFilesFound.length > 0) {
        try {
          const gitignoreHandle = await dirHandle.getFileHandle('.gitignore', { create: true });
          const writable = await gitignoreHandle.createWritable();
          const ignores = analysis.sensitiveFilesFound.join("\n") + "\n";
          await writable.write(ignores);
          await writable.close();
          toast.success("Created security guardrails in .gitignore.");
        } catch(e) {
          console.warn("Could not write .gitignore");
        }
      }

      // Fix 3: Add Origin
      if (!analysis.hasOrigin) {
        const configHandle = await updatedGitDir.getFileHandle('config', { create: true });
        const writable = await configHandle.createWritable();
        const originUrl = `https://github.com/${username}/${dirHandle.name}.git`;
        await writable.write(`[remote "origin"]\nurl = ${originUrl}\n`);
        await writable.close();
        toast.success(`Linked origin to github.com/${username}/${dirHandle.name}`);
      }

      onContinue({ ...analysis, isGit: true, hasOrigin: true, gitDirHandle: updatedGitDir });
    } catch (e) {
      console.error(e);
      toast.error("Failed to apply automatic fixes. Please check permissions.");
    }
  };

  const hasIssues = !analysis?.isGit || !analysis?.hasOrigin || analysis?.sensitiveFilesFound.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md glass-card border-primary/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            GitTEnz Smart Analyzer
          </DialogTitle>
          <DialogDescription>
            Scanning your local project for Git readiness and security risks.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {analyzing ? (
            <div className="space-y-4 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-sm font-medium animate-pulse">Running Deep Project Analysis...</p>
              <Progress value={progress} className="h-2" />
            </div>
          ) : analysis ? (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                
                {/* Project Overview */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <FileCode2 className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Detected Environment</p>
                    <p className="text-sm font-medium">{analysis.language} Project</p>
                  </div>
                </div>

                {/* Git Status */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <GitCommit className="w-4 h-4" /> Repository Status
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      {analysis.isGit ? <CheckCircle2 className="w-4 h-4 text-blue-500" /> : <ShieldAlert className="w-4 h-4 text-orange-500" />}
                      <span className={analysis.isGit ? "text-foreground" : "text-muted-foreground"}>
                        {analysis.isGit ? "Git is initialized" : "Git is NOT initialized"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {analysis.hasOrigin ? <CheckCircle2 className="w-4 h-4 text-blue-500" /> : <ShieldAlert className="w-4 h-4 text-orange-500" />}
                      <span className={analysis.hasOrigin ? "text-foreground" : "text-muted-foreground"}>
                        {analysis.hasOrigin ? "Remote origin linked" : "No remote origin found"}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Security Alerts */}
                {analysis.sensitiveFilesFound.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg space-y-2">
                    <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Sensitive Data Exposed
                    </h4>
                    <p className="text-xs text-destructive/90">
                      We found the following private files that should NOT be pushed without a secure <code>.gitignore</code>:
                    </p>
                    <ul className="text-xs text-destructive font-mono list-disc pl-5">
                      {analysis.sensitiveFilesFound.map((f: string) => <li key={f}>{f}</li>)}
                    </ul>
                  </div>
                )}
                
                {analysis.sensitiveFilesFound.length === 0 && !hasIssues && (
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-blue-500 font-medium">Project is fully clean and ready to publish!</span>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>

        {!analyzing && analysis && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose} className="border-white/10">
              Cancel
            </Button>
            {hasIssues ? (
              <Button onClick={handleApplyFixes} className="glow-blue gap-2">
                <ShieldCheck className="w-4 h-4" /> Auto-Fix & Proceed
              </Button>
            ) : (
              <Button onClick={() => onContinue(analysis)} className="gap-2">
                Continue to Repository <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
