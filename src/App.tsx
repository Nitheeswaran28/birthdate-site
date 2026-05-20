import { useState, useEffect, useRef, useCallback } from "react";

// ════════════════════════════════════════════════════════════════
//  ADD YOUR PHOTOS & CAPTIONS HERE
//  src: put image/video files in /public/media/ and use "/media/filename.jpg"
//       OR paste any direct image URL (https://...)
//  date: shown in gold above the quote (e.g. "JUN 2024")
//  quote: big italic text shown below the frame
//  sub: smaller muted line below the quote
// ════════════════════════════════════════════════════════════════
const SLIDES = [
  {
    id: "1",
    date: "JUN 2024",
    quote: '"The day everything started."',
    sub: "We had no idea what was ahead.",
    src: "/media/photo1.jpg",         // ← replace with your photo
  },
  {
    id: "2",
    date: "AUG 2024",
    quote: '"Every moment with you is a memory."',
    sub: "And this one is my favourite.",
    src: "/media/photo2.jpg",         // ← replace with your photo
  },
  {
    id: "3",
    date: "OCT 2024",
    quote: '"Some days just feel like magic."',
    sub: "This was one of them.",
    src: "/media/photo3.jpg",
  },
  {
    id: "4",
    date: "DEC 2024",
    quote: '"You make every room brighter."',
    sub: "Always have, always will.",
    src: "/media/photo4.jpg",
  },
  {
    id: "5",
    date: "FEB 2025",
    quote: '"Adventures are better with you."',
    sub: "Here's proof.",
    src: "/media/photo5.jpg",
  },
  {
    id: "6",
    date: "APR 2025",
    quote: '"Laughing until it hurts."',
    sub: "No context needed.",
    src: "/media/photo6.jpg",
  },
  {
    id: "7",
    date: "MAY 2025",
    quote: '"The best is yet to come."',
    sub: "Happy Birthday, Drisha. 🎂",
    src: "/media/photo7.jpg",
  },
];
// ════════════════════════════════════════════════════════════════

const GOLD = "#C9A84C";
const DARK = "#0A0906";
const FRAME_BG = "#110F0A";
const FRAME_BORDER = "#2A2318";
const FILM = "#1A1510";
const WARM = "#EDE0C4";
const MUTED = "#6B5F48";
const HOLE = "#0D0B07";

// ── Audio SFX ────────────────────────────────────────────────────
let actx: AudioContext | null = null;
function sfx() {
  try {
    actx = actx || new AudioContext();
    const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
    o.connect(g); g.connect(actx.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(700, t);
    o.frequency.exponentialRampToValueAtTime(480, t + 0.12);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.start(t); o.stop(t + 0.2);
  } catch {}
}

// ── Confetti ─────────────────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#C9A84C", "#E8C97A", "#EDE0C4", "#fff", "#f9d342", "#ff6b6b", "#74b9ff"];
    const pieces = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 4,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 4 + 2,
      vr: (Math.random() - 0.5) * 0.15,
    }));

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frame++;
      if (frame < 180) animRef.current = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0, zIndex: 999,
      pointerEvents: "none", width: "100%", height: "100%",
    }} />
  );
}

// ── Sprocket holes ────────────────────────────────────────────────
function FilmEdge({ top }: { top: boolean }) {
  return (
    <div style={{
      height: 34, background: FILM, overflow: "hidden",
      borderTop: top ? "none" : `1px solid ${FRAME_BORDER}`,
      borderBottom: top ? `1px solid ${FRAME_BORDER}` : "none",
      display: "flex", alignItems: "center",
    }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          width: 16, height: 22, margin: "0 4px", flexShrink: 0,
          borderRadius: 3, background: HOLE, border: "1px solid #000",
        }} />
      ))}
    </div>
  );
}

// ── Intro / Landing page ──────────────────────────────────────────
function Intro({ onNext }: { onNext: () => void }) {
  const [hov, setHov] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const handleClick = () => {
    setConfetti(true);
    sfx();
    setTimeout(onNext, 1800);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: DARK,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", padding: "1rem",
    }}>
      <Confetti active={confetti} />

      {/* Animated gold rings */}
      <div style={{ position: "relative", marginBottom: 40 }}>
        {[80, 110, 140].map((size, i) => (
          <div key={i} style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: size, height: size, borderRadius: "50%",
            border: `1px solid rgba(201,168,76,${0.15 - i * 0.04})`,
            animation: `pulse ${1.8 + i * 0.4}s ease-in-out infinite`,
          }} />
        ))}
        <div style={{
          width: 60, height: 60, borderRadius: "50%",
          background: `radial-gradient(circle, ${GOLD} 0%, #8B6914 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.6rem",
        }}>🎂</div>
      </div>

      <p style={{
        fontFamily: "monospace", fontSize: 11, letterSpacing: "0.28em",
        color: MUTED, marginBottom: 20,
      }}>12 · 06 · 2026</p>

      <h1 style={{
        fontFamily: "Georgia,'Times New Roman',serif",
        fontSize: "clamp(2rem, 7vw, 4rem)",
        fontWeight: 400, color: GOLD,
        margin: 0, lineHeight: 1.1, textAlign: "center",
        animation: "fadeUp 1s ease both",
      }}>
        Happy Birthday,
      </h1>
      <h1 style={{
        fontFamily: "Georgia,'Times New Roman',serif",
        fontSize: "clamp(2.4rem, 8vw, 4.8rem)",
        fontWeight: 400, fontStyle: "italic",
        color: WARM, margin: "4px 0 0",
        animation: "fadeUp 1s 0.2s ease both", opacity: 0,
        animationFillMode: "forwards",
      }}>
        Drisha
      </h1>

      <p style={{
        fontFamily: "Georgia,serif", fontStyle: "italic",
        fontSize: "clamp(0.85rem, 2vw, 1rem)",
        color: MUTED, marginTop: 16, marginBottom: 44,
        letterSpacing: "0.06em", textAlign: "center",
        animation: "fadeUp 1s 0.4s ease both", opacity: 0,
        animationFillMode: "forwards",
      }}>
        a year of memories, just for you ✨
      </p>

      <button
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={handleClick}
        style={{
          background: hov ? GOLD : "transparent",
          border: `1px solid ${GOLD}`, borderRadius: 2,
          color: hov ? DARK : GOLD,
          padding: "13px 36px", fontSize: 11,
          fontFamily: "monospace", letterSpacing: "0.22em",
          cursor: "pointer", transition: "all 0.25s ease",
          animation: "fadeUp 1s 0.6s ease both", opacity: 0,
          animationFillMode: "forwards",
        }}
      >
        OPEN THE MEMORY ROLL
      </button>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }
        @keyframes pulse { 0%,100% { transform:translate(-50%,-50%) scale(1); opacity:0.6 } 50% { transform:translate(-50%,-50%) scale(1.08); opacity:1 } }
      `}</style>
    </div>
  );
}

// ── Main gallery ──────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState<"intro" | "gallery">("intro");
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [imgErr, setImgErr] = useState<Record<string, boolean>>({});
  const trans = useRef(false);

  const go = useCallback((next: number) => {
    if (trans.current) return;
    const c = Math.max(0, Math.min(next, SLIDES.length - 1));
    if (c === index) return;
    trans.current = true; setVisible(false); sfx();
    setTimeout(() => { setIndex(c); setVisible(true); trans.current = false; }, 380);
  }, [index]);

  useEffect(() => {
    if (phase !== "gallery") return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(index + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [phase, go, index]);

  if (phase === "intro") return <Intro onNext={() => setPhase("gallery")} />;

  const slide = SLIDES[index];
  const hasImg = slide.src && !imgErr[slide.id];

  return (
    <div style={{
      position: "fixed", inset: 0, background: DARK,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)",
    }}>

      {/* Film frame — responsive width */}
      <div style={{
        width: "min(460px, 94vw)",
        background: FRAME_BG,
        border: `1px solid ${FRAME_BORDER}`,
        boxShadow: "0 0 80px rgba(0,0,0,0.95)",
      }}>
        <FilmEdge top={true} />

        {/* Image */}
        <div style={{ position: "relative", width: "100%", paddingTop: "75%", background: HOLE, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 7, left: 9, zIndex: 5, fontFamily: "monospace", fontSize: 9, letterSpacing: "0.18em", color: MUTED }}>
            FRAME {String(index + 1).padStart(3, "0")}
          </div>
          <div style={{ position: "absolute", top: 7, right: 9, zIndex: 5, fontFamily: "monospace", fontSize: 9, letterSpacing: "0.18em", color: MUTED }}>
            KODAK GOLD 200
          </div>

          <div style={{ position: "absolute", inset: 0, transition: "opacity 0.42s ease", opacity: visible ? 1 : 0 }}>
            {hasImg ? (
              slide.src.match(/\.(mp4|webm|mov)$/i) ? (
                <video src={slide.src} autoPlay muted loop playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <img src={slide.src} alt={slide.quote}
                  onError={() => setImgErr(p => ({ ...p, [slide.id]: true }))}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              )
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <div style={{ fontSize: "2rem", opacity: 0.2 }}>📷</div>
                <p style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.14em", color: MUTED, textAlign: "center", lineHeight: 2 }}>
                  ADD YOUR PHOTO HERE<br />
                  see README for instructions
                </p>
              </div>
            )}
          </div>
          <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", background: "linear-gradient(135deg,rgba(28,18,4,0.15) 0%,transparent 55%,rgba(8,6,2,0.28) 100%)" }} />
        </div>

        <FilmEdge top={false} />

        {/* Metadata */}
        <div style={{ padding: "12px 14px 14px", background: FRAME_BG }}>
          <p style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.22em", color: GOLD, marginBottom: 6 }}>
            {slide.date}
          </p>
          <p style={{
            fontFamily: "Georgia,serif", fontStyle: "italic",
            fontSize: "clamp(0.95rem, 2.6vw, 1.15rem)",
            color: WARM, lineHeight: 1.35, margin: 0,
            transition: "opacity 0.4s ease", opacity: visible ? 1 : 0,
          }}>
            {slide.quote}
          </p>
          {slide.sub && (
            <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 12, color: MUTED, marginTop: 5 }}>
              {slide.sub}
            </p>
          )}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div style={{
        width: "min(460px,94vw)", background: FILM,
        border: `1px solid ${FRAME_BORDER}`, borderTop: "none",
        display: "flex", alignItems: "center",
        padding: "5px 4px", overflowX: "auto",
        scrollbarWidth: "none",
      }}>
        {SLIDES.map((s, i) => (
          <div key={s.id} onClick={() => go(i)} style={{
            width: 26, height: 20, flexShrink: 0,
            border: `1px solid ${i === index ? GOLD : FRAME_BORDER}`,
            borderRadius: 2, overflow: "hidden", cursor: "pointer",
            opacity: i === index ? 1 : 0.38,
            margin: "0 2px", background: HOLE,
            transition: "opacity 0.2s, border-color 0.2s",
          }}>
            {s.src && !imgErr[s.id] && (
              <img src={s.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18 }}>
        <button onClick={() => go(index - 1)} disabled={index === 0} style={{
          width: 42, height: 42, borderRadius: "50%", fontSize: "1.1rem",
          cursor: index === 0 ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "transparent",
          border: `1px solid ${index === 0 ? FRAME_BORDER : GOLD}`,
          color: index === 0 ? FRAME_BORDER : GOLD,
          transition: "all 0.2s",
        }}>←</button>

        <span style={{ fontFamily: "monospace", fontSize: 13, color: MUTED, letterSpacing: "0.14em", minWidth: 52, textAlign: "center" }}>
          {String(index + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </span>

        <button onClick={() => go(index + 1)} disabled={index === SLIDES.length - 1} style={{
          width: 42, height: 42, borderRadius: "50%", fontSize: "1.1rem",
          cursor: index === SLIDES.length - 1 ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: index === SLIDES.length - 1 ? "transparent" : GOLD,
          border: `1px solid ${index === SLIDES.length - 1 ? FRAME_BORDER : GOLD}`,
          color: index === SLIDES.length - 1 ? FRAME_BORDER : DARK,
          transition: "all 0.2s",
        }}>→</button>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 5, marginTop: 10, alignItems: "center" }}>
        {SLIDES.map((_, i) => (
          <div key={i} style={{
            width: i === index ? 16 : 4, height: 2, borderRadius: 2,
            background: i === index ? GOLD : MUTED,
            transition: "all 0.3s ease",
          }} />
        ))}
      </div>

      <p style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.18em", color: "rgba(107,95,72,0.3)", marginTop: 9 }}>
        ← → ARROW KEYS TO NAVIGATE
      </p>

      <div aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
        Slide {index + 1} of {SLIDES.length}: {slide.quote}
      </div>
    </div>
  );
}
