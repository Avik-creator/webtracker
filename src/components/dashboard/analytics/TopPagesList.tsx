"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FileText } from "lucide-react";

interface RouteAnalytics {
  id: string;
  route: string;
  pageVisits: number;
  visitors: number;
}

interface Analytics {
  routeAnalytics: RouteAnalytics[];
}

interface AnalyticsData {
  analytics: Analytics;
}

export default function TopPagesList({
  analyticsData,
}: {
  analyticsData: AnalyticsData | null;
}) {
  const routeData = analyticsData?.analytics?.routeAnalytics || [];

  // Sort by page visits and get top 7
  const sortedRoutes = [...routeData]
    .sort((a, b) => b.pageVisits - a.pageVisits)
    .slice(0, 7);

  // Calculate total for percentages
  const totalVisits = routeData.reduce((sum, r) => sum + r.pageVisits, 0);

  // Calculate "Others" if there are more than 7 routes
  const othersVisits = routeData
    .sort((a, b) => b.pageVisits - a.pageVisits)
    .slice(7)
    .reduce((sum, r) => sum + r.pageVisits, 0);

  return (
    <Card className="border border-zinc-800 bg-zinc-900 shadow-none h-full">
      <CardHeader className="pb-3 px-5 border-b border-zinc-800">
        <CardTitle className="text-base font-medium flex items-center text-zinc-100">
          <FileText className="h-4 w-4 mr-2 text-zinc-400" />
          Top Pages
        </CardTitle>
        <CardDescription className="text-zinc-500 text-sm">
          See your most visited pages at a glance
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        {sortedRoutes.length > 0 ? (
          <div className="space-y-3">
            {sortedRoutes.map((route, index) => {
              const percentage =
                totalVisits > 0
                  ? Math.round((route.pageVisits / totalVisits) * 100)
                  : 0;

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-1 h-6 rounded-full bg-zinc-700" />
                    <span className="text-zinc-200 text-sm font-mono truncate">
                      {route.route}
                    </span>
                  </div>
                  <span className="text-zinc-400 text-sm font-medium tabular-nums ml-4">
                    {percentage}%
                  </span>
                </div>
              );
            })}

            {othersVisits > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 rounded-full bg-zinc-600" />
                  <span className="text-zinc-400 text-sm">Others</span>
                </div>
                <span className="text-zinc-500 text-sm font-medium tabular-nums">
                  {totalVisits > 0
                    ? Math.round((othersVisits / totalVisits) * 100)
                    : 0}
                  %
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 flex items-center justify-center">
            <p className="text-zinc-500 text-center text-sm">
              No page data available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
