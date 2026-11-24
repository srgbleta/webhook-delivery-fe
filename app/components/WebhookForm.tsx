"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const webhookFormSchema = z.object({
  eventName: z.string(),
  targetUrl: z.string(),
});

export function WebhookForm() {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof webhookFormSchema>>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      eventName: "",
      targetUrl: "",
    },
  });

  const { mutate, isPending: isCreating } = useMutation({
    mutationKey: ["create-webhook"],
    mutationFn: async ({
      eventName,
      targetUrl,
    }: {
      eventName: string;
      targetUrl: string;
    }): Promise<Webhook> => {
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventName, targetUrl }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error?.message ?? "Failed to create a webhook");
      }

      return body.data;
    },
    onSuccess: () => {
      toast.success("Webhook created");
      void queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(data: z.infer<typeof webhookFormSchema>) {
    mutate({
      eventName: data.eventName,
      targetUrl: data.targetUrl,
    });
  }

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle className="text-sm">New webhook</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="webhook-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="eventName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Event</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="Event name"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="targetUrl"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Target URL</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="Target URL"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button type="submit" form="webhook-form" size="lg">
              {isCreating ? "creating..." : "submit"}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}
