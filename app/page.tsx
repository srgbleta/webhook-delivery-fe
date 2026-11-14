"use client";

import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data, isPending } = useQuery({
    queryKey: ["webhooks"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }

      return await response.json();
    },
  });

  return (
    <div>
      <h2>Subscriptions</h2>

      {isPending && <span>loading...</span>}

      {!isPending && data && <span>{JSON.stringify(data)}</span>}

      {!isPending && !data && <span>no subscriptions yet</span>}
    </div>
  );
}
