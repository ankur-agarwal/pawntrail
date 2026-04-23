import { describe, expect, it } from "vitest";
import { compressImage } from "./compress";

describe("compressImage", () => {
  it("rejects non-image MIME types", async () => {
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    await expect(compressImage(file)).rejects.toThrow(/image|JPEG/i);
  });

  it("rejects unsupported image formats", async () => {
    const file = new File(["binary"], "x.bmp", { type: "image/bmp" });
    await expect(compressImage(file)).rejects.toThrow(/JPEG|PNG|WebP/i);
  });
});
