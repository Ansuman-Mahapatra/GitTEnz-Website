import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileCode, Folder, FolderOpen, Copy, Check, File } from "lucide-react";
import { toast } from "sonner";

interface LocalRepoViewerProps {
    isOpen: boolean;
    onClose: () => void;
    repoName: string;
    dirHandle: any; // FileSystemDirectoryHandle
}

interface FileNode {
    name: string;
    kind: 'file' | 'directory';
    children?: FileNode[];
    depth: number;
}

export function LocalRepoViewer({ isOpen, onClose, repoName, dirHandle }: LocalRepoViewerProps) {
    const [fileTree, setFileTree] = useState<FileNode[]>([]);
    const [treeString, setTreeString] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && dirHandle) {
            generateTree();
        }
    }, [isOpen, dirHandle]);

    const generateTree = async () => {
        setLoading(true);
        try {
            const nodes: FileNode[] = [];
            const lines: string[] = [repoName];

            // Helper to process directory structure
            const processDir = async (handle: any, currentDepth: number, parentNodes: FileNode[], prefix: string) => {
                if (currentDepth > 4) return; // Limit depth for performance

                const entries = [];
                // @ts-ignore
                for await (const entry of handle.values()) {
                    // Skip node_modules and hidden files
                    if (entry.name === 'node_modules' || entry.name.startsWith('.') || entry.name === 'target' || entry.name === 'dist') continue;
                    entries.push(entry);
                }

                // Sort: Directories first, then files
                entries.sort((a, b) => {
                    if (a.kind === b.kind) return a.name.localeCompare(b.name);
                    return a.kind === 'directory' ? -1 : 1;
                });

                for (let i = 0; i < entries.length; i++) {
                    const entry = entries[i];
                    const isLast = i === entries.length - 1;
                    const marker = isLast ? '└── ' : '├── ';
                    const childPrefix = isLast ? '    ' : '│   ';

                    lines.push(`${prefix}${marker}${entry.name}`);

                    const node: FileNode = {
                        name: entry.name,
                        kind: entry.kind,
                        depth: currentDepth,
                        children: []
                    };

                    if (entry.kind === 'directory') {
                        await processDir(entry, currentDepth + 1, node.children!, prefix + childPrefix);
                    }

                    parentNodes.push(node);
                }
            };

            await processDir(dirHandle, 0, nodes, "");

            setFileTree(nodes);
            setTreeString(lines.join('\n'));
        } catch (err) {
            console.error("Error reading directory", err);
            toast.error("Failed to read directory structure");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(treeString);
        setCopied(true);
        toast.success("Project structure copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const renderVisualTree = (nodes: FileNode[]) => {
        return (
            <div className="pl-4 border-l border-white/10 ml-2 mt-1">
                {nodes.map((node, i) => (
                    <div key={i + node.name}>
                        <div className="flex items-center gap-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            {node.kind === 'directory' ? <Folder className="w-4 h-4 text-primary" /> : <FileCode className="w-4 h-4" />}
                            <span>{node.name}</span>
                        </div>
                        {node.children && node.children.length > 0 && renderVisualTree(node.children)}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FolderOpen className="text-primary" />
                        {repoName} <span className="text-muted-foreground font-normal text-sm ml-2">Structure Viewer</span>
                    </DialogTitle>
                    <DialogDescription>
                        View and copy your project's file structure for documentation.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden mt-4">
                    {/* Visual Tree */}
                    <div className="border rounded-lg bg-card/50 p-4 flex flex-col">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Folder className="w-4 h-4 text-blue-400" /> Files
                        </h4>
                        <ScrollArea className="flex-1">
                            {loading ? (
                                <div className="flex items-center justify-center h-40">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <div className="-ml-6">
                                    {renderVisualTree(fileTree)}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Markdown Preview */}
                    <div className="border rounded-lg bg-zinc-950 p-4 flex flex-col relative group">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold flex items-center gap-2">
                                <File className="w-4 h-4 text-orange-400" /> Readme Format
                            </h4>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 gap-2 text-xs hover:bg-white/10"
                                onClick={copyToClipboard}
                            >
                                {copied ? <Check className="w-3 h-3 text-blue-500" /> : <Copy className="w-3 h-3" />}
                                {copied ? "Copied" : "Copy"}
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 font-mono text-xs text-muted-foreground bg-black/50 rounded-md border border-white/5 p-4">
                            {loading ? "Generating tree..." : treeString}
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
