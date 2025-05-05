import { RATE_LIMIT } from "@/config/index.config";
import ratelimit from "@/middlewares/rate-limit.middleware";
import authenticate from "@/utils/authenticate-ratelimiter.util";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body?.ip_address || body?.ip_address?.trim() === "") {
    return Response.json(
      {
        error: "ip_address is required",
      },
      { status: 400 }
    );
  }

  if (!body?.username || body?.username?.trim() === "") {
    return Response.json(
      {
        error: "username is required",
      },
      { status: 400 }
    );
  }

  if (!body?.password || body?.password?.trim() === "") {
    return Response.json(
      {
        error: "password is required",
      },
      { status: 400 }
    );
  }

  const { username, password } = body;

  if (!authenticate(username, password)) {
    return Response.json(
      {
        error: "Invalid credentials",
      },
      { status: 401 }
    );
  }

  const ip = body.ip_address;

  const { remaining } = await ratelimit.getRemaining(ip);

  if (remaining === RATE_LIMIT) {
    return Response.json(
      {
        error: "Rate limit is already reset",
      },
      { status: 400 }
    );
  }

  await ratelimit.resetUsedTokens(ip);

  return Response.json({
    message: "Rate limit reset successfully",
  });
}
