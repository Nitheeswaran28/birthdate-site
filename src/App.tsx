import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./App.module.css";
import { loadSlides, saveSlides } from "./utils/persistence";
import { playSFX } from "./utils/audio";
import type { Slide } from "./types";

// ── Sub-components ──────────────────────────────────────────────────────────

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className={styles.dots} role="tablist" aria-label="Slide progress">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          role="tab"
          aria-selected={i === current}
          aria-label={`Slide ${i + 1}`}
          className={i === current ? styles.dotActive : styles.dot}
        />
      ))}
    </div>
  );
}

function SlideMedia({ slide, visible }: { slide: Slide; visible: boolean }) {
  return (
    <div className={`${styles.slide} ${visible ? styles.slideVisible : styles.slideHidden}`}>
      {slide.type === "video" ? (
        <video
          src={slide.src}
          autoPlay
          muted
          loop
          playsInline
          className={styles.media}
        />
      ) : (
        <img src={slide.src} alt={slide.caption} className={styles.media} />
      )}
      {slide.caption && (
        <div className={styles.caption}>
          <p>{slide.caption}</p>
        </div>
      )}
    </div>
  );
}

function UploadModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (slides: Slide[]) => void;
}) {
  const [pending, setPending] = useState<Slide[]>([]);
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [musicUrls, setMusicUrls] = useState<Record<string, string>>({});

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        const id = crypto.randomUUID();
        const type = file.type.startsWith("video") ? "video" : "image";
        const caption = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
        setPending((prev) => [...prev, { id, type, src, caption }]);
        setCaptions((prev) => ({ ...prev, [id]: caption }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAdd = () => {
    const slides = pending.map((s) => ({
      ...s,
      caption: captions[s.id] ?? s.caption,
      musicUrl: musicUrls[s.id] || undefined,
    }));
    onAdd(slides);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Add Slides</h2>

        <label
          className={styles.dropZone}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <span className={styles.dropIcon}>＋</span>
          <span>Drop photos / videos here or click to browse</span>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </label>

        {pending.length > 0 && (
          <ul className={styles.pendingList}>
            {pending.map((s) => (
              <li key={s.id} className={styles.pendingItem}>
                <img
                  src={s.type === "image" ? s.src : ""}
                  alt=""
                  className={styles.pendingThumb}
                  style={{ display: s.type === "image" ? "block" : "none" }}
                />
                {s.type === "video" && (
                  <div className={styles.pendingVideoThumb}>▶</div>
                )}
                <div className={styles.pendingFields}>
                  <input
                    className={styles.captionInput}
                    placeholder="Caption…"
                    value={captions[s.id] ?? ""}
                    onChange={(e) =>
                      setCaptions((prev) => ({ ...prev, [s.id]: e.target.value }))
                    }
                  />
                  <input
                    className={styles.captionInput}
                    placeholder="Music URL (optional .mp3)"
                    value={musicUrls[s.id] ?? ""}
                    onChange={(e) =>
                      setMusicUrls((prev) => ({ ...prev, [s.id]: e.target.value }))
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.modalActions}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.btnPrimary}
            disabled={pending.length === 0}
            onClick={handleAdd}
          >
            Add {pending.length > 0 ? `${pending.length} slide${pending.length > 1 ? "s" : ""}` : "slides"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [slides, setSlides] = useState<Slide[]>(loadSlides);
  const [index, setIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // persist on change
  useEffect(() => {
    saveSlides(slides);
  }, [slides]);

  // per-slide music
  useEffect(() => {
    if (!audioRef.current) return;
    const track = slides[index]?.musicUrl;
    if (track) {
      audioRef.current.src = track;
      if (!muted) audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  }, [index, slides, muted]);

  const go = useCallback(
    (next: number) => {
      if (transitioning) return;
      const clamped = Math.max(0, Math.min(next, slides.length - 1));
      if (clamped === index) return;
      setTransitioning(true);
      playSFX();
      setTimeout(() => {
        setIndex(clamped);
        setTransitioning(false);
      }, 320);
    },
    [transitioning, index, slides.length]
  );

  // keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go, index]);

  const addSlides = (newSlides: Slide[]) => {
    setSlides((prev) => [...prev, ...newSlides]);
  };

  if (slides.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyInner}>
          <p className={styles.emptyEmoji}>🎂</p>
          <h1 className={styles.emptyTitle}>Your story starts here</h1>
          <p className={styles.emptyDesc}>Add photos and videos to build the gallery.</p>
          <button className={styles.btnPrimary} onClick={() => setShowUpload(true)}>
            Add first slide
          </button>
        </div>
        {showUpload && (
          <UploadModal onClose={() => setShowUpload(false)} onAdd={addSlides} />
        )}
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <audio ref={audioRef} loop />

      {/* Slide area */}
      <div className={styles.stage}>
        {slides.map((slide, i) => (
          <SlideMedia key={slide.id} slide={slide} visible={i === index && !transitioning} />
        ))}
      </div>

      {/* Top bar */}
      <div className={styles.topBar}>
        <span className={styles.counter}>
          {index + 1} / {slides.length}
        </span>
        <div className={styles.topActions}>
          <button
            className={styles.iconBtn}
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => setShowUpload(true)}
            aria-label="Add slides"
            title="Add slides"
          >
            ＋
          </button>
        </div>
      </div>

      {/* Nav controls */}
      <button
        className={`${styles.navBtn} ${styles.navPrev}`}
        onClick={() => go(index - 1)}
        disabled={index === 0}
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        className={`${styles.navBtn} ${styles.navNext}`}
        onClick={() => go(index + 1)}
        disabled={index === slides.length - 1}
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Progress dots */}
      <div className={styles.bottomBar}>
        <ProgressDots total={slides.length} current={index} />
      </div>

      {/* ARIA live region */}
      <div aria-live="polite" className={styles.srOnly}>
        Slide {index + 1} of {slides.length}: {slides[index]?.caption}
      </div>

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onAdd={addSlides} />
      )}
    </div>
  );
}
