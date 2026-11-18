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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ColumnDef, tableFeatures, useTable } from "@tanstack/react-table";
import { cn } from "cn";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

type Webhook = {
  ID: number;
  EventName: string;
  TargetUrl: string;
  Status: string; // "active", "paused", "disabled"
};

type APIResponse<T = unknown> = {
  success: boolean;
  data: T;
};

type WebhooksResponse = APIResponse<Webhook[]>;

const webhookFormSchema = z.object({
  eventName: z.string(),
  targetUrl: z.string(),
});

export default function Home() {
  const form = useForm<z.infer<typeof webhookFormSchema>>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      eventName: "",
      targetUrl: "",
    },
  });

  const { data, isPending } = useQuery({
    queryKey: ["webhooks"],
    queryFn: async (): Promise<WebhooksResponse> => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/webhooks`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch webhooks");
      }

      return await response.json();
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/webhooks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_name: eventName,
            target_url: targetUrl,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create a webhook");
      }

      return await response.json();
    },
  });

  function onSubmit(data: z.infer<typeof webhookFormSchema>) {
    mutate({
      eventName: data.eventName,
      targetUrl: data.targetUrl,
    });
  }

  const features = tableFeatures({});

  const columns: Array<ColumnDef<typeof features, Webhook>> = [
    {
      accessorKey: "ID",
      header: "ID",
      cell: (info) => (
        <span className="text-xs">{info.getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "EventName",
      header: "Event",
      cell: (info) => (
        <span className="text-xs">{info.getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "TargetUrl",
      header: "Target URL",
      cell: (info) => (
        <span className="text-xs">{info.getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "Status",
      header: "Status",
      cell: (info) => (
        <div className="flex items-baseline gap-1">
          <div
            className={cn(
              "rounded-full h-2 w-2",
              info.getValue() == "active" && "bg-green-400",
              info.getValue() == "disabled" && "bg-red-400",
              info.getValue() == "paused" && "bg-yellow-400",
            )}
          />
          <span className="text-xs">{info.getValue<string>()}</span>
        </div>
      ),
    },
  ];

  const table = useTable({
    key: "webhooks-table",
    features,
    columns,
    data: data ? data.data : [],
  });

  return (
    <div className="grid min-h-screen grid-cols-1 gap-6 md:grid-cols-2">
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

      <div className="border-l border-l-gray-300">
        {isPending && <span className="text-xs">loading...</span>}

        {!isPending && !data && (
          <span className="text-xs">no webhooks yet</span>
        )}

        {!isPending && data && (
          <Table>
            <TableCaption>A list of set webhooks</TableCaption>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
