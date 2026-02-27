import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Minimize2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const FAQ_SECTIONS = [
  {
    id: "getting-started",
    question: "How do I get started with GitTEnz?",
    answer:
      "1) Sign up with a username, email, and password.\n2) Connect your GitHub account from the dashboard.\n3) After connecting, your repositories and activity will appear in the main dashboard.\n4) Use the side tabs to explore Repositories, Activity, Local Repos, and Settings.",
  },
  {
    id: "connect-github",
    question: "How do I connect or re-connect my GitHub account?",
    answer:
      "Open the Dashboard, then look for the GitHub connect option (or login via GitHub on the auth page).\nIf you have been inactive for more than 72 hours, you will be asked to verify via GitHub again before logging in with your password.",
  },
  {
    id: "admin-panel",
    question: "What can the admin panel do?",
    answer:
      "The admin panel shows platform analytics like total users, repositories, language distribution, and active vs inactive users.\nAdmins can also view feedback, manage system policies (privacy/terms), and change the administrator password.",
  },
  {
    id: "activity-streaks",
    question: "How do streaks and recent activity work?",
    answer:
      "Each user has a personal daily streak based on days they log in.\nThe Activity tab shows your pushes, pull requests, and other GitHub events, plus a list of recently used repositories.",
  },
  {
    id: "local-repos",
    question: "How do I use local repositories?",
    answer:
      "From the Dashboard, open the Local Repos tab and choose a folder on your machine.\nGitTEnz will scan for Git repositories and let you explore the code directly in the browser without uploading it.",
  },
];

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedId, isOpen]);

  const selectedFaq = FAQ_SECTIONS.find((f) => f.id === selectedId);

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
                    <CardTitle className="text-sm font-semibold">Help & FAQ</CardTitle>
                    <p className="text-[10px] text-muted-foreground">
                      Select a question to see the answer.
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-black/20">
                <div className="border-b border-white/10 p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Sections</p>
                  <div className="flex flex-wrap gap-2">
                    {FAQ_SECTIONS.map((faq) => (
                      <Button
                        key={faq.id}
                        variant={selectedId === faq.id ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => setSelectedId(faq.id)}
                      >
                        {faq.question}
                      </Button>
                    ))}
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3 text-sm text-foreground/90 whitespace-pre-line">
                    {selectedFaq ? (
                      <>
                        <p className="font-semibold">{selectedFaq.question}</p>
                        <p>{selectedFaq.answer}</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        Choose a question above to see a short answer about that part of the app.
                      </p>
                    )}
                    <div ref={scrollRef} />
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
        {isOpen ? <Minimize2 className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
