import Image from "next/image";

export function TrailMark({ size = 64 }: { size?: number }) {
  return (
    <Image
      src="/brand/trail-mark.png"
      alt="PawnTrail"
      width={size}
      height={size}
      priority
      style={{ display: "block", width: size, height: size }}
    />
  );
}
