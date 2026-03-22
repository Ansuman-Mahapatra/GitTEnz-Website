import { useEffect } from "react";

/**
 * A security utility component that attempts to block common developer actions
 * such as Right-Click, DevTools shortcuts, and dragging elements.
 */
export function SecurityShield() {
  useEffect(() => {
    // Block Right Click (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Block common DevTools shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "C") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "U") ||
        (e.metaKey && e.altKey && e.key === "I") ||
        (e.metaKey && e.altKey && e.key === "J") ||
        (e.metaKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    };

    // Block drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Prevent text selection (optional, but protects content)
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      // Allow selection inside input fields and textareas
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
    };

    // Optional: Infinite debugger loop (activates if devtools is open)
    const debuggerInterval = setInterval(() => {
      (function() {
        try {
          // This will pause the application if DevTools is open
          // @ts-ignore
          (function() { return false; }['constructor']('debugger')['call']());
        } catch (e) {}
      })();
    }, 1000);

    // Detect Headless / Automation (navigator.webdriver)
    if (navigator.webdriver) {
      console.warn("Automation detected. Security protocols active.");
      // You could redirect or block access here if desired
    }

    // Console Clear trick
    const clearConsole = setInterval(() => {
      // @ts-ignore
      if (window.console && window.console.clear) {
        // console.clear(); // Uncomment to actively clear console every second
      }
    }, 1000);

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("selectstart", handleSelectStart);

    return () => {
      // Cleanup event listeners on unmount
      clearInterval(debuggerInterval);
      clearInterval(clearConsole);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("selectstart", handleSelectStart);
    };
  }, []);

  return null; // This component does not render anything
}
