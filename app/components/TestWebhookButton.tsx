import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function TestWebhookButton({ webhook }: { webhook: Webhook }) {
  const { mutate, isPending } = useMutation({
    mutationKey: ["trigger", webhook.ID],
    mutationFn: async ({
      data,
      eventName,
    }: {
      eventName: string;
      data: unknown;
    }) => {
      const res = await fetch("/api/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName,
          data,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error?.message ?? "Failed to test webhook");
      }

      return body;
    },
    onSuccess: () => {
      toast.success("Test event submitted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Button
      disabled={isPending}
      onClick={() =>
        mutate({
          eventName: webhook.EventName,
          data: { message: "Test webhook" },
        })
      }
    >
      {isPending ? "Sending..." : "Test"}
    </Button>
  );
}
