import { useState, useEffect, useRef } from "react";
import { API_URL } from "@/config";
import { motion, AnimatePresence } from "framer-motion";

// ─── constants ────────────────────────────────────────────────
const HEALTH_URL = `${API_URL}/api/public/health`;
const FAST_PING_TIMEOUT_MS = 800;       // if backend responds within 800ms, skip overlay entirely
const PING_INTERVAL_MS = 3000;          // retry every 3s when offline
const BACKGROUND_PING_MS = 5 * 60 * 1000; // check every 5 mins when online
const LONG_WAIT_THRESHOLD_MS = 5000;    // show full card after 5s

// ─── helpers ──────────────────────────────────────────────────
function formatElapsed(ms: number) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_60%,rgba(59,130,246,0.08),transparent)]" />
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
      <motion.div
        className="absolute inset-0 rounded-full bg-blue-500/10"
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
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
        className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-400 to-emerald-300"
        style={{ boxShadow: "0 0 8px rgba(59,130,246,0.6)" }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}

// ─── Dot bounce loader ────────────────────────────────────────
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
  // "checking" = silent fast-ping in progress, no overlay shown
  // "waking"   = backend is slow / cold starting, overlay visible
  // "up"       = backend just responded, short transition away
  // "done"     = overlay gone, full app visible
  const [status, setStatus] = useState<"checking" | "waking" | "up" | "done">("checking");
  const [elapsed, setElapsed]   = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [fadeOut, setFadeOut]   = useState(false);

  const startTimeRef      = useRef<number>(Date.now());
  const mountedRef        = useRef(true);
  const elapsedTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingTimeoutRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    const startElapsedTimer = () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = setInterval(() => {
        if (!mountedRef.current) return;
        const ms = Date.now() - startTimeRef.current;
        setElapsed(ms);
        if (ms > LONG_WAIT_THRESHOLD_MS) setShowCard(true);
      }, 1000);
    };

    const stopElapsedTimer = () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      setElapsed(0);
      setShowCard(false);
      setFadeOut(false);
    };

    const markDone = () => {
      if (!mountedRef.current) return;
      setStatus("up");
      setTimeout(() => {
        if (!mountedRef.current) return;
        setFadeOut(true);
        setTimeout(() => {
          if (mountedRef.current) {
            setStatus("done");
            stopElapsedTimer();
          }
        }, 700);
      }, 500);
    };

    const pingServer = async (isFastPing = false) => {
      if (!mountedRef.current) return;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          isFastPing ? FAST_PING_TIMEOUT_MS : 8000
        );
        const res = await fetch(HEALTH_URL, {
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timeoutId);

        if (res.ok && mountedRef.current) {
          // Cancel the "show overlay" timer since we responded fast enough
          if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
          markDone();
          pingTimeoutRef.current = setTimeout(() => pingServer(false), BACKGROUND_PING_MS);
          return;
        }
      } catch {
        // ping timed out or network error
      }

      if (!mountedRef.current) return;

      if (isFastPing) {
        // The FAST_PING_TIMEOUT_MS timer will handle switching state to "waking"
        // Just schedule a normal retry
        pingTimeoutRef.current = setTimeout(() => pingServer(false), PING_INTERVAL_MS);
      } else {
        pingTimeoutRef.current = setTimeout(() => pingServer(false), PING_INTERVAL_MS);
      }
    };

    // Kick off the fast silent ping immediately
    // If it doesn't resolve within FAST_PING_TIMEOUT_MS, switch to "waking" and show overlay
    overlayTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setStatus((prev) => {
          if (prev === "checking") {
            startTimeRef.current = Date.now();
            startElapsedTimer();
            return "waking";
          }
          return prev;
        });
      }
    }, FAST_PING_TIMEOUT_MS);

    pingServer(true);

    return () => {
      mountedRef.current = false;
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
    };
  }, []);

  // ── Fast path: backend was already up, skip overlay entirely
  if (status === "checking" || status === "done") {
    return <>{children}</>;
  }

  const progress = clamp((elapsed / 30000) * 100, 5, 95);
  const stage    = getStage(elapsed);
  const isUp     = status === "up";

  return (
    <>
      {/* Overlay — only shown when status is "waking" or "up" */}
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
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
                  <LogoRing />
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
                        {isUp ? "Launching your dashboard…" : stage.label}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  <ProgressBar progress={isUp ? 100 : progress} />
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

      {/* Keep children mounted beneath overlay so app state is preserved */}
      <div className="invisible pointer-events-none">
        {children}
      </div>
    </>
  );
}
