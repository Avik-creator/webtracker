"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export type TimePeriod = "24h" | "7d" | "30d";

const timeOptions: { value: TimePeriod; label: string }[] = [
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
];

export default function TimeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = (searchParams.get("period") as TimePeriod) || "7d";

  const handlePeriodChange = (period: TimePeriod) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-zinc-500" />
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
        {timeOptions.map((option) => (
          <Button
            key={option.value}
            variant="ghost"
            size="sm"
            onClick={() => handlePeriodChange(option.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              currentPeriod === option.value
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
