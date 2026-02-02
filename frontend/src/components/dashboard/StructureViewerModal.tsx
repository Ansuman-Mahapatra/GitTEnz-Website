import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { FileTree } from "./FileTree";

interface StructureViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    repoName: string;
    files: any[]; // Flat list from GitHub API
}

export function StructureViewerModal({ isOpen, onClose, repoName, files }: StructureViewerModalProps) {
    const [treeString, setTreeString] = useState("");
    const [copied, setCopied] = useState(false);

    // Convert flat path list to ASCII tree
    useEffect(() => {
        if (!files || files.length === 0) return;
        const tree = generateAsciiTree(repoName, files);
        setTreeString(tree);
    }, [files, repoName]);

    const handleCopy = () => {
        navigator.clipboard.writeText(treeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[70vh] bg-background border-border flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Project Structure Viewer
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        View and copy your project's file structure for documentation.
                    </p>
                </DialogHeader>

                <div className="flex flex-1 gap-6 min-h-0 pt-4">
                    {/* Visual Tree Panel */}
                    <div className="flex-1 flex flex-col border rounded-lg overflow-hidden bg-card/30">
                        <div className="p-3 border-b bg-muted/30 font-medium text-sm">Files</div>
                        <ScrollArea className="flex-1 p-2">
                            {/* Reusing existing FileTree component for visual representation */}
                            <FileTree items={files} selectedPath="" onSelect={() => { }} />
                        </ScrollArea>
                    </div>

                    {/* Text/Ascii Tree Panel */}
                    <div className="flex-1 flex flex-col border rounded-lg overflow-hidden bg-card/30">
                        <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
                            <span className="font-medium text-sm">FileTree.md Format</span>
                            <Button size="sm" variant="outline" className="h-7 gap-1" onClick={handleCopy}>
                                <Copy className="w-3.5 h-3.5" />
                                {copied ? "Copied!" : "Copy"}
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 p-4 bg-black/20">
                            <pre className="font-mono text-xs leading-relaxed text-muted-foreground whitespace-pre">
                                {treeString}
                            </pre>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Helper to generate the ASCII tree
function generateAsciiTree(rootName: string, items: any[]): string {
    // 1. Build nested object structure
    const root: any = {};

    items.forEach(item => {
        const parts = item.path.split('/');
        let current = root;
        parts.forEach((part: string) => {
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        });
    });

    // 2. Recursive generator
    let output = rootName + "\n";

    function traverse(node: any, prefix: string, isLast: boolean) {
        const keys = Object.keys(node).sort((a, b) => {
            // Folders first, then files (heuristic: checks if children exist... 
            // actually existing structure doesn't distinguish well here without type)
            // Let's just sort alphabetically for now
            return a.localeCompare(b);
        });

        keys.forEach((key, index) => {
            const isLastChild = index === keys.length - 1;
            const connector = isLastChild ? "└── " : "├── ";
            const childPrefix = isLastChild ? "    " : "│   ";

            output += prefix + connector + key + "\n";

            // If node[key] has children (keys), recurse
            if (Object.keys(node[key]).length > 0) {
                traverse(node[key], prefix + childPrefix, false); // isLast doesn't matter for prefix logic here
            }
        });
    }

    traverse(root, "", true);
    return output;
}
