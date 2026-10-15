import type { Book } from "@/lib/supabase/types";

const palettes = [
  ["#455b4d", "#d6b878"], ["#8a503d", "#e5bc7b"], ["#596476", "#dfc8a0"],
  ["#7c684b", "#e7d7b4"], ["#735d6c", "#dfc49d"], ["#426568", "#e2c686"],
];

export function BookCover({ book, className = "" }: { book: Pick<Book, "title" | "author">; className?: string }) {
  const hash = Array.from(book.title).reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 7);
  const [background, ribbon] = palettes[hash % palettes.length];

  return (
    <div
      aria-hidden="true"
      className={`book-spine relative flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded-md p-3 text-center shadow-md ${className}`}
      style={{ backgroundColor: background, color: "#fffaf0" }}
    >
      <span className="absolute inset-y-0 left-2 w-px bg-white/20" />
      <span className="absolute top-0 right-4 h-1/3 w-2" style={{ backgroundColor: ribbon }} />
      <span className="line-clamp-4 font-heading text-[clamp(0.8rem,2vw,1.1rem)] leading-tight font-semibold">{book.title}</span>
      <span className="absolute inset-x-3 bottom-3 truncate text-[10px] tracking-wide text-white/75">{book.author || "A story to remember"}</span>
    </div>
  );
}
