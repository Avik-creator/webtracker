"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Globe } from "lucide-react";
import WorldMap from "@/components/dashboard/worldmap";

interface CountryAnalytics {
  countryCode: string;
  countryName: string;
  visitors: number;
}

interface Analytics {
  countryAnalytics: CountryAnalytics[];
}

interface AnalyticsData {
  analytics: Analytics;
}

export default function GlobalTrafficMap({
  analyticsData,
}: {
  analyticsData: AnalyticsData | null;
}) {
  const countryData = analyticsData?.analytics?.countryAnalytics || [];

  return (
    <Card className="border border-zinc-800 bg-zinc-900 shadow-none h-full overflow-hidden">
      <CardHeader className="pb-3 px-5 border-b border-zinc-800">
        <CardTitle className="text-base font-medium flex items-center text-zinc-100">
          <Globe className="h-4 w-4 mr-2 text-zinc-400" />
          Global Traffic Overview
        </CardTitle>
        <CardDescription className="text-zinc-500 text-sm">
          Track visitor distribution with an interactive world map
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-48 md:h-64 relative">
          <WorldMap countryData={countryData} isLoading={false} />
        </div>
      </CardContent>
    </Card>
  );
}
