
import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FileCode2, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTreeItem {
    path: string;
    type: "blob" | "tree";
    sha: string;
    url?: string;
    mode?: string;
}

interface TreeNode {
    name: string;
    path: string;
    type: "folder" | "file";
    originalItem?: FileTreeItem;
    children: TreeNode[];
}

interface FileTreeProps {
    items: FileTreeItem[];
    selectedPath?: string;
    onSelect: (item: FileTreeItem) => void;
}

export function FileTree({ items, selectedPath, onSelect }: FileTreeProps) {
    const buildTree = (items: FileTreeItem[]): TreeNode[] => {
        const root: TreeNode[] = [];
        const map: Record<string, TreeNode> = {};

        // Sort items so folders come before files? Or just alphabetical?
        // Usually alphabetical is best, maybe folders first.
        // But input items are flat paths.

        items.forEach(item => {
            const parts = item.path.split("/");
            let currentLevel = root;
            let currentPath = "";

            parts.forEach((part, index) => {
                currentPath = currentPath ? `${currentPath}/${part}` : part;

                // Check if this part (folder or file) already exists at this level
                let existingNode = currentLevel.find(n => n.name === part);

                if (!existingNode) {
                    const isFile = index === parts.length - 1 && item.type === "blob";
                    const newNode: TreeNode = {
                        name: part,
                        path: currentPath,
                        type: isFile ? "file" : "folder",
                        originalItem: isFile ? item : undefined,
                        children: []
                    };

                    // Optimization: If it's a folder we inferred from path but API also sends 'tree' type items, 
                    // we might duplicate. GitHub recursive tree api sends BOTH folders and files usually? 
                    // Actually `recursive=1` sends ALL items.
                    // If we encounter a "tree" item in the API response, it matches a folder node.

                    currentLevel.push(newNode);
                    existingNode = newNode;
                }

                if (index < parts.length - 1) {
                    currentLevel = existingNode.children;
                }
            });
        });

        const sortNodes = (nodes: TreeNode[]) => {
            nodes.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === "folder" ? -1 : 1;
            });
            nodes.forEach(n => {
                if (n.children.length > 0) sortNodes(n.children);
            });
        };

        sortNodes(root);
        return root;
    };

    const tree = buildTree(items || []);

    return (
        <div className="text-sm select-none">
            {tree.map(node => (
                <FileTreeNode
                    key={node.path}
                    node={node}
                    level={0}
                    selectedPath={selectedPath}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}

interface FileTreeNodeProps {
    node: TreeNode;
    level: number;
    selectedPath?: string;
    onSelect: (item: FileTreeItem) => void;
}

function FileTreeNode({ node, level, selectedPath, onSelect }: FileTreeNodeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const isSelected = selectedPath === node.path;
    const hasChildren = node.children && node.children.length > 0;

    // Auto-expand if a child is selected? 
    // Maybe too complex for now, but user expects it. 
    // We can check if selectedPath.startsWith(node.path + "/")

    if (node.type === "folder" && !isOpen && selectedPath?.startsWith(node.path + "/")) {
        setIsOpen(true);
    }

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (node.type === "folder") {
            setIsOpen(!isOpen);
        } else {
            if (node.originalItem) {
                onSelect(node.originalItem);
            }
        }
    };

    const Icon = node.type === "folder"
        ? (isOpen ? ChevronDown : ChevronRight)
        : FileCode2;

    const TypeIcon = node.type === "folder" ? Folder : File;

    return (
        <div>
            <div
                className={cn(
                    "flex items-center gap-1.5 py-1 px-2 rounded-md cursor-pointer transition-colors",
                    "hover:bg-accent/50",
                    isSelected && "bg-accent text-accent-foreground font-medium",
                    level > 0 && "ml-4" // Use padding-left instead of margin for whole row highlighting look?
                    // Actually margin-left logic is simplest for nesting, but limits highlighting width.
                    // Let's stick to simplest first.
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={handleClick}
            >
                {node.type === "folder" && (
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                )}
                {node.type === "file" && <span className="w-3.5" />} {/* Spacer */}

                <TypeIcon className={cn("w-4 h-4 shrink-0", node.type === "folder" ? "text-primary/70" : "text-blue-400")} />

                <span className="truncate">{node.name}</span>
            </div>

            {isOpen && hasChildren && (
                <div>
                    {node.children.map(child => (
                        <FileTreeNode
                            key={child.path}
                            node={child}
                            level={level + 1}
                            selectedPath={selectedPath}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
