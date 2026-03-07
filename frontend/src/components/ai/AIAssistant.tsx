import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, MessageSquare, User, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const FAQ_OPTIONS = [
  { id: "what-is-gittenz", label: "✨ What is GitTEnz?" },
  { id: "project-details", label: "📋 Project Details & Subpoints" },
  { id: "tech-stack", label: "🚀 Tech Stack & Infrastructure" },
  { id: "security-info", label: "🔒 Security & Privacy" },
  { id: "how-to-start", label: "🌱 How to get started?" },
  { id: "how-local-repos", label: "💻 How do Local Repos work?" },
];

const FAQ_ANSWERS: Record<string, string> = {
  "what-is-gittenz": "GitTEnz is a next-generation Git and GitHub management platform designed to streamline your development workflow.\n\nKey Highlights:\n• Real-time GitHub Activity Tracking\n• Multi-platform support (Web & Desktop)\n• Intelligent Code Analysis\n• Seamless Repository Management",
  "project-details": "GitTEnz is built as a high-performance developer companion. Which part would you like to dive into?",
  "arch-deep-dive": "1. Modern Architecture:\n   - Frontend: React 18 / Vite with framer-motion for 60fps glassmorphism.\n   - Backend: Robust Java Spring Boot 3 with Clean Architecture.\n   - Persistence: MongoDB (User Data) & Redis (Session Cache).",
  "feature-roadmap": "2. Advanced Feature Set:\n   - Real-time Sync: Automatic polling with GitHub's Event API.\n   - Heatmaps: Visual streak tracking for contributions.\n   - Code Explorer: Full file tree and in-browser code editing.\n   - Local Sec: 100% private local repo analysis via File System API.",
  "tech-stack": "We use a modern stack to ensure speed and reliability. What section interests you?",
  "frontend-tech": "• Framework: React 18 & TypeScript\n• Styling: Tailwind CSS & Framer Motion\n• Tooling: Vite (Fast HMR)\n• UI: Shadcn UI & Radix Primitives",
  "backend-tech": "• Core: Java 17+, Spring Boot 3\n• Auth: Spring Security 6 with OAuth2\n• API: RESTful architecture with optimized rate-limiting\n• Clouds: Render (Backend) & Vercel (Frontend)",
  "security-info": "Security is our top priority. What would you like to verify?",
  "privacy-details": "• Local Privacy: Local repository scanning happens entirely within your browser's sandbox—your code is NEVER uploaded.\n• Session: 15-minute inactivity auto-logout protection.",
  "auth-details": "• OAuth2: We use GitHub's official portal—we never see your password.\n• JWT: All API communication is secured with industry-standard tokens.",
  "how-to-start": "Getting started is easy:\n1) Create an account with a secure password.\n2) Verify your identity via the OTP sent to your email.\n3) Connect your GitHub account via our secure OAuth portal.\n4) Start exploring your repositories and activity history!",
  "how-local-repos": "Navigate to the 'Local Repos' tab. Click 'Select Project Folder'. GitTEnz uses the File System Access API to interact with your code purely locally—ensuring 100% privacy and security.",
};

const FAQ_SUB_OPTIONS: Record<string, { id: string; label: string }[]> = {
  "project-details": [
    { id: "arch-deep-dive", label: "🏗️ Core Architecture" },
    { id: "feature-roadmap", label: "💎 Key Features" },
    { id: "back-to-main", label: "⬅️ Main Menu" }
  ],
  "tech-stack": [
    { id: "frontend-tech", label: "⚛️ Frontend Stack" },
    { id: "backend-tech", label: "☕ Backend Stack" },
    { id: "back-to-main", label: "⬅️ Main Menu" }
  ],
  "security-info": [
    { id: "privacy-details", label: "🛡️ Privacy & Local Data" },
    { id: "auth-details", label: "🔑 Authentication Safety" },
    { id: "back-to-main", label: "⬅️ Main Menu" }
  ]
};

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  isOptions?: boolean;
  options?: { id: string; label: string }[];
  parentTopic?: string;
};

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi there! 👋 I'm your GitTEnz Interactive Guide. What would you like to explore today?",
    },
    {
      id: "options-initial",
      sender: "bot",
      text: "",
      isOptions: true,
      options: FAQ_OPTIONS
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleOptionClick = (optionId: string, label: string, parentTopic?: string) => {
    const userMsg: Message = {
      id: Date.now().toString() + "-user",
      sender: "user",
      text: label,
    };

    setMessages((prev) => {
      const cleaned = prev.filter(m => !m.isOptions);
      let newMessages: Message[] = [userMsg];

      if (optionId === "yes") {
        newMessages.push({
          id: Date.now().toString() + "-bot",
          sender: "bot",
          text: "Awesome! I'm glad I could help! Is there anything else you'd like to ask?",
        });
        newMessages.push({
          id: Date.now().toString() + "-opts",
          sender: "bot",
          text: "",
          isOptions: true,
          options: FAQ_OPTIONS
        });
      } else if (optionId === "no") {
        const currentParent = parentTopic;
        if (currentParent && FAQ_SUB_OPTIONS[currentParent]) {
          newMessages.push({
            id: Date.now().toString() + "-bot",
            sender: "bot",
            text: "Let me provide more specific details about that. Which point would you like to explore?",
            isOptions: true,
            options: FAQ_SUB_OPTIONS[currentParent]
          });
        } else {
          newMessages.push({
            id: Date.now().toString() + "-bot",
            sender: "bot",
            text: "I'm sorry! Let's try another topic. What would you like to know?",
            isOptions: true,
            options: FAQ_OPTIONS
          });
        }
      } else if (optionId === "back-to-main") {
        newMessages.push({
          id: Date.now().toString() + "-bot",
          sender: "bot",
          text: "Sure! What else can I help you with?",
          isOptions: true,
          options: FAQ_OPTIONS
        });
      } else {
        // Handle normal FAQ and check for sub-options
        newMessages.push({
          id: Date.now().toString() + "-bot",
          sender: "bot",
          text: FAQ_ANSWERS[optionId] || "I don't have more information on that.",
        });

        if (FAQ_SUB_OPTIONS[optionId]) {
          newMessages.push({
            id: Date.now().toString() + "-opts-sub",
            sender: "bot",
            text: "Explore more specific points:",
            isOptions: true,
            parentTopic: optionId,
            options: FAQ_SUB_OPTIONS[optionId]
          });
        } else {
          newMessages.push({
            id: Date.now().toString() + "-opts-solve",
            sender: "bot",
            text: "Did this solve your problem?",
            isOptions: true,
            parentTopic: parentTopic || optionId, // Preserve the parent context
            options: [
              { id: "yes", label: "✅ Yes, that helped!" },
              { id: "no", label: "❌ No, I'm still confused." }
            ]
          });
        }
      }

      return [...cleaned, ...newMessages];
    });
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
            <Card className="glass-card w-[380px] h-[500px] flex flex-col shadow-2xl overflow-hidden border-primary/20 backdrop-blur-xl bg-background/90">
              <CardHeader className="p-4 border-b border-white/10 flex flex-row items-center justify-between bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center p-[1px]">
                    <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">GitTEnz Guide</CardTitle>
                    <p className="text-[10px] text-muted-foreground">Always here to help</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white/10" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="flex flex-col gap-4">
                    {messages.map((msg) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id} 
                        className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"} ${msg.isOptions ? "mt-2" : ""}`}
                      >
                        {!msg.isOptions && (
                          <div className={`mt-0.5 w-7 h-7 shrink-0 rounded-full flex items-center justify-center ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </div>
                        )}
                        
                        <div className={`flex flex-col gap-2 max-w-[85%] ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                          {msg.text && (
                            <div className={`px-3 py-2 rounded-2xl text-sm ${
                              msg.sender === "user" 
                                ? "bg-primary text-primary-foreground rounded-tr-sm" 
                                : "bg-muted/50 text-foreground rounded-tl-sm border border-white/5"
                            } whitespace-pre-line`}>
                              {msg.text}
                            </div>
                          )}
                          
                          {/* Options Bubble */}
                          {msg.isOptions && (
                            <div className="flex flex-col gap-2 w-full ml-10">
                              {(msg.options || FAQ_OPTIONS).map((opt) => (
                                <motion.button
                                  whileHover={{ scale: 1.02, x: 2 }}
                                  whileTap={{ scale: 0.98 }}
                                  key={opt.id}
                                  onClick={() => handleOptionClick(opt.id, opt.label, msg.parentTopic)}
                                  className="text-left w-full text-xs font-medium bg-background border border-primary/30 hover:bg-primary/10 text-primary px-3 py-2 rounded-xl transition-colors shadow-sm"
                                >
                                  {opt.label}
                                </motion.button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    <div ref={scrollRef} className="h-1" />
                  </div>
                </ScrollArea>
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
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
