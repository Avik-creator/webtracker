"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Activity } from "lucide-react";

interface VisitData {
  id?: number;
  analyticsId?: number;
  date: string;
  pageVisits: number;
  visitors: number;
}

interface PerformanceData {
  id?: number;
  analyticsId?: number;
  loadTime: number;
  domReady: number;
  networkLatency: number;
  processingTime: number;
  totalTime: number;
}

interface RouteAnalytics {
  id: string;
  route: string;
  pageVisits: number;
  visitors: number;
}

interface DeviceAnalytics {
  deviceType: string;
  visitors: number;
}

interface OsAnalytics {
  osName: string;
  visitors: number;
}

interface CountryAnalytics {
  countryCode: string;
  countryName: string;
  visitors: number;
}

interface Analytics {
  visitHistory: VisitData[];
  performanceAnalytics: PerformanceData[];
  routeAnalytics: RouteAnalytics[];
  deviceAnalytics: DeviceAnalytics[];
  osAnalytics: OsAnalytics[];
  countryAnalytics: CountryAnalytics[];
}

interface AnalyticsData {
  analytics: Analytics;
}

// Format date to readable format
const formatDate = (dateStr: string): { date: string; time: string } => {
  const date = new Date(dateStr);
  return {
    date: date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleDateString("en-US", { weekday: "short" }),
  };
};

// Format page load time
const formatLoadTime = (loadTime?: number): string => {
  if (!loadTime || loadTime <= 0) return "-";
  if (loadTime < 1000) return `${loadTime.toFixed(0)}ms`;
  return `${(loadTime / 1000).toFixed(2)}s`;
};

export default function RecentActivity({
  analyticsData,
}: {
  analyticsData: AnalyticsData | null;
}) {
  const visitHistory = analyticsData?.analytics?.visitHistory || [];
  const performanceData = analyticsData?.analytics?.performanceAnalytics || [];
  const routeData = analyticsData?.analytics?.routeAnalytics || [];

  // Get the top route for display
  const topRoute =
    routeData.length > 0
      ? routeData.sort((a, b) => b.pageVisits - a.pageVisits)[0].route
      : "/home";

  // Calculate average load time from performance data
  const avgLoadTime =
    performanceData.length > 0
      ? performanceData.reduce((acc, p) => acc + p.loadTime, 0) /
        performanceData.length
      : 0;

  // Sort visit history by date (most recent first) and take last 10
  const recentVisits = [...visitHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <Card className="shadow-md border border-zinc-800 overflow-hidden bg-zinc-900 dark:bg-zinc-900 h-full">
      <CardHeader className="pb-3 px-5 border-b border-zinc-800">
        <CardTitle className="text-base font-medium flex items-center text-zinc-100">
          <Activity className="h-4 w-4 mr-2 text-zinc-400" />
          Recent Activity
        </CardTitle>
        <CardDescription className="text-zinc-500 text-sm">
          Daily visitor statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {recentVisits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800">
                <tr className="text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-5 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Page Views
                  </th>
                  <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">
                    Visitors
                  </th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">
                    Top Page
                  </th>
                  <th className="text-right py-3 px-5 font-medium">
                    Avg. Load Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {recentVisits.map((visit, index) => {
                  const { date, time } = formatDate(visit.date);

                  return (
                    <tr
                      key={index}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-3 px-5">
                        <div className="text-zinc-200 font-medium">{date}</div>
                        <div className="text-zinc-500 text-xs">{time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-zinc-200 font-semibold">
                          {visit.pageVisits?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="text-zinc-300">
                          {visit.visitors?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="text-zinc-300 font-mono text-xs bg-zinc-800 px-2 py-1 rounded">
                          {topRoute}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span className="text-zinc-200 font-mono">
                          {formatLoadTime(avgLoadTime)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 flex items-center justify-center">
            <p className="text-zinc-500 text-center">
              <span className="block text-3xl mb-2">📊</span>
              No recent activity data available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
