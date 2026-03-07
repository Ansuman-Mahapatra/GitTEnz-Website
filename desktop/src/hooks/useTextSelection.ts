import { useState, useEffect, useCallback, useRef } from "react";

interface TextSelectionState {
  text: string;
  rect: DOMRect | null;
  isActive: boolean;
}

export function useTextSelection() {
  const [selection, setSelection] = useState<TextSelectionState>({
    text: "",
    rect: null,
    isActive: false,
  });

  // Track whether user just clicked our AI button/popup (to avoid dismissing on click inside)
  const ignoreNextDeselect = useRef(false);

  const handleMouseUp = useCallback(() => {
    // Small delay to let the browser finalize the selection
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        if (!ignoreNextDeselect.current) {
          setSelection({ text: "", rect: null, isActive: false });
        }
        ignoreNextDeselect.current = false;
        return;
      }

      const text = sel.toString().trim();
      if (text.length < 2) return; // Ignore very short selections

      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Only show if selection is visible in viewport
        if (rect.width > 0 && rect.height > 0) {
          setSelection({ text, rect, isActive: true });
        }
      } catch {
        // Ignore errors from cross-origin or invalid selections
      }
    }, 10);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Dismiss on Escape
    if (e.key === "Escape") {
      setSelection({ text: "", rect: null, isActive: false });
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({ text: "", rect: null, isActive: false });
  }, []);

  const setIgnoreNextDeselect = useCallback(() => {
    ignoreNextDeselect.current = true;
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleMouseUp, handleKeyDown]);

  return {
    ...selection,
    clearSelection,
    setIgnoreNextDeselect,
  };
}
