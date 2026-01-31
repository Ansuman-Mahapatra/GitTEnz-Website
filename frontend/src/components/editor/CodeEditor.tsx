
import { Copy } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CodeEditorProps {
  initialCode: string;
  language?: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({ initialCode, language = "typescript", onChange, readOnly = true }: CodeEditorProps) {
  const codeLines = initialCode.split("\n");

  return (
    <Card className="glass-card h-full overflow-hidden flex flex-col">
      <CardHeader className="flex-row items-center justify-between py-3 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            {language}
          </Badge>
          {!readOnly && <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">Editing</Badge>}
        </div>
        <div className="flex gap-2">
          {readOnly && (
            <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(initialCode)}>
              <Copy className="w-4 h-4 mr-1" /> Copy
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden relative">
        {readOnly ? (
          <ScrollArea className="h-full">
            <pre className="p-4 text-sm font-mono leading-relaxed">
              {codeLines.map((line, i) => (
                <div
                  key={i}
                  className="flex hover:bg-muted/50 -mx-4 px-4"
                >
                  <span className="w-8 text-muted-foreground select-none text-right mr-4 opacity-50">
                    {i + 1}
                  </span>
                  <code className="flex-1 text-foreground break-words whitespace-pre-wrap">{line || " "}</code>
                </div>
              ))}
            </pre>
          </ScrollArea>
        ) : (
          <textarea
            className="w-full h-full p-4 bg-transparent text-sm font-mono leading-relaxed resize-none focus:outline-none text-foreground border-none ring-0 focus:ring-0"
            value={initialCode}
            onChange={(e) => onChange?.(e.target.value)}
            spellCheck={false}
          />
        )}
      </CardContent>
    </Card>
  );
}
