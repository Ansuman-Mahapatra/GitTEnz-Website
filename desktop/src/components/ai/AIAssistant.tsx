import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, MessageSquare, User, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const FAQ_OPTIONS = [
  { id: "what-is-gittenz", label: "What is GitTEnz?" },
  { id: "how-to-start", label: "How to get started?" },
  { id: "where-code", label: "Where do I view code?" },
  { id: "how-local-repos", label: "How do Local Repos work?" },
  { id: "what-is-streak", label: "What is the Activity Streak?" },
  { id: "how-to-edit", label: "How to edit and commit?" },
];

const FAQ_ANSWERS: Record<string, string> = {
  "what-is-gittenz": "GitTEnz is a comprehensive Git and GitHub repository management dashboard. It allows you to monitor your coding streak, track commits and pull requests, browse your repository structures, and securely analyze repositories stored locally on your device without uploading them.",
  "how-to-start": "1) Sign up using a unique username, your email, and a secure password.\n2) Verify your email using the OTP sent to your inbox.\n3) Log in and click 'Connect GitHub' on the Dashboard.\n4) Authorize GitTEnz to sync your public repositories and activity!",
  "where-code": "Go to the 'Repositories' tab from the sidebar menu and click on any repository card. You'll be taken to the Repository Detail View where you can explore the file tree, switch branches, read commit history, and view code directly in the browser!",
  "how-local-repos": "Navigate to the 'Local Repos' tab. Click 'Select Project Folder' and pick any local folder on your computer that has a .git directory. GitTEnz uses secure browser APIs to read the files purely locally—your code never leaves your machine!",
  "what-is-streak": "Your Personal Streak tracks the consecutive days you log into GitTEnz. You can see your heatmap calendar resolving your daily logins right on the main Dashboard!",
  "how-to-edit": "In the Repository Detail View, click on a file to read it. Click the 'Edit' button, make changes in the built-in editor, and click 'Save Changes' to securely push a commit directly from the browser (only applicable if you own the repository)."
};

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  isOptions?: boolean;
  options?: { id: string; label: string }[];
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

  const handleOptionClick = (optionId: string, label: string) => {
    const userMsg: Message = {
      id: Date.now().toString() + "-user",
      sender: "user",
      text: label,
    };

    setMessages((prev) => {
      // Remove old options block to clean up history, keep the text flow smooth
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
          text: "Select next topic:",
          isOptions: true,
          options: FAQ_OPTIONS
        });
      } else if (optionId === "no") {
        newMessages.push({
          id: Date.now().toString() + "-bot",
          sender: "bot",
          text: "I'm sorry to hear that! You might find more detailed information by exploring the other sections. Meanwhile, feel free to ask about another topic:",
        });
        newMessages.push({
          id: Date.now().toString() + "-opts",
          sender: "bot",
          text: "",
          isOptions: true,
          options: FAQ_OPTIONS
        });
      } else {
        // Normal FAQ
        newMessages.push({
          id: Date.now().toString() + "-bot",
          sender: "bot",
          text: FAQ_ANSWERS[optionId] || "I don't have more information on that.",
        });
        newMessages.push({
          id: Date.now().toString() + "-opts",
          sender: "bot",
          text: "Did this solve your problem?",
          isOptions: true,
          options: [
            { id: "yes", label: "✅ Yes, that helped!" },
            { id: "no", label: "❌ No, I'm still confused." }
          ]
        });
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
                                  onClick={() => handleOptionClick(opt.id, opt.label)}
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
        className="pointer-events-auto w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center glow-blue z-50 transition-all hover:bg-primary/90"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
