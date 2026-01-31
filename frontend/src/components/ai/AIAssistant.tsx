import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Loader2, Sparkles, X, Maximize2, Minimize2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { API_URL } from "@/config";
import { useAuth } from "@/lib/auth";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI coding assistant. Ask me anything about your repositories!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const { token } = useAuth();

  const getRepoContext = () => {
    const match = location.pathname.match(/\/repository\/([^/]+)\/([^/]+)/);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
    return undefined;
  };


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const currentRepo = getRepoContext();
      const payload: any = { message: userMessage.content };
      if (currentRepo) {
        payload.repoName = currentRepo;
      }

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to fetch response");
      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "No response received.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting to the server. Please check if the backend is running.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="pointer-events-auto"
          >
            <Card className="glass-card w-[380px] h-[500px] flex flex-col shadow-2xl border-primary/20">
              <CardHeader className="p-4 border-b border-white/10 flex flex-row items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">AI Assistant</CardTitle>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Online
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-black/20">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl text-sm ${message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted/80 backdrop-blur-sm border border-white/5 rounded-bl-none"
                            }`}
                        >
                          {message.content}
                        </div>
                      </motion.div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-muted/50 p-2 rounded-xl rounded-bl-none">
                          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        </div>
                      </div>
                    )}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                <form onSubmit={handleSubmit} className="p-3 bg-white/5 border-t border-white/10">
                  <div className="relative">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about your code..."
                      className="pr-10 bg-black/20 border-white/10 focus-visible:ring-primary/50"
                      disabled={loading}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={loading || !input.trim()}
                      className="absolute right-1 top-1 h-8 w-8 bg-primary/20 hover:bg-primary/40 text-primary"
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center glow-green z-50 transition-all hover:bg-primary/90"
      >
        {isOpen ? <Minimize2 className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
