import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldAlert, GitCommit, FileCode2, CheckCircle2, Loader2, AlertTriangle, ShieldCheck, Github, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/config";

interface GitPushAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dirHandle: any | null;
  onContinue: (analysisResults: any) => void;
  username: string;
}

export function GitPushAnalyzerModal({ isOpen, onClose, dirHandle, onContinue, username }: GitPushAnalyzerModalProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);
  const [publishToGithub, setPublishToGithub] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (isOpen && dirHandle) {
      startAnalysis();
    } else {
      setAnalysis(null);
      setProgress(0);
      setFixing(false);
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
          const configHandle = await gitDirHandle.getFileHandle('config');
          const file = await configHandle.getFile();
          const content = await file.text();
          if (content.includes('[remote "origin"]')) {
            hasOrigin = true;
          }
        } catch (e) {
          console.warn("Could not read .git/config", e);
        }
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
    setFixing(true);
    setProgress(0);
    try {
      let updatedGitDir = analysis.gitDirHandle;
      
      // Fix 1: Init Git
      if (!analysis.isGit) {
        setProgress(10);
        updatedGitDir = await dirHandle.getDirectoryHandle('.git', { create: true });
        toast.success("Initialized empty Git repository.");
      }

      // Fix 2: Create .gitignore for detected sensitive files
      if (analysis.sensitiveFilesFound.length > 0) {
        setProgress(20);
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

      // Fix 3: Create GitHub Repo & Add Origin
      let finalOriginUrl = analysis.hasOrigin ? null : `https://github.com/${username}/${dirHandle.name}.git`;
      
      if (publishToGithub && !analysis.hasOrigin) {
        setProgress(40);
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/api/repos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              name: dirHandle.name,
              description: `Project onboarded via GitTEnz dashboard.`,
              private: isPrivate
            })
          });

          if (response.ok) {
            const repoData = await response.json();
            finalOriginUrl = repoData.clone_url || repoData.html_url + '.git';
            toast.success(`Successfully created ${isPrivate ? 'private' : 'public'} repo on GitHub!`);
          } else {
            console.error("Failed to create GitHub repo");
            toast.error("Cloud creation failed. This repo name might already exist on your GitHub.");
          }
        } catch (err) {
          console.error("GitHub API error", err);
          toast.error("Network error during GitHub project creation.");
        }
      }

      // Fix 4: Link Origin
      if (finalOriginUrl) {
        setProgress(50);
        let existingConfig = "";
        try {
          const configHandle = await updatedGitDir.getFileHandle('config');
          const file = await configHandle.getFile();
          existingConfig = await file.text();
        } catch (e) {}

        if (!existingConfig.includes('[remote "origin"]')) {
           const configHandle = await updatedGitDir.getFileHandle('config', { create: true });
           const writable = await configHandle.createWritable();
           const newRemote = `\n[remote "origin"]\n\turl = ${finalOriginUrl}\n\tfetch = +refs/heads/*:refs/remotes/origin/*\n`;
           await writable.write(existingConfig + newRemote);
           await writable.close();
           toast.success("Remote origin linked successfully.");
        }
      }

      // Fix 5: NEW - Automatic Push (Upload files)
      if (publishToGithub) {
        setProgress(60);
        const token = localStorage.getItem('token');
        const repoName = dirHandle.name;
        
        // Recursive upload
        const uploadDir = async (handle: any, path: string = "") => {
          // @ts-ignore
          for await (const entry of handle.values()) {
            const fullPath = path ? `${path}/${entry.name}` : entry.name;
            
            // Skip typical ignored directories
            if (['.git', 'node_modules', 'target', 'dist', 'build', '.next', '.idea', '.vscode'].includes(entry.name)) continue;
            
            if (entry.kind === 'directory') {
              await uploadDir(entry, fullPath);
            } else {
              try {
                const file = await entry.getFile();
                // Send to backend which will push to GitHub
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                  reader.onload = () => {
                    const result = reader.result as string;
                    resolve(result.split(',')[1]);
                  };
                  reader.readAsDataURL(file);
                });
                const base64Content = await base64Promise;

                await fetch(`${API_URL}/api/repos/${username}/${repoName}/contents/${fullPath}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    content: base64Content,
                    message: "Initial commit via GitTEnz",
                    isBase64: "true"
                  })
                });
              } catch (e) {
                console.error(`Failed to upload ${fullPath}`, e);
              }
            }
          }
        };

        await uploadDir(dirHandle);
        setProgress(95);
        toast.success("Successfully pushed initial code to GitHub!");
      }

      setProgress(100);
      setTimeout(() => {
        setAnalysis((prev: any) => ({ 
           ...prev, 
           isGit: true, 
           hasOrigin: true, 
           originUrl: finalOriginUrl || prev.originUrl,
           showSuccessCommands: true,
           gitDirHandle: updatedGitDir 
        }));
        setFixing(false);
      }, 500);
      
    } catch (e) {
      console.error(e);
      setFixing(false);
      toast.error("Failed to apply automatic fixes. Please check permissions.");
    }
  };

  if (analysis?.showSuccessCommands) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md glass-card border-primary/20 backdrop-blur-xl transition-all">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="w-6 h-6" /> Success! Repository Linked
            </DialogTitle>
            <DialogDescription>
              We've prepared your local project. To finish pushing your code to GitHub, run these commands in your terminal:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
             <div className="bg-zinc-950 p-4 rounded-lg font-mono text-xs text-primary/90 space-y-2 border border-white/5 relative group">
                <p>git add .</p>
                <p>git commit -m "Initial commit via GitTEnz"</p>
                <p>git branch -M main</p>
                <p>git push -u origin main</p>
                <Button 
                   size="icon" 
                   variant="ghost" 
                   className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                   onClick={() => {
                      navigator.clipboard.writeText(`git add .\ngit commit -m "Initial commit via GitTEnz"\ngit branch -M main\ngit push -u origin main`);
                      toast.success("Commands copied!");
                   }}
                >
                   <GitCommit className="w-3 h-3" />
                </Button>
             </div>
             <p className="text-[10px] text-muted-foreground italic">
                Note: Ensure you have Git installed on your system to run these commands.
             </p>
          </div>

          <DialogFooter>
            <Button onClick={() => onContinue(analysis)} className="w-full glow-green">
              Go to Project Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const hasIssues = !analysis?.isGit || !analysis?.hasOrigin || analysis?.sensitiveFilesFound.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !fixing && onClose()}>
      <DialogContent className="sm:max-w-md glass-card border-primary/20 backdrop-blur-xl transition-all">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            GitTEnz Smart Analyzer
          </DialogTitle>
          <DialogDescription>
            {fixing ? "Applying security fixes and linking cloud..." : "Scanning your local project for Git readiness and security risks."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {analyzing || fixing ? (
            <div className="space-y-4 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-sm font-medium animate-pulse">{fixing ? "Applying Smart Fixes..." : "Running Deep Project Analysis..."}</p>
              <Progress value={progress} className="h-2 transition-all duration-500" />
            </div>
          ) : analysis ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key="analysis-view"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
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
                      {analysis.isGit ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <ShieldAlert className="w-4 h-4 text-orange-500" />}
                      <span className={analysis.isGit ? "text-foreground" : "text-muted-foreground"}>
                        {analysis.isGit ? "Git is initialized" : "Git is NOT initialized"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {analysis.hasOrigin ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <ShieldAlert className="w-4 h-4 text-orange-500" />}
                      <span className={analysis.hasOrigin ? "text-foreground" : "text-muted-foreground"}>
                        {analysis.hasOrigin ? "Remote origin linked" : "No remote origin found"}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* GitHub Creation Option */}
                {(!analysis.hasOrigin || !analysis.isGit) && (
                   <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="publish" 
                          checked={publishToGithub} 
                          onCheckedChange={(checked) => setPublishToGithub(!!checked)}
                        />
                        <Label htmlFor="publish" className="text-sm flex items-center gap-2 font-semibold cursor-pointer">
                          <Github className="w-4 h-4" /> Create repository on GitHub
                        </Label>
                      </div>
                      
                      {publishToGithub && (
                        <div className="flex items-center justify-between pl-6 gap-4">
                          <Button 
                            variant={!isPrivate ? "secondary" : "ghost"} 
                            size="sm" 
                            className="flex-1 h-8 text-xs gap-2"
                            onClick={() => setIsPrivate(false)}
                          >
                            <Globe className="w-3 h-3" /> Public
                          </Button>
                          <Button 
                            variant={isPrivate ? "secondary" : "ghost"} 
                            size="sm" 
                            className="flex-1 h-8 text-xs gap-2"
                            onClick={() => setIsPrivate(true)}
                          >
                            <Lock className="w-3 h-3" /> Private
                          </Button>
                        </div>
                      )}
                   </div>
                )}

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
                  <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">Project is fully clean and ready to publish!</span>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>

        {!analyzing && !fixing && analysis && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose} className="border-white/10">
              Cancel
            </Button>
            {hasIssues ? (
              <Button onClick={handleApplyFixes} className="glow-green gap-2">
                <ShieldCheck className="w-4 h-4" /> Auto-Fix & Publish
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
