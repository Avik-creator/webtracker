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
import Image from "next/image";
import { countryMap } from "@/lib/fullCountryMap";

interface CountryAnalytics {
  countryName: string;
  visitors: number;
}

interface Analytics {
  countryAnalytics: CountryAnalytics[];
}

interface AnalyticsData {
  analytics: Analytics;
}

// Helper function to get country codes for flags
const getCountryCode = (countryName: string): string => {
  return countryMap[countryName] || "un";
};

export default function TopCountriesList({
  analyticsData,
}: {
  analyticsData: AnalyticsData | null;
}) {
  const countryData = analyticsData?.analytics?.countryAnalytics || [];

  // Sort by visitors (ensure numeric comparison) and get top 5
  const sortedCountries = [...countryData]
    .sort((a, b) => Number(b.visitors) - Number(a.visitors))
    .slice(0, 5);

  // Calculate total for percentages (ensure numeric values)
  const totalVisitors = countryData.reduce(
    (sum, c) => sum + Number(c.visitors),
    0
  );

  // Calculate "Others" if there are more than 5 countries
  const othersVisitors = countryData
    .sort((a, b) => Number(b.visitors) - Number(a.visitors))
    .slice(5)
    .reduce((sum, c) => sum + Number(c.visitors), 0);

  return (
    <Card className="border border-zinc-800 bg-zinc-900 shadow-none h-full">
      <CardHeader className="pb-3 px-5 border-b border-zinc-800">
        <CardTitle className="text-base font-medium flex items-center text-zinc-100">
          <Globe className="h-4 w-4 mr-2 text-zinc-400" />
          Top Countries
        </CardTitle>
        <CardDescription className="text-zinc-500 text-sm">
          View where your visitors are coming from
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        {sortedCountries.length > 0 ? (
          <div className="space-y-4">
            {sortedCountries.map((country, index) => {
              const percentage =
                totalVisitors > 0
                  ? Math.round((Number(country.visitors) / totalVisitors) * 100)
                  : 0;
              const countryCode = getCountryCode(country.countryName);

              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={`https://hatscripts.github.io/circle-flags/flags/${countryCode}.svg`}
                      alt={country.countryName}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span className="text-zinc-200 text-sm font-medium">
                      {country.countryName}
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
                  <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center">
                    <span className="text-[10px] text-zinc-400">+</span>
                  </div>
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
              No country data available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
