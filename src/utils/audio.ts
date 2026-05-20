// Lazy-initialised AudioContext — must be created after a user gesture.
let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/**
 * Play a short, pleasant tick sound using the Web Audio API.
 * No audio file required — generated entirely in-browser.
 *
 * Sounds like a soft xylophone tap. Adjust frequency / gain to taste.
 */
export function playSFX(): void {
  try {
    const ac = getCtx();

    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const now = ac.currentTime;

    osc.connect(gain);
    gain.connect(ac.destination);

    // A warm, mid-range tone
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, now);           // E5
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.1); // ramp down to A4

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);  // fade out

    osc.start(now);
    osc.stop(now + 0.18);
  } catch {
    // AudioContext blocked (e.g. no prior gesture) — silently skip
  }
}

/**
 * Resume AudioContext if it was suspended by the browser autoplay policy.
 * Call this on the first user click.
 */
export function resumeAudio(): void {
  if (ctx?.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}
