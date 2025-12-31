"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BarChart as BarChartIcon } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface VisitData {
  id?: number;
  analyticsId?: number;
  date: string;
  pageVisits: number;
  visitors: number;
}

interface Analytics {
  visitHistory: VisitData[];
}

interface AnalyticsData {
  analytics: Analytics;
}

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { date: string } }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const date = new Date(payload[0].payload.date);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-xl">
        <p className="text-zinc-400 text-xs mb-1">{formattedDate}</p>
        <p className="text-zinc-100 font-semibold text-sm">
          {payload[0].value.toLocaleString()} page views
        </p>
      </div>
    );
  }
  return null;
};

export default function PageViewsChart({
  analyticsData,
}: {
  analyticsData: AnalyticsData | null;
}) {
  const visits = analyticsData?.analytics?.visitHistory || [];

  // Use visit history data directly (it's already daily aggregated)
  const generateChartData = (): {
    date: string;
    value: number;
    displayDate: string;
  }[] => {
    if (visits.length === 0) return [];

    // Sort by date and take last 14 days
    const sortedVisits = [...visits]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14);

    return sortedVisits.map((visit) => {
      const date = new Date(visit.date);
      return {
        date: visit.date,
        value: visit.pageVisits || 0,
        displayDate: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };
    });
  };

  const chartData = generateChartData();

  return (
    <Card className="border border-zinc-800 bg-zinc-900 shadow-none h-full">
      <CardHeader className="pb-3 px-5 border-b border-zinc-800">
        <CardTitle className="text-base font-medium flex items-center text-zinc-100">
          <BarChartIcon className="h-4 w-4 mr-2 text-zinc-400" />
          Page Views
        </CardTitle>
        <CardDescription className="text-zinc-500 text-sm">
          Total number of times your pages have been accessed
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <div className="h-48 w-full">
          {chartData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis
                  dataKey="displayDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  dy={10}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  tickFormatter={(value) =>
                    value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
                  }
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#3f3f46", strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#ffffff",
                    stroke: "#18181b",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-zinc-500 text-sm">
                No page view data available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
