import * as z from "zod";

const triggerSchema = z.object({
  eventName: z.string().trim().min(1, "eventName is required"),
  data: z.json(),
});

function fail(status: number, code: string, message: string) {
  return Response.json(
    { success: false, error: { code, message } },
    { status },
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return fail(400, "INVALID_REQUEST", "Request body must be valid JSON.");
  }

  const result = triggerSchema.safeParse(body);

  if (!result.success) {
    return fail(
      400,
      "INVALID_REQUEST",
      "A non-empty event name and a JSON data payload are required.",
    );
  }

  const { eventName, data } = result.data;

  try {
    const res = await fetch(`${process.env.API_URL}/trigger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_name: eventName,
        data,
      }),
    });

    return Response.json(await res.json(), {
      status: res.status,
    });
  } catch (err) {
    console.error("Trigger request failed:", err);

    return fail(500, "INTERNAL_ERROR", "Unable to process the request.");
  }
}
