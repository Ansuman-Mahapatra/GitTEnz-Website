
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { API_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";
import { CodeEditor } from "@/components/editor/CodeEditor";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileTree } from "@/components/dashboard/FileTree";
import { StructureViewerModal } from "@/components/dashboard/StructureViewerModal";
import { Badge } from "@/components/ui/badge";
import { FileCode2, GitBranch, GitCommit, ChevronRight, Folder, File, ArrowLeft, FileText, Menu, Activity, Shield, HeartPulse, ExternalLink, Download } from "lucide-react";
import { InlineAiProvider } from "@/components/ai/InlineAiProvider";

export function RepositoryDetailPage() {
    const { owner, repo } = useParams();
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("code");
    const [selectedBranch, setSelectedBranch] = useState("");
    const [showStructureModal, setShowStructureModal] = useState(false);
    const [currentPath, setCurrentPath] = useState(""); // For tree navigation if nested
    const [selectedFile, setSelectedFile] = useState<{ path: string, sha: string } | null>(null);

    // 1. Fetch Branches
    const { data: branches, isLoading: branchesLoading } = useQuery({
        queryKey: ["branches", owner, repo],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/repos/${owner}/${repo}/branches`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch branches");
            return res.json();
        },
        enabled: !!token && !!owner && !!repo,
        refetchInterval: 5000,
    });

    // Set default branch
    useEffect(() => {
        if (branches && branches.length > 0 && !selectedBranch) {
            setSelectedBranch(branches[0].name);
        }
    }, [branches, selectedBranch]);

    // 2. Fetch Commits (for selected branch)
    const { data: commits, isLoading: commitsLoading } = useQuery({
        queryKey: ["commits", owner, repo, selectedBranch],
        queryFn: async () => {
            if (!selectedBranch) return [];
            // Get SHA of selected branch
            const branchObj = branches.find((b: any) => b.name === selectedBranch);
            const sha = branchObj?.commit?.sha || selectedBranch;

            const res = await fetch(`${API_URL}/api/repos/${owner}/${repo}/commits?branch=${sha}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch commits");
            return res.json();
        },
        enabled: !!token && !!owner && !!repo && !!selectedBranch && activeTab === "commits",
        refetchInterval: 5000,
    });

    // 3. Fetch Tree (File Structure)
    // We need the SHA of the branch to get the tree
    const selectedBranchSha = branches?.find((b: any) => b.name === selectedBranch)?.commit?.sha;

    const { data: fileTree, isLoading: treeLoading } = useQuery({
        queryKey: ["tree", owner, repo, selectedBranchSha],
        queryFn: async () => {
            if (!selectedBranchSha) return null;
            const res = await fetch(`${API_URL}/api/repos/${owner}/${repo}/tree/${selectedBranchSha}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch tree");
            return res.json();
        },
        enabled: !!token && !!owner && !!repo && !!selectedBranchSha && activeTab === "code",
        refetchInterval: 5000,
    });

    // 4. Fetch File Content
    const { data: fileData, isLoading: contentLoading } = useQuery({
        queryKey: ["content", owner, repo, selectedFile?.path],
        queryFn: async () => {
            if (!selectedFile) return null;
            const res = await fetch(`${API_URL}/api/repos/${owner}/${repo}/contents/${selectedFile.path}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch content");
            const data = await res.json();

            const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp'];
            const pdfExtensions = ['pdf'];
            const ext = selectedFile.path.split('.').pop()?.toLowerCase() || '';

            // Content is base64 encoded usually
            if (data.content && data.encoding === "base64") {
                const base64Content = data.content.replace(/\n/g, "");
                
                if (imageExtensions.includes(ext)) {
                    const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
                    return { type: 'image', content: `data:${mime};base64,${base64Content}` };
                } else if (pdfExtensions.includes(ext)) {
                    return { type: 'pdf', content: `data:application/pdf;base64,${base64Content}` };
                } else {
                    try {
                        // Decode base64 to UTF-8
                        const binaryString = atob(base64Content);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        return { type: 'text', content: new TextDecoder().decode(bytes) };
                    } catch (e) {
                        console.error("Failed to decode text file:", e);
                        return { type: 'text', content: atob(base64Content) }; // Fallback
                    }
                }
            }
            return { type: 'text', content: "" };
        },
        enabled: !!token && !!owner && !!repo && !!selectedFile && activeTab === "code",
    });
    const handleFileClick = (file: any) => {
        if (file.type === "blob") {
            setSelectedFile(file);
        } else if (file.type === "tree") {
            // Handle directory navigation later
            console.log("Directory clicked", file);
        }
    };

    // 5. Fetch AI Insights
    const { data: insightsData, isLoading: insightsLoading } = useQuery({
        queryKey: ["insights", owner, repo],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/repos/${owner}/${repo}/insights`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch insights");
            return res.json();
        },
        enabled: !!token && !!owner && !!repo && activeTab === "insights",
        staleTime: 5 * 60 * 1000, // cache for 5 minutes
    });

    // Mobile sidebar support (reused logic)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [codeContent, setCodeContent] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [commitMessage, setCommitMessage] = useState("");
    const [newBranchName, setNewBranchName] = useState("");
    const [showCommitDialog, setShowCommitDialog] = useState(false);

    // Update code content when file is loaded
    useEffect(() => {
        if (fileData?.type === 'text') {
            setCodeContent(fileData.content);
        } else {
            setCodeContent("");
        }
    }, [fileData]);

    const handleSave = async () => {
        if (!selectedFile || !token) return;
        setIsSaving(true);
        try {
            // If creating a new branch
            let targetBranch = selectedBranch;
            if (newBranchName) {
                // Get current branch SHA
                const currentBranchObj = branches.find((b: any) => b.name === selectedBranch);
                const baseSha = currentBranchObj?.commit?.sha;

                // Create branch
                await fetch(`${API_URL}/api/repos/${owner}/${repo}/branches`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        branchName: newBranchName,
                        sha: baseSha
                    })
                });
                targetBranch = newBranchName;
            }

            // Update file
            const res = await fetch(`${API_URL}/api/repos/${owner}/${repo}/contents/${selectedFile.path}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: commitMessage || `Update ${selectedFile.path}`,
                    content: codeContent,
                    sha: selectedFile.sha
                })
            });

            if (!res.ok) throw new Error("Failed to commit changes");

            setIsEditing(false);
            setShowCommitDialog(false);
            setNewBranchName("");
            setCommitMessage("");
            // Ideally invalidate queries to refresh data
            navigate(0); // Simple reload to refresh state
        } catch (error) {
            console.error("Failed to save:", error);
            alert("Failed to save changes. Check console for details.");
        } finally {
            setIsSaving(false);
        }
    };

    const [aiTriggerContext, setAiTriggerContext] = useState<{ text: string, rect: DOMRect | null } | null>(null);

    const handleAiExplain = (content: string) => {
        setAiTriggerContext({
            text: content,
            rect: null // Centered popup
        });
    };

    const editorContainerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="flex h-screen bg-transparent overflow-hidden relative">
            <InlineAiProvider 
                containerRef={editorContainerRef} 
                externalContext={aiTriggerContext}
                onCloseExternal={() => setAiTriggerContext(null)}
            />
            {/* Simple Commit Dialog */}
            {showCommitDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md bg-background border-border shadow-xl">
                        <CardHeader>
                            <CardTitle>Commit Changes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Commit Message</label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Update file..."
                                    value={commitMessage}
                                    onChange={(e) => setCommitMessage(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Branch (Optional)</label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="New branch name (leave empty to commit to current)"
                                    value={newBranchName}
                                    onChange={(e) => setNewBranchName(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setShowCommitDialog(false)}>Cancel</Button>
                                <Button onClick={handleSave} disabled={isSaving} className="glow-green">
                                    {isSaving ? "Committing..." : "Commit"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <StructureViewerModal
                isOpen={showStructureModal}
                onClose={() => setShowStructureModal(false)}
                repoName={repo || "Project"}
                files={fileTree?.tree || []}
            />

            <div className="hidden lg:block">
                <Sidebar activeTab="repositories" onTabChange={() => navigate(`/dashboard/${user?.username}`)} />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden fixed top-4 left-4 z-40"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <Menu className="w-5 h-5" />
                </Button>

                <main className="flex-1 overflow-auto p-4 lg:p-6 space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/dashboard/${user?.username}`)}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                                {owner} / {repo}
                            </h1>
                            <p className="text-muted-foreground text-sm">Public Repository</p>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList>
                                <TabsTrigger value="code" className="flex items-center gap-2"><FileCode2 className="w-4 h-4" /> Code</TabsTrigger>
                                <TabsTrigger value="commits" className="flex items-center gap-2"><GitCommit className="w-4 h-4" /> Commits</TabsTrigger>
                                <TabsTrigger value="branches" className="flex items-center gap-2"><GitBranch className="w-4 h-4" /> Branches</TabsTrigger>
                                <TabsTrigger value="insights" className="flex items-center gap-2 text-primary font-medium bg-primary/10 border border-primary/20"><Activity className="w-4 h-4" /> AI Insights</TabsTrigger>
                            </TabsList>

                            {activeTab === "code" && (
                                <div className="flex items-center gap-2">
                                    <Select value={selectedBranch} onValueChange={setSelectedBranch} disabled={branchesLoading}>
                                        <SelectTrigger className="w-[200px]">
                                            <GitBranch className="w-4 h-4 mr-2" />
                                            <SelectValue placeholder="Select Branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches?.map((b: any) => (
                                                <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="hidden sm:flex"
                                        onClick={() => setShowStructureModal(true)}
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        Structure
                                    </Button>

                                    {selectedFile && !isEditing && fileData?.type === 'text' && (
                                        <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>Edit</Button>
                                    )}
                                    {isEditing && (
                                        <>
                                            <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setCodeContent(fileData?.content || ""); }}>Cancel</Button>
                                            <Button size="sm" className="glow-green" onClick={() => setShowCommitDialog(true)}>Save Changes</Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <TabsContent value="code" className="mt-0 h-[calc(100vh-14rem)]">
                            <div className="grid grid-cols-12 gap-6 h-full">
                                {/* File Tree */}
                                <Card className="col-span-3 h-full overflow-hidden flex flex-col">
                                    <CardHeader className="py-3 px-4 border-b">
                                        <CardTitle className="text-sm font-medium">Files</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-auto p-2">
                                        {treeLoading ? (
                                            <div className="flex justify-center p-4"><div className="animate-spin w-6 h-6 border-2 border-primary rounded-full border-t-transparent" /></div>
                                        ) : (
                                            <FileTree
                                                items={fileTree?.tree || []}
                                                selectedPath={selectedFile?.path}
                                                onSelect={handleFileClick}
                                            />
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Editor/Viewer */}
                                <div className="col-span-9 h-full" ref={editorContainerRef}>
                                    {selectedFile ? (
                                        contentLoading ? (
                                            <div className="h-full flex items-center justify-center border rounded-xl glass-card">
                                                <div className="animate-spin w-8 h-8 border-4 border-primary rounded-full border-t-transparent" />
                                            </div>
                                        ) : (
                                            <>
                                                {fileData?.type === 'image' ? (
                                                    <div className="h-full flex items-center justify-center p-4 border rounded-xl glass-card overflow-auto bg-black/20">
                                                        <img src={fileData.content} alt={selectedFile.path} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                                                    </div>
                                                ) : fileData?.type === 'pdf' ? (
                                                    <div className="h-full w-full border rounded-xl overflow-hidden glass-card">
                                                        <iframe src={fileData.content} className="w-full h-full border-0 bg-white" title={selectedFile.path} />
                                                    </div>
                                                ) : (
                                                    <CodeEditor
                                                        initialCode={isEditing ? codeContent : fileData?.content || ""}
                                                        language={selectedFile.path.split('.').pop() || 'text'}
                                                        readOnly={!isEditing}
                                                        onChange={setCodeContent}
                                                        onAiExplain={handleAiExplain}
                                                    />
                                                )}
                                            </>
                                        )
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center border rounded-xl glass-card text-muted-foreground p-8 text-center">
                                            <FileCode2 className="w-16 h-16 mb-4 opacity-50" />
                                            <h3 className="text-lg font-semibold">Select a file to view content</h3>
                                            <p className="text-sm">Choose a file from the explorer on the left</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="insights" className="mt-0 space-y-6">
                            {insightsLoading ? (
                                <div className="flex flex-col items-center justify-center p-12 border rounded-xl glass-card text-muted-foreground">
                                    <div className="animate-spin w-8 h-8 border-4 border-primary rounded-full border-t-transparent mb-4" />
                                    <p>Generating AI architecture report...</p>
                                </div>
                            ) : insightsData ? (
                                <div className="space-y-6">
                                    <div className="flex justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const reportContent = `# Repository Analysis Report: ${owner}/${repo}\n\n## Executive Summary\n${insightsData.summary}\n\n## Health Score\nScore: ${insightsData.healthScore}/100\n${insightsData.healthDetails}\n\n## Security Trend\nScore: ${insightsData.securityScore}/100\n\n## Collaboration\n${insightsData.collaborationAnalysis}\n\nGenerated by GitTEnz AI Assistant.`;
                                                const blob = new Blob([reportContent], { type: 'text/markdown' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `${repo}-insight-report.md`;
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                                URL.revokeObjectURL(url);
                                            }}
                                            className="text-primary border-primary/30 bg-primary/5 hover:bg-primary/20"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download Insight Report
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="glass-card shadow-lg bg-black/40">
                                        <CardHeader className="pb-2 border-b border-white/5">
                                            <CardTitle className="text-lg flex items-center gap-2 text-primary">
                                                <HeartPulse className="w-5 h-5" /> Health Score
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-6 pb-8">
                                            <div className="flex items-center justify-center">
                                                <div className="relative flex items-center justify-center w-40 h-40 rounded-full border-[8px] border-primary/20 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                                                    <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                                                        <circle cx="50%" cy="50%" r="46%" fill="transparent" stroke="currentColor" strokeWidth="8%" className="text-primary" strokeDasharray={`${(insightsData.healthScore || 0) * 2.89} 300`} strokeLinecap="round" />
                                                    </svg>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-primary/50">{insightsData.healthScore || 0}</span>
                                                        <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1">/ 100</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="mt-8 text-center text-sm text-zinc-300 leading-relaxed bg-primary/5 p-4 rounded-xl border border-primary/10">
                                                {insightsData.healthDetails || "No details available."}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-6 flex flex-col">
                                        <Card className="glass-card shadow-lg bg-black/20 flex-1">
                                            <CardHeader className="pb-2 border-b border-white/5">
                                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-purple-400" /> Executive Summary
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4 text-sm leading-relaxed text-zinc-200">
                                                {insightsData.summary || "No summary available."}
                                            </CardContent>
                                        </Card>

                                        <div className="grid grid-cols-2 gap-6">
                                            <Card className="glass-card shadow-lg bg-black/20 relative overflow-hidden">
                                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-transparent"></div>
                                                <CardHeader className="pb-2 border-b border-white/5">
                                                    <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                                        <Activity className="w-4 h-4 text-blue-400" /> Collaboration
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-4 text-xs leading-relaxed text-zinc-300">
                                                    {insightsData.collaborationAnalysis || "No details."}
                                                </CardContent>
                                            </Card>

                                            <Card className="glass-card shadow-lg bg-black/20 relative overflow-hidden">
                                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-500 to-transparent"></div>
                                                <CardHeader className="pb-2 border-b border-white/5">
                                                    <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                                        <Shield className="w-4 h-4 text-yellow-400" /> Security Trend
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-4 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-100 to-yellow-600">
                                                    {insightsData.securityScore || 0}<span className="text-sm font-normal text-muted-foreground opacity-50 ml-1">/ 100</span>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 border rounded-xl glass-card text-muted-foreground">
                                    <p>Unable to retrieve insights.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="commits">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Commit History ({selectedBranch})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {commitsLoading ? (
                                            <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-primary rounded-full border-t-transparent" /></div>
                                        ) : (
                                            commits?.map((commit: any) => (
                                                <div key={commit.sha} className="flex gap-4 p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                                                    <div className="mt-1">
                                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                                                            <GitCommit className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="font-semibold">{commit.commit.message}</h3>
                                                            <span className="text-xs text-muted-foreground font-mono">{commit.sha.substring(0, 7)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                                            <span>{commit.commit.author.name}</span>
                                                            <span>•</span>
                                                            <span>{new Date(commit.commit.author.date).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="branches">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Branches</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {branches?.map((b: any) => (
                                            <div key={b.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
                                                <div className="flex items-center gap-3">
                                                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium">{b.name}</span>
                                                    {b.name === selectedBranch && <Badge variant="secondary" className="text-xs">Current</Badge>}
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedBranch(b.name)}>Switch</Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                    </Tabs>
                </main>
            </div>
        </div>
    );
}
