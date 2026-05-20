export interface Slide {
  id: string;
  type: "image" | "video";
  src: string;       // base64 data URL or public path
  caption: string;
  musicUrl?: string; // optional per-slide audio track
}
