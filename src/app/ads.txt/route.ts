import { adsenseClient, adsTxtBody } from "@/lib/ads";

export function GET() {
  const body = adsTxtBody(adsenseClient());
  if (!body) {
    return new Response("Not found\n", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
