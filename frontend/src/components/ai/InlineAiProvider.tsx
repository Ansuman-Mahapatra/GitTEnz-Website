import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useTextSelection } from "@/hooks/useTextSelection";
import { InlineAiButton } from "./InlineAiButton";
import { InlineAiChatPopup } from "./InlineAiChatPopup";

interface InlineAiProviderProps {
  containerRef?: React.RefObject<HTMLElement>;
  externalContext?: { text: string; rect: DOMRect | null } | null;
  onCloseExternal?: () => void;
}

export function InlineAiProvider({ containerRef, externalContext, onCloseExternal }: InlineAiProviderProps) {
  const { text, rect, isActive, clearSelection, setIgnoreNextDeselect } = useTextSelection(containerRef);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<{
    text: string;
    rect: DOMRect | null;
  }>({ text: "", rect: null });

  // Sync with external context
  useEffect(() => {
    if (externalContext) {
      setChatContext(externalContext);
      setIsChatOpen(true);
    }
  }, [externalContext]);

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
    if (onCloseExternal) onCloseExternal();
  }, [clearSelection, onCloseExternal]);

  const activeText = chatContext.text || (isActive ? text : "");
  const activeRect = chatContext.rect || (isActive ? rect : null);

  return (
    <>
      <AnimatePresence>
        {/* Show floating AI button when text is selected and chat is NOT open */}
        {isActive && rect && !isChatOpen && !externalContext && (
          <InlineAiButton
            key="inline-ai-button"
            rect={rect}
            onClick={handleButtonClick}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Show chat popup */}
        {isChatOpen && activeText && (
          <InlineAiChatPopup
            key="inline-ai-chat"
            selectedText={activeText}
            anchorRect={activeRect}
            onClose={handleCloseChat}
          />
        )}
      </AnimatePresence>
    </>
  );
}
