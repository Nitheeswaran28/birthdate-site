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
  { id: "1", date: "SEP 2024", quote: '"The day everything started."', sub: "A memory worth everything.", src: "/media/photo-1.jpg" },
  { id: "2", date: "SEP 2024", quote: '"The beginning of us."', sub: "Still feels magical.", src: "/media/photo-2.jpg" },
  { id: "3", date: "NOV 2024", quote: '"A memory in motion."', sub: "And one of my favourites.", src: "/media/vid-3.mp4" },
  { id: "4", date: "OCT 2024", quote: '"Some moments stay forever."', sub: "This is one of them.", src: "/media/vid-4.mp4" },
  { id: "5", date: "JAN 2025", quote: '"A perfect little memory."', sub: "Could replay forever.", src: "/media/vid-5.mp4" },
  { id: "6", date: "NOV 2024", quote: '"The cutest frame ever."', sub: "Pure happiness.", src: "/media/photo-6.jpg" },
  { id: "7", date: "FEB 2025", quote: '"Every smile matters."', sub: "Especially yours.", src: "/media/photo-7.jpg" },
  { id: "8", date: "FEB 2025", quote: '"One more unforgettable day."', sub: "And many more ahead.", src: "/media/photo-8.jpg" },
  { id: "9", date: "FEB 2025", quote: '"A memory that still glows."', sub: "Never fading.", src: "/media/photo-9.jpg" },
  { id: "10", date: "FEB 2025", quote: '"Every picture tells a story."', sub: "I love ours.", src: "/media/photo-10.jpg" },

  { id: "11", date: "FEB 2025", quote: '"A beautiful video memory."', sub: "Still replaying in my head.", src: "/media/vid-11.mp4" },
  { id: "12", date: "MAR 2025", quote: '"One frame, endless memories."', sub: "Always special.", src: "/media/photo-12.jpg" },
  { id: "13", date: "APR 2025", quote: '"You make everything brighter."', sub: "Always have.", src: "/media/photo-13.jpg" },
  { id: "14", date: "MAY 2025", quote: '"Some moments feel unreal."', sub: "This was one.", src: "/media/photo-14.jpg" },
  { id: "15", date: "MAY 2026", quote: '"A memory worth replaying forever."', sub: "Still smiling at this.", src: "/media/vid-15.mp4" },
  { id: "16", date: "SEP 2025", quote: '"Pure happiness captured."', sub: "No explanation needed.", src: "/media/vid-16.mp4" },
  { id: "17", date: "DEC 2025", quote: '"One of the best memories."', sub: "Still feels magical.", src: "/media/vid-17.mp4" },
  { id: "18", date: "NOV 2025", quote: '"A perfect little moment."', sub: "And perfectly captured.", src: "/media/vid-18.mp4" },
  { id: "19", date: "MAY 2026", quote: '"Moments like this stay forever."', sub: "Always replay-worthy.", src: "/media/vid-19.mp4" },
  { id: "20", date: "MAY 2026", quote: '"A cinematic memory."', sub: "One of my favourites.", src: "/media/vid-20.mp4" },

  { id: "21", date: "NOV 2025", quote: '"Captured beautifully."', sub: "And remembered forever.", src: "/media/photo-21.jpg" },
  { id: "22", date: "NOV 2025", quote: '"A moment in motion."', sub: "Still unforgettable.", src: "/media/photo-22.mp4" },
  { id: "23", date: "NOV 2025", quote: '"A memory frozen in time."', sub: "And still beautiful.", src: "/media/photo-23.jpg" },
  { id: "24", date: "MAY 2026", quote: '"Some memories deserve movies."', sub: "This is one.", src: "/media/vid-24.mp4" },
  { id: "25", date: "MAY 2026", quote: '"One of the happiest frames."', sub: "Could never forget this.", src: "/media/photo-25.jpg" },
  { id: "26", date: "NOV 2025", quote: '"Tiny moments matter most."', sub: "Especially this.", src: "/media/vid-26.mp4" },
  { id: "27", date: "DEC 2025", quote: '"The cutest video ever."', sub: "No debate.", src: "/media/vid-27.mp4" },
  { id: "28", date: "MAY 2026", quote: '"A memory for forever."', sub: "Happy Birthday Drisha 🎂", src: "/media/vid-28.mp4" },
  { id: "29", date: "MAY 2026", quote: '"One last beautiful frame."', sub: "But not the last memory.", src: "/media/photo-29.jpg" },
  { id: "30", date: "MAR 2026", quote: '"The story continues..."', sub: "And the best is yet to come.", src: "/media/photo-30.jpg" },
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

    const click1 = actx.createOscillator();
    const click2 = actx.createOscillator();
    const gain = actx.createGain();

    click1.type = "triangle";
    click2.type = "sine";

    click1.frequency.setValueAtTime(180, actx.currentTime);
    click2.frequency.setValueAtTime(90, actx.currentTime);

    gain.gain.setValueAtTime(0.12, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.18);

    click1.connect(gain);
    click2.connect(gain);
    gain.connect(actx.destination);

    click1.start();
    click2.start();

    click1.stop(actx.currentTime + 0.08);
    click2.stop(actx.currentTime + 0.12);
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
        width: "min(720px, 96vw)",
        background: FRAME_BG,
        border: `1px solid ${FRAME_BORDER}`,
        boxShadow: "0 0 80px rgba(0,0,0,0.95)",
      }}>
        <FilmEdge top={true} />

        {/* Image */}
        <div style={{ position: "relative", width: "100%", paddingTop: "88%", background: HOLE, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 7, left: 9, zIndex: 5, fontFamily: "monospace", fontSize: 9, letterSpacing: "0.18em", color: MUTED }}>
            FRAME {String(index + 1).padStart(3, "0")}
          </div>
          <div style={{ position: "absolute", top: 7, right: 9, zIndex: 5, fontFamily: "monospace", fontSize: 9, letterSpacing: "0.18em", color: MUTED }}>
            KODAK GOLD 200
          </div>

          <div style={{ position: "absolute", inset: 0, transition: "opacity 0.42s ease", opacity: visible ? 1 : 0 }}>
            {hasImg ? (
              slide.src.match(/\.(mp4|webm|mov)$/i) ? (
                <video
  src={slide.src}
  autoPlay
  loop
  playsInline
  controls
  controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
  disablePictureInPicture
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover"
  }}
/>
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
          <div 
            key={s.id} onMouseEnter={() => go(i)}
            onClick={() => go(i)} 
            style={{
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
