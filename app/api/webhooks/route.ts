import * as z from "zod";

const createWebhookSchema = z.object({
  eventName: z.string().trim().min(1),
  targetUrl: z.url({ protocol: /^https?$/ }),
});

function fail(status: number, code: string, message: string) {
  return Response.json(
    { success: false, error: { code, message } },
    { status },
  );
}

export async function GET() {
  try {
    const res = await fetch(`${process.env.API_URL}/webhooks`, {
      cache: "no-store",
    });

    return Response.json(await res.json(), {
      status: res.status,
    });
  } catch (err) {
    console.error("Fetch webhooks failed:", err);

    return fail(500, "INTERNAL_ERROR", "Unable to fetch webhooks.");
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return fail(400, "INVALID_REQUEST", "Request body must be valid JSON.");
  }

  const result = createWebhookSchema.safeParse(body);

  if (!result.success) {
    return fail(
      400,
      "INVALID_REQUEST",
      "A non-empty event name and a valid HTTP or HTTPS target URL are required.",
    );
  }

  const { eventName, targetUrl } = result.data;

  try {
    const res = await fetch(`${process.env.API_URL}/webhooks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_name: eventName,
        target_url: targetUrl,
      }),
    });

    return Response.json(await res.json(), {
      status: res.status,
    });
  } catch (err) {
    console.error("Create webhook failed:", err);

    return fail(500, "INTERNAL_ERROR", "Unable to create webhook.");
  }
}
