"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, tableFeatures, useTable } from "@tanstack/react-table";
import { cn } from "cn";
import { TestWebhookButton } from "./TestWebhookButton";

export function WebhooksList() {
  const { data, isPending } = useQuery({
    queryKey: ["webhooks"],
    queryFn: async (): Promise<WebhooksResponse> => {
      const response = await fetch("/api/webhooks");
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error?.message ?? "Failed to fetch webhooks");
      }

      return body;
    },
  });

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
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <TestWebhookButton webhook={row.original} />,
    },
  ];

  const table = useTable({
    key: "webhooks-table",
    features,
    columns,
    data: data?.data ?? [],
  });

  return (
    <div className="border-l border-l-gray-300">
      {isPending && <span className="text-xs">loading...</span>}

      {!isPending && !data && <span className="text-xs">no webhooks yet</span>}

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
  );
}
