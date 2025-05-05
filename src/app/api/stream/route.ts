import { NextRequest } from "next/server";
import ratelimit from "@/middlewares/rate-limit.middleware";
import AnthropicUtil from "@/utils/anthropic.util";

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

  await ratelimit.limit(ip);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
