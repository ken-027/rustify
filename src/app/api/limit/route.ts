import ratelimit from "@/middlewares/rate-limit.middleware";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";

  const limit = await ratelimit.getRemaining(ip);
  return Response.json(limit);
}
