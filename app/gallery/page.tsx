"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type GalleryItem = {
  url: string;
  type: string;
  title?: string;
  description?: string;
};

function titleFromUrl(url: string, index: number) {
  const fileName = url.split("/").pop()?.split("?")[0] || "";
  const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
  return cleanName || `Song Teppanyaki Event ${index + 1}`;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<"all" | "photos" | "videos">("all");
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/gallery")
      .then((response) => {
        if (!response.ok) throw new Error("Gallery could not be loaded.");
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        const cloudItems: GalleryItem[] = Array.isArray(data.items)
          ? data.items.map((item: GalleryItem, index: number) => ({
              ...item,
              title: item.title || titleFromUrl(item.url, index),
              description:
                item.description ||
                (item.type === "video"
                  ? "Watch the Song Teppanyaki experience in action."
                  : "Real moments from a private hibachi event."),
            }))
          : [];

        const staticItems: GalleryItem[] = Array.from({ length: 15 }, (_, index) => {
          const number = index + 1;
          const extension = number === 7 ? "png" : "jpg";
          return {
            url: `/gallery/gallery-${number}.${extension}`,
            type: "image",
            title: `Song Teppanyaki Event ${number}`,
            description: "Private parties, family celebrations, and live hibachi cooking.",
          };
        });

        setItems([...cloudItems, ...staticItems]);
      })
      .catch(() => {
        if (active) setError("We couldn't load the gallery right now. Please try again later.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const isVideo = item.type?.toLowerCase() === "video";
        if (filter === "photos") return !isVideo;
        if (filter === "videos") return isVideo;
        return true;
      }),
    [items, filter],
  );

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-white/10 bg-black/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <Link href="/" className="shrink-0" aria-label="Song Teppanyaki home">
            <p className="text-xl font-black tracking-[0.25em]">SONG</p>
            <p className="text-[10px] tracking-[0.35em] text-amber-400">TEPPANYAKI</p>
          </Link>
          <Link
            href="/booking"
            className="rounded-full bg-amber-400 px-5 py-3 text-sm font-black text-black transition hover:bg-amber-300"
          >
            BOOK NOW
          </Link>
        </div>
      </header>

      <section className="px-5 pb-10 pt-16 text-center sm:pt-20">
        <p className="text-xs font-bold tracking-[0.35em] text-amber-400">PHOTO & VIDEO PORTFOLIO</p>
        <h1 className="mt-4 text-4xl font-black sm:text-5xl md:text-6xl">Song Teppanyaki Gallery</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
          Real events. Fresh food. Unforgettable experiences.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3" aria-label="Filter gallery">
          {([
            ["all", "All"],
            ["photos", "Photos"],
            ["videos", "Videos"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`rounded-full border px-6 py-2.5 text-sm font-bold transition ${
                filter === value
                  ? "border-amber-400 bg-amber-400 text-black"
                  : "border-white/20 bg-white/5 text-white hover:border-amber-400 hover:text-amber-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        {loading ? (
          <p className="py-16 text-center text-neutral-400">Loading photos and videos…</p>
        ) : error ? (
          <p className="py-16 text-center text-red-300">{error}</p>
        ) : filteredItems.length === 0 ? (
          <p className="py-16 text-center text-neutral-400">No items in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, index) => {
              const isVideo = item.type?.toLowerCase() === "video";
              return (
                <article
                  key={`${item.url}-${index}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-xl hover:shadow-black/30"
                >
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="relative block aspect-[4/3] w-full overflow-hidden bg-neutral-900 text-left"
                    aria-label={`${isVideo ? "Play video" : "View photo"}: ${item.title}`}
                  >
                    {isVideo ? (
                      <>
                        <video
                          src={item.url}
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/15">
                          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-2xl text-black shadow-lg">▶</span>
                        </span>
                        <span className="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs font-bold tracking-wider">VIDEO</span>
                      </>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.title || "Song Teppanyaki event"}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    )}
                  </button>
                  <div className="p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
                      {isVideo ? "Watch the Experience" : "Event Gallery"}
                    </p>
                    <h2 className="mt-2 text-lg font-black">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-neutral-400">{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-t border-white/10 bg-amber-400 px-5 py-14 text-center text-black">
        <p className="text-xs font-black tracking-[0.3em]">YOUR EVENT STARTS HERE</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black sm:text-4xl">
          Ready for Your Own Hibachi Experience?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7">
          Bring live teppanyaki cooking and entertainment to your home, backyard, or private event.
        </p>
        <Link
          href="/booking"
          className="mt-7 inline-block rounded-full bg-black px-8 py-4 font-black text-white transition hover:bg-neutral-800"
        >
          BOOK YOUR EVENT
        </Link>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={selected.title || "Gallery media"}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 px-4 py-2 text-2xl font-bold text-white hover:bg-white/20"
            aria-label="Close viewer"
          >
            ×
          </button>
          <div className="w-full max-w-6xl">
            {selected.type?.toLowerCase() === "video" ? (
              <video
                src={selected.url}
                controls
                autoPlay
                playsInline
                className="mx-auto max-h-[78vh] w-full rounded-xl object-contain"
              />
            ) : (
              <img
                src={selected.url}
                alt={selected.title || "Song Teppanyaki event"}
                className="mx-auto max-h-[78vh] w-full rounded-xl object-contain"
              />
            )}
            <h2 className="mt-4 text-center text-xl font-black">{selected.title}</h2>
            {selected.description && <p className="mt-2 text-center text-neutral-300">{selected.description}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
