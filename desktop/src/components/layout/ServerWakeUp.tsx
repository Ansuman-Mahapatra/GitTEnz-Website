import { useState, useEffect, useRef } from "react";
import { API_URL } from "@/config";
import { motion, AnimatePresence } from "framer-motion";

// ─── constants ────────────────────────────────────────────────
const HEALTH_URL = `${API_URL}/api/public/health`;
const PING_INTERVAL_MS = 3000;          // retry every 3 s when offline
const BACKGROUND_PING_MS = 5 * 60 * 1000; // check every 5 mins when online
const LONG_WAIT_THRESHOLD_MS = 5000;    // show full card after 5 s

// ─── helpers ──────────────────────────────────────────────────
function formatElapsed(ms: number) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

// Stage descriptions shown in sequence
const STAGES = [
  { threshold: 0,   label: "Connecting to server…"           },
  { threshold: 8,   label: "Initializing backend…"          },
  { threshold: 30,  label: "Establishing secure link…"    },
  { threshold: 60,  label: "Syncing database…"          },
  { threshold: 120, label: "Taking a bit longer to connect…"       },
];

function getStage(elapsed: number) {
  const seconds = elapsed / 1000;
  let current = STAGES[0];
  for (const s of STAGES) {
    if (seconds >= s.threshold) current = s;
  }
  return current;
}

// ─── Animated grid background ─────────────────────────────────
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Radial glow at center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_60%,rgba(59,130,246,0.08),transparent)]" />
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}

// ─── Spinning logo ring ───────────────────────────────────────
function LogoRing() {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Outer slow spin */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(59,130,246,0.8) 0deg, transparent 200deg)",
          borderRadius: "50%",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      {/* Inner faster spin (opposite) */}
      <motion.div
        className="absolute inset-2 rounded-full border border-transparent"
        style={{
          background:
            "conic-gradient(from 180deg, rgba(59,130,246,0.4) 0deg, transparent 160deg)",
          borderRadius: "50%",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      {/* Pulse blob */}
      <motion.div
        className="absolute inset-0 rounded-full bg-blue-500/10"
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Logo text */}
      <span className="relative z-10 text-xl font-black tracking-tight text-blue-400 select-none">
        GT
      </span>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full max-w-xs h-1.5 rounded-full bg-white/5 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-300"
        style={{ boxShadow: "0 0 8px rgba(59,130,246,0.6)" }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}

// ─── Dot bounce loader (used at initial glance) ────────────────
function DotLoader() {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-blue-400/60"
          animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.9,
            delay: i * 0.18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── main export ─────────────────────────────────────────────
export function ServerWakeUp({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "waking" | "up" | "done">("checking");
  const [elapsed, setElapsed]       = useState(0);
  const [showCard, setShowCard]     = useState(false);
  const [fadeOut, setFadeOut]       = useState(false);

  const startTimeRef   = useRef<number>(Date.now());
  const mountedRef     = useRef(true);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── ping loop
  useEffect(() => {
    mountedRef.current = true;
    startTimeRef.current = Date.now();

    // Elapsed-time ticker (updates every second) only runs while disconnected
    const startTimers = () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = setInterval(() => {
        if (!mountedRef.current) return;
        setElapsed(Date.now() - startTimeRef.current);
        if (Date.now() - startTimeRef.current > LONG_WAIT_THRESHOLD_MS) {
           setShowCard(true);
        }
      }, 1000);
    };

    const stopTimers = () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      setElapsed(0);
      setShowCard(false);
      setFadeOut(false);
    };

    if (status !== "done") {
        startTimers();
    }

    const pingServer = async () => {
      if (!mountedRef.current) return;
      try {
        const res = await fetch(HEALTH_URL, {
          signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined,
          cache: "no-store",
        });
        
        if (res.ok) {
          if (status !== "done") {
             // Server just came up!
             setStatus("up");
             setTimeout(() => {
                if (!mountedRef.current) return;
                setFadeOut(true);
                setTimeout(() => {
                   if (mountedRef.current) {
                      setStatus("done");
                      stopTimers();
                   }
                }, 700);
             }, 600);
          }
          
          // Schedule background check for 5 mins
          pingTimeoutRef.current = setTimeout(pingServer, BACKGROUND_PING_MS);
          return;
        }
      } catch {
        /* fetch failed (offline) */
      }

      // If we reach here, server is offline
      if (status === "done" && mountedRef.current) {
         // We lost connection! Re-trigger WakeUp UI
         setStatus("waking");
         startTimeRef.current = Date.now();
         startTimers();
      }

      if (mountedRef.current) {
          pingTimeoutRef.current = setTimeout(pingServer, PING_INTERVAL_MS);
      }
    };

    pingServer();

    return () => {
      mountedRef.current = false;
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
    };
  }, [status]); // Effect re-runs logic hooks slightly if status resets to "waking" but avoids looping.

  // ── render children once done AND disconnected? 
  // We want to overlay the UI when disconnected, but keep children underneath intact so it doesn't unmount the whole app.

  const progress = clamp((elapsed / 30000) * 100, 5, 95); // Fake progress
  const stage    = getStage(elapsed);
  const isUp     = status === "up";

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {!fadeOut && (
          <motion.div
            key="wakeup-overlay"
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09090b]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <GridBackground />

            {/* ── Initial bare spinner (first 5 s) */}
            <AnimatePresence mode="wait">
              {!showCard ? (
                <motion.div
                  key="bare"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-4"
                >
                  <DotLoader />
                  <p className="text-xs text-white/20 tracking-widest uppercase select-none">
                    connecting
                  </p>
                </motion.div>
              ) : (
                /* ── Full wake-up card */
                <motion.div
                  key="card"
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.97 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex flex-col items-center gap-6 p-8 mx-4
                             bg-white/[0.03] border border-white/[0.08] rounded-3xl
                             backdrop-blur-xl shadow-[0_0_80px_rgba(59,130,246,0.04)]
                             max-w-sm w-full text-center"
                >
                  {/* Subtle top glow */}
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

                  {/* Logo ring */}
                  <LogoRing />

                  {/* Title */}
                  <div className="space-y-1.5">
                    <motion.h2
                      className="text-xl font-bold text-white tracking-tight"
                      animate={isUp ? { color: "#3b82f6" } : {}}
                    >
                      {isUp ? "Connected!" : "Connecting to Server"}
                    </motion.h2>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={stage.label}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.3 }}
                        className="text-xs text-white/40 leading-relaxed"
                      >
                        {isUp
                          ? "Launching your dashboard…"
                          : stage.label}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* Progress bar */}
                  <ProgressBar progress={isUp ? 100 : progress} />

                  {/* Footer row: elapsed + tip */}
                  <div className="flex items-center justify-between w-full max-w-xs text-[11px] text-white/20">
                    <span className="font-mono tabular-nums">
                      {formatElapsed(elapsed)}
                    </span>
                    {!isUp && elapsed > 10_000 && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-right leading-tight max-w-[160px]"
                      >
                        Please ensure the backend is running and reachable.
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always render children underneath so app state remains intact when switching between online/offline */}
      <div className={status === "done" && !fadeOut ? "block" : "invisible pointer-events-none"}>
        {children}
      </div>
    </>
  );
}
