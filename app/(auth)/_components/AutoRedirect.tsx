"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoRedirect({
  to,
  delayMs = 1600,
}: {
  to: string;
  delayMs?: number;
}) {
  const router = useRouter();
  useEffect(() => {
    const id = window.setTimeout(() => router.push(to), delayMs);
    return () => window.clearTimeout(id);
  }, [router, to, delayMs]);
  return null;
}
