import { NextResponse, NextRequest } from "next/server";
import ratelimit from "./middlewares/rate-limit.middleware";

export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";

  const { remaining } = await ratelimit.getRemaining(ip);

  console.log({ remaining });

  if (remaining <= 0) {
    return new Response(JSON.stringify({ remaining, limit: 100 }), {
      status: 429,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/stream/:path*",
};
