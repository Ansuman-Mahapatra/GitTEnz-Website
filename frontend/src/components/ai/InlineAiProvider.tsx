import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useTextSelection } from "@/hooks/useTextSelection";
import { InlineAiButton } from "./InlineAiButton";
import { InlineAiChatPopup } from "./InlineAiChatPopup";

export function InlineAiProvider() {
  const { text, rect, isActive, clearSelection, setIgnoreNextDeselect } = useTextSelection();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<{
    text: string;
    rect: DOMRect | null;
  }>({ text: "", rect: null });

  const handleButtonClick = useCallback(() => {
    // Prevent deselection on next mouseup (since we're clicking our UI)
    setIgnoreNextDeselect();

    // Capture current selection as chat context
    setChatContext({ text, rect });
    setIsChatOpen(true);
  }, [text, rect, setIgnoreNextDeselect]);

  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
    setChatContext({ text: "", rect: null });
    clearSelection();
  }, [clearSelection]);

  return (
    <>
      <AnimatePresence>
        {/* Show floating AI button when text is selected and chat is NOT open */}
        {isActive && rect && !isChatOpen && (
          <InlineAiButton
            key="inline-ai-button"
            rect={rect}
            onClick={handleButtonClick}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Show chat popup */}
        {isChatOpen && chatContext.text && (
          <InlineAiChatPopup
            key="inline-ai-chat"
            selectedText={chatContext.text}
            anchorRect={chatContext.rect}
            onClose={handleCloseChat}
          />
        )}
      </AnimatePresence>
    </>
  );
}
