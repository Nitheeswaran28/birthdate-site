import type { Slide } from "../types";

const KEY = "birthday-slides-v1";

// Default demo slides using royalty-free Unsplash images
const DEFAULT_SLIDES: Slide[] = [
  {
    id: "default-1",
    type: "image",
    src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&q=80",
    caption: "Here's to you — and every laugh, every moment, every year.",
  },
  {
    id: "default-2",
    type: "image",
    src: "https://images.unsplash.com/photo-1464349095431-e9a21285b19a?w=1600&q=80",
    caption: "The ones we love most light up every room they enter.",
  },
  {
    id: "default-3",
    type: "image",
    src: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=1600&q=80",
    caption: "Another chapter begins — and it's going to be brilliant.",
  },
];

export function loadSlides(): Slide[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SLIDES;
    const parsed = JSON.parse(raw) as Slide[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SLIDES;
  } catch {
    return DEFAULT_SLIDES;
  }
}

export function saveSlides(slides: Slide[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(slides));
  } catch (e) {
    // Storage quota exceeded — happens with many large base64 images.
    // Graceful degradation: app still works, changes just won't persist.
    console.warn("[birthday-site] localStorage quota exceeded:", e);
  }
}

export function resetSlides(): void {
  localStorage.removeItem(KEY);
}
