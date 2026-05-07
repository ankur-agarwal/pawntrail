"use client";

import Image from "next/image";
import { useState } from "react";
import { Micro } from "./primitives";

export interface ScoresheetThumbProps {
  url: string | null;
}

export function ScoresheetThumb({ url }: ScoresheetThumbProps) {
  const [zoomed, setZoomed] = useState(false);
  if (!url) return null;
  return (
    <>
      <div
        style={{
          width: "100%",
          background: "#fbf7e8",
          border: "0.5px solid var(--pt-border-strong)",
          borderRadius: "var(--pt-r-card)",
          padding: 10,
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0 22px, rgba(20,32,26,0.06) 22px 22.5px)",
        }}
      >
        <Micro
          style={{
            marginBottom: 6,
            color: "rgba(42,36,24,0.55)",
            display: "block",
          }}
        >
          Scoresheet · Original
        </Micro>
        <button
          type="button"
          onClick={() => setZoomed(true)}
          style={{
            padding: 0,
            width: "100%",
            aspectRatio: "4 / 5",
            background: "transparent",
            border: "0.5px solid var(--pt-border)",
            borderRadius: 4,
            overflow: "hidden",
            cursor: "zoom-in",
            display: "block",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Original scoresheet"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </button>
      </div>
      {zoomed && (
        <ZoomedSheet url={url} onClose={() => setZoomed(false)} />
      )}
    </>
  );
}

function ZoomedSheet({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20, 32, 26, 0.85)",
        display: "grid",
        placeItems: "center",
        padding: 24,
        zIndex: 50,
        cursor: "zoom-out",
      }}
    >
      <Image
        src={url}
        alt="Original scoresheet (zoomed)"
        width={1600}
        height={2000}
        unoptimized
        style={{
          maxWidth: "95vw",
          maxHeight: "95vh",
          width: "auto",
          height: "auto",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
