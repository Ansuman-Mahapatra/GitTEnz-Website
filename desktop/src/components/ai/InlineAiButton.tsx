import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface InlineAiButtonProps {
  rect: DOMRect;
  onClick: () => void;
}

export function InlineAiButton({ rect, onClick }: InlineAiButtonProps) {
  // Position the button just above and to the right of the selection
  const top = rect.top + window.scrollY - 44;
  const left = rect.left + window.scrollX + rect.width / 2 - 18;

  // Clamp to viewport bounds
  const clampedLeft = Math.min(Math.max(left, 8), window.innerWidth - 44);
  const clampedTop = Math.max(top, 8);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: 8 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      onMouseDown={(e) => {
        // Prevent text deselection when clicking the button
        e.preventDefault();
        e.stopPropagation();
      }}
      className="fixed z-[9999] w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 hover:scale-110 transition-transform cursor-pointer glow-blue"
      style={{
        top: clampedTop,
        left: clampedLeft,
      }}
      title="Ask AI about selection"
    >
      <Sparkles className="w-4 h-4" />
    </motion.button>
  );
}
