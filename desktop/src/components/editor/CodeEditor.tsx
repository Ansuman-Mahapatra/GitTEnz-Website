import { Copy, Maximize2, Minimize2, Save } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CodeEditorProps {
  initialCode: string;
  language?: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({ initialCode, language = "typescript", onChange, readOnly = true }: CodeEditorProps) {
  const codeLines = initialCode.split("\n");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Card className={cn(
      "h-full overflow-hidden flex flex-col border-0 shadow-2xl transition-all duration-300",
      "bg-[#1e1e1e] text-[#d4d4d4]", // VS Code Dark Theme Colors
      isFocused ? "ring-2 ring-primary/50" : ""
    )}>
      {/* Mac-style Window Header */}
      <CardHeader className="flex-row items-center justify-between py-2 px-4 bg-[#252526] border-b border-[#3e3e42] shrink-0 h-10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-4 group">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] group-hover:bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] group-hover:bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] group-hover:bg-[#27c93f]" />
          </div>
          <Badge variant="outline" className="h-5 px-2 text-[10px] font-mono bg-[#3e3e42] border-transparent text-[#cccccc] hover:bg-[#3e3e42]">
            {language.toUpperCase()}
          </Badge>
          {!readOnly && <Badge className="h-5 bg-blue-600/20 text-blue-400 border-blue-500/30 text-[10px] px-2">EDIT MODE</Badge>}
        </div>

        <div className="flex gap-1">
          {readOnly && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-[#858585] hover:text-white hover:bg-[#3e3e42]"
              onClick={() => {
                navigator.clipboard.writeText(initialCode);
                // We need a local state for 'copied' but component is simple.
                // Let's rely on parent or just assumed works.
                // Or better, add state.
              }}
              title="Copy Code"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden relative font-mono text-[13px] leading-6">
        <div className="absolute inset-0 flex bg-[#1e1e1e]">
          {/* Line Numbers */}
          <div className="w-12 bg-[#1e1e1e] text-[#858585] text-right pr-3 select-none py-4 border-r border-[#3e3e42]/0">
            {codeLines.map((_, i) => (
              <div key={i} className="leading-6">{i + 1}</div>
            ))}
          </div>

          {/* Editor Area */}
          <div className="flex-1 relative overflow-hidden">
            {readOnly ? (
              <ScrollArea className="h-full w-full">
                <div className="p-4 pt-4 pl-2 min-w-max">
                  {codeLines.map((line, i) => (
                    <div key={i} className="leading-6 whitespace-pre">
                      {line || " "}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <textarea
                className="w-full h-full p-4 pt-4 pl-2 bg-transparent text-[#d4d4d4] resize-none focus:outline-none placeholder-muted-foreground/50 leading-6 whitespace-pre"
                value={initialCode}
                onChange={(e) => onChange?.(e.target.value)}
                spellCheck={false}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
