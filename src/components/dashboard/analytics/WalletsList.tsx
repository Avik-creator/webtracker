"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface SourceAnalytics {
  sourceName: string;
  visitors: number;
}

interface Analytics {
  sourceAnalytics: SourceAnalytics[];
}

interface AnalyticsData {
  analytics: Analytics;
}

// Source colors based on common referrers
const sourceColors: { [key: string]: string } = {
  google: "bg-blue-500",
  facebook: "bg-blue-600",
  twitter: "bg-sky-500",
  linkedin: "bg-blue-700",
  instagram: "bg-pink-500",
  youtube: "bg-red-500",
  github: "bg-zinc-600",
  reddit: "bg-orange-500",
  direct: "bg-emerald-500",
  Default: "bg-zinc-500",
};

const getSourceColor = (source: string): string => {
  const key = Object.keys(sourceColors).find((k) =>
    source.toLowerCase().includes(k.toLowerCase())
  );
  return key ? sourceColors[key] : sourceColors["Default"];
};

const formatSourceName = (source: string): string => {
  // Keep source names as they are from DB (lowercase)
  // Only capitalize "direct" for better readability
  if (source.toLowerCase() === "direct") return "Direct";
  return source;
};

export default function SourcesList({
  analyticsData,
}: {
  analyticsData: AnalyticsData | null;
}) {
  const sourceData = analyticsData?.analytics?.sourceAnalytics || [];

  // Sort by visitors (ensure numeric comparison) and get top 5
  const sortedSources = [...sourceData]
    .sort((a, b) => Number(b.visitors) - Number(a.visitors))
    .slice(0, 5);

  // Calculate total for percentages (ensure numeric values)
  const totalVisitors = sourceData.reduce(
    (sum, s) => sum + Number(s.visitors),
    0
  );

  // Calculate "Others" if there are more than 5 sources
  const othersVisitors = sourceData
    .sort((a, b) => Number(b.visitors) - Number(a.visitors))
    .slice(5)
    .reduce((sum, s) => sum + Number(s.visitors), 0);

  return (
    <Card className="border border-zinc-800 bg-zinc-900 shadow-none h-full">
      <CardHeader className="pb-3 px-5 border-b border-zinc-800">
        <CardTitle className="text-base font-medium flex items-center text-zinc-100">
          <ExternalLink className="h-4 w-4 mr-2 text-zinc-400" />
          Traffic Sources
        </CardTitle>
        <CardDescription className="text-zinc-500 text-sm">
          Where your visitors are coming from
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        {sortedSources.length > 0 ? (
          <div className="space-y-4">
            {sortedSources.map((source, index) => {
              const percentage =
                totalVisitors > 0
                  ? Math.round((Number(source.visitors) / totalVisitors) * 100)
                  : 0;
              const colorClass = getSourceColor(source.sourceName);

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                    <span className="text-zinc-200 text-sm font-medium">
                      {formatSourceName(source.sourceName)}
                    </span>
                  </div>
                  <span className="text-zinc-400 text-sm font-medium tabular-nums">
                    {percentage}%
                  </span>
                </div>
              );
            })}

            {othersVisitors > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-zinc-600" />
                  <span className="text-zinc-400 text-sm">Others</span>
                </div>
                <span className="text-zinc-500 text-sm font-medium tabular-nums">
                  {totalVisitors > 0
                    ? Math.round((othersVisitors / totalVisitors) * 100)
                    : 0}
                  %
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 flex items-center justify-center">
            <p className="text-zinc-500 text-center text-sm">
              No source data available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
