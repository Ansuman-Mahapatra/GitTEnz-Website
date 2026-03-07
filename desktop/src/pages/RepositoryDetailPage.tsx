
import { useState, useEffect } from "react";
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
import { FileCode2, GitBranch, GitCommit, ChevronRight, Folder, File, ArrowLeft, FileText, Menu } from "lucide-react";
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
    const { data: fileContent, isLoading: contentLoading } = useQuery({
        queryKey: ["content", owner, repo, selectedFile?.path],
        queryFn: async () => {
            if (!selectedFile) return "";
            const res = await fetch(`${API_URL}/api/repos/${owner}/${repo}/contents/${selectedFile.path}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch content");
            const data = await res.json();
            // Content is base64 encoded usually
            if (data.content && data.encoding === "base64") {
                return atob(data.content.replace(/\n/g, ""));
            }
            return "";
        },
        enabled: !!token && !!owner && !!repo && !!selectedFile && activeTab === "code",
        refetchInterval: 5000,
    });

    const handleFileClick = (file: any) => {
        if (file.type === "blob") {
            setSelectedFile(file);
        } else if (file.type === "tree") {
            // Handle directory navigation later
            console.log("Directory clicked", file);
        }
    };

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
        if (fileContent) {
            setCodeContent(fileContent);
        }
    }, [fileContent]);

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

    return (
        <div className="flex h-screen bg-background overflow-hidden relative">
            <InlineAiProvider />
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
                                <Button onClick={handleSave} disabled={isSaving} className="glow-blue">
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

                                    {selectedFile && !isEditing && (
                                        <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>Edit</Button>
                                    )}
                                    {isEditing && (
                                        <>
                                            <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setCodeContent(fileContent); }}>Cancel</Button>
                                            <Button size="sm" className="glow-blue" onClick={() => setShowCommitDialog(true)}>Save Changes</Button>
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
                                <div className="col-span-9 h-full">
                                    {selectedFile ? (
                                        contentLoading ? (
                                            <div className="h-full flex items-center justify-center border rounded-xl glass-card">
                                                <div className="animate-spin w-8 h-8 border-4 border-primary rounded-full border-t-transparent" />
                                            </div>
                                        ) : (
                                            <CodeEditor
                                                initialCode={isEditing ? codeContent : fileContent}
                                                language={selectedFile.path.split('.').pop() || 'text'}
                                                readOnly={!isEditing}
                                                onChange={setCodeContent}
                                            />
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
