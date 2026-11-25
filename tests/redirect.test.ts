import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("production host redirect", () => {
  it("sends only checkforme.vercel.app to the canonical host with a 308", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toEqual([
      {
        source: "/:path*",
        has: [{ type: "host", value: "checkforme.vercel.app" }],
        destination: "https://checkforme.org/:path*",
        permanent: true,
      },
    ]);
  });
});
