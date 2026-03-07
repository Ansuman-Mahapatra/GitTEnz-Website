import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bot, Send, X, Trash2, Sparkles, Code2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_URL } from "@/config";
import { useAuth } from "@/lib/auth";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface InlineAiChatPopupProps {
  selectedText: string;
  anchorRect: DOMRect | null;
  onClose: () => void;
}

const QUICK_ACTIONS = [
  { label: "Explain this", prompt: "Explain this code/commit in detail." },
  { label: "Find bugs", prompt: "Why is this buggy? Identify potential issues." },
  { label: "Improve", prompt: "Improve this message/code. Suggest refactoring." },
  { label: "Suggest refactor", prompt: "Suggest a refactor for this code." },
];

export function InlineAiChatPopup({ selectedText, anchorRect, onClose }: InlineAiChatPopupProps) {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isContextCollapsed, setIsContextCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Calculate popup position relative to the selection
  const getPopupStyle = useCallback((): React.CSSProperties => {
    if (!anchorRect) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }

    const popupWidth = 400;
    const popupHeight = 520;
    const padding = 12;

    let top = anchorRect.bottom + window.scrollY + padding;
    let left = anchorRect.left + window.scrollX + anchorRect.width / 2 - popupWidth / 2;

    // Clamp horizontal
    left = Math.max(padding, Math.min(left, window.innerWidth - popupWidth - padding));

    // If popup would go below viewport, show above selection
    if (top + popupHeight > window.innerHeight + window.scrollY) {
      top = anchorRect.top + window.scrollY - popupHeight - padding;
    }

    // Final vertical clamp
    top = Math.max(padding, top);

    return { top, left };
  }, [anchorRect]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selectedText,
          userMessage: messageText,
          sessionId,
        }),
      });

      if (!res.ok) throw new Error("Failed to get AI response");
      const data = await res.json();

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "No response received.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Inline AI error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Failed to connect to AI service. Please check if the backend is running.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClearConversation = async () => {
    setMessages([]);
    if (sessionId && token) {
      try {
        await fetch(`${API_URL}/api/ai/chat/clear`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId }),
        });
      } catch {
        // Silently fail — clearing is best-effort
      }
    }
    setSessionId(null);
  };

  // Truncate display of selected text
  const displayText =
    selectedText.length > 120 ? selectedText.slice(0, 120) + "..." : selectedText;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed z-[9998] w-[400px] h-[520px] flex flex-col rounded-2xl border border-primary/20 shadow-2xl shadow-black/40 overflow-hidden"
      style={{
        ...getPopupStyle(),
        backdropFilter: "blur(20px) saturate(200%)",
        backgroundColor: "hsl(var(--card) / 0.95)",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
            <Bot className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-none">AI Assistant</h3>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Contextual Mode
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleClearConversation}
            title="Clear conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Selected Text Context */}
      <div
        className="px-4 py-2.5 border-b border-white/5 bg-primary/5 cursor-pointer"
        onClick={() => setIsContextCollapsed(!isContextCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Code2 className="w-3 h-3 text-primary" />
            <span className="font-medium">Selected Context</span>
          </div>
          <ChevronDown
            className={`w-3 h-3 text-muted-foreground transition-transform ${
              isContextCollapsed ? "-rotate-90" : ""
            }`}
          />
        </div>
        {!isContextCollapsed && (
          <p className="mt-1.5 text-[11px] text-muted-foreground/80 font-mono leading-relaxed line-clamp-3 bg-black/10 rounded-md px-2 py-1.5">
            {displayText}
          </p>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Ask AI about this selection...
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">
                Try a quick action or type your own question
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.prompt)}
                    className="px-3 py-1.5 text-[11px] font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted/60 border border-white/5 rounded-bl-sm"
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{message.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted/60 border border-white/5 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                <div className="flex items-center gap-1.5">
                  <span className="inline-ai-typing-dot" />
                  <span className="inline-ai-typing-dot" style={{ animationDelay: "0.15s" }} />
                  <span className="inline-ai-typing-dot" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="px-3 py-2.5 border-t border-white/10 bg-white/5">
        <div className="relative flex items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this selection..."
            className="flex-1 h-9 text-sm bg-black/20 border-white/10 focus-visible:ring-primary/50 rounded-xl pr-10"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            className="absolute right-1 h-7 w-7 rounded-lg bg-primary/20 hover:bg-primary/40 text-primary"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
