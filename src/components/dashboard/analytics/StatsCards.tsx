"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface VisitData {
  id?: number;
  analyticsId?: number;
  date: string;
  pageVisits: number;
  visitors: number;
}

interface PerformanceAnalytics {
  loadTime: number;
  date?: string;
}

interface PreviousPeriodData {
  totalPageVisits: number;
  totalVisitors: number;
  avgLoadTime: number;
}

interface Analytics {
  visitHistory: VisitData[];
  totalPageVisits?: number;
  totalVisitors?: number;
  avgLoadTime?: number;
  performanceAnalytics?: PerformanceAnalytics[];
  previousPeriod?: PreviousPeriodData;
}

interface AnalyticsData {
  analytics: Analytics;
}

// Sparkline component
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const width = 120;
  const height = 40;
  const padding = 4;

  const points = data
    .map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y =
        height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${
    width - padding
  },${height - padding}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#gradient-${color})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Calculate percentage change between two periods
const calculatePercentageChange = (
  current: number,
  previous: number
): { value: string; isPositive: boolean | null } => {
  if (previous === 0 && current === 0) {
    return { value: "0%", isPositive: null };
  }
  if (previous === 0) {
    return { value: "+100%", isPositive: true };
  }

  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change);

  if (rounded === 0) {
    return { value: "0%", isPositive: null };
  }

  return {
    value: `${rounded > 0 ? "+" : ""}${rounded}%`,
    isPositive: rounded > 0,
  };
};

export default function StatsCards({
  analyticsData,
}: {
  analyticsData: AnalyticsData | null;
}) {
  // Get current period totals (precomputed at DB level)
  const totalPageViews = analyticsData?.analytics?.totalPageVisits || 0;
  const totalVisitors = analyticsData?.analytics?.totalVisitors || 0;

  // Get average load time (precomputed at DB level, convert ms to seconds)
  const avgLoadTime = (analyticsData?.analytics?.avgLoadTime || 0) / 1000;

  // Get previous period data (precomputed at DB level)
  const previousPeriod = analyticsData?.analytics?.previousPeriod;
  const previousPageViews = previousPeriod?.totalPageVisits || 0;
  const previousVisitors = previousPeriod?.totalVisitors || 0;
  const previousAvgLoadTime = (previousPeriod?.avgLoadTime || 0) / 1000;

  // Get visit history for sparkline
  const visits = analyticsData?.analytics?.visitHistory || [];
  const sortedVisits = [...visits].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate percentage changes using precomputed data
  const pageViewsChange = calculatePercentageChange(
    totalPageViews,
    previousPageViews
  );
  const visitorsChange = calculatePercentageChange(
    totalVisitors,
    previousVisitors
  );

  // For load time, lower is better, so invert the positive/negative
  const rawLoadTimeChange = calculatePercentageChange(
    avgLoadTime,
    previousAvgLoadTime
  );
  const loadTimeChange = {
    value: rawLoadTimeChange.value,
    isPositive:
      rawLoadTimeChange.isPositive === null
        ? null
        : !rawLoadTimeChange.isPositive,
  };

  // Generate sparkline data from visit history
  const generateSparklineData = (): number[] => {
    if (sortedVisits.length < 2) return [0, 0, 0, 0, 0, 0, 0];
    return sortedVisits.slice(-7).map((v) => v.pageVisits || 0);
  };

  const generateVisitorSparklineData = (): number[] => {
    if (sortedVisits.length < 2) return [0, 0, 0, 0, 0, 0, 0];
    return sortedVisits.slice(-7).map((v) => v.visitors || 0);
  };

  const generateLoadTimeSparklineData = (): number[] => {
    const perfData = analyticsData?.analytics?.performanceAnalytics || [];
    if (perfData.length < 2) return [0, 0, 0, 0, 0, 0, 0];
    return perfData.slice(-7).map((p) => p.loadTime / 1000);
  };

  const pageViewsSparkline = generateSparklineData();
  const visitorsSparkline = generateVisitorSparklineData();
  const loadTimeSparkline = generateLoadTimeSparklineData();

  const stats = [
    {
      title: "Page Views",
      value: totalPageViews.toLocaleString(),
      change: pageViewsChange.value,
      isPositive: pageViewsChange.isPositive,
      sparklineData: pageViewsSparkline,
      color: pageViewsChange.isPositive === false ? "#ef4444" : "#22c55e",
    },
    {
      title: "Visitors",
      value: totalVisitors.toLocaleString(),
      change: visitorsChange.value,
      isPositive: visitorsChange.isPositive,
      sparklineData: visitorsSparkline,
      color: visitorsChange.isPositive === false ? "#ef4444" : "#22c55e",
    },
    {
      title: "Avg. Load Time",
      value: avgLoadTime > 0 ? `${avgLoadTime.toFixed(1)} s` : "N/A",
      change: loadTimeChange.value,
      isPositive: loadTimeChange.isPositive,
      sparklineData: loadTimeSparkline,
      color: loadTimeChange.isPositive === false ? "#ef4444" : "#22c55e",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="border border-zinc-800 bg-zinc-900 shadow-none overflow-hidden"
        >
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-zinc-500 text-sm font-medium">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-zinc-100 tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className="opacity-80">
                <Sparkline data={stat.sparklineData} color={stat.color} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
