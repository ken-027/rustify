import { NextRequest } from "next/server";
import ratelimit from "@/middlewares/rate-limit.middleware";
import AnthropicUtil from "@/utils/anthropic.util";
import { waitUntil } from "@vercel/functions";
import { RATE_LIMIT } from "@/config/index.config";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";

  const body = await req.json();

  if (!body?.code || body?.code?.trim() === "") {
    return Response.json(
      {
        error: "code is required",
      },
      { status: 400 }
    );
  }

  const { remaining } = await ratelimit.getRemaining(ip);

  if (remaining <= 0) {
    return new Response(JSON.stringify({ remaining, limit: RATE_LIMIT }), {
      status: 429,
    });
  }

  const { code: user_prompt } = body;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const msgStream = await AnthropicUtil.stream(user_prompt);

      msgStream.on("text", (text) => {
        console.log({ text });
        controller.enqueue(encoder.encode(text));
      });

      msgStream.on("end", () => {
        controller.close();
      });
    },
  });

  const { pending } = await ratelimit.limit(ip);
  waitUntil(pending);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
