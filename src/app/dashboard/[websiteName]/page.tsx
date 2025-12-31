import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

import { getAnalytics } from "@/app/actions/actions";
import StatsCards from "@/components/dashboard/analytics/StatsCards";
import PageViewsChart from "@/components/dashboard/analytics/PageViewsChart";
import GlobalTrafficMap from "@/components/dashboard/analytics/GlobalTrafficMap";
import TopCountriesList from "@/components/dashboard/analytics/TopCountriesList";
import DevicesList from "@/components/dashboard/analytics/BrowsersList";
import SourcesList from "@/components/dashboard/analytics/WalletsList";
import TopPagesList from "@/components/dashboard/analytics/TopPagesList";
import RecentActivity from "@/components/dashboard/analytics/RecentActivity";
import Snippet from "@/components/dashboard/snippet";
import AnalyticsSummaryDownload from "@/components/dashboard/analytics/analytics-download";
import TimeFilter from "@/components/dashboard/analytics/TimeFilter";
import type { TimePeriod } from "@/app/actions/db_calls";

import { AnalyticsData } from "@/lib/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | WebTracker",
  },
  description:
    "A web analytics tool for tracking user behavior and performance - Dashboard",
};

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ websiteName: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const data = await params;
  const search = await searchParams;
  const period = (search.period as TimePeriod) || "7d";

  // Fetch data server-side with period filter applied at DB level
  const analyticsResponse = await getAnalytics(data.websiteName, period);
  const analyticsData = analyticsResponse?.response as AnalyticsData | null;
  const responseStatus = analyticsResponse?.status;

  // Check if data exists
  const hasNoData =
    !analyticsData?.analytics ||
    (!analyticsData.analytics.countryAnalytics?.length &&
      !analyticsData.analytics.deviceAnalytics?.length &&
      !analyticsData.analytics.osAnalytics?.length &&
      !analyticsData.analytics.sourceAnalytics?.length &&
      !analyticsData.analytics.routeAnalytics?.length);

  if (responseStatus === 403) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-zinc-950">
        <div className="bg-zinc-900 rounded-2xl shadow-xl p-10 max-w-md w-full border border-zinc-800">
          <div className="flex justify-center mb-6">
            <div className="bg-red-900/30 p-4 rounded-full">
              <AlertTriangle className="h-14 w-14 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-3 tracking-tight text-center">
            Access Denied
          </h2>
          <p className="text-zinc-400 mb-8 leading-relaxed text-center">
            You don&apos;t have permission to view analytics for{" "}
            <span className="font-semibold text-zinc-200">
              {data.websiteName}
            </span>
            .
          </p>
          <Link href="/dashboard" className="block">
            <Button className="bg-zinc-100 text-zinc-900 hover:bg-white w-full py-6 rounded-xl shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Your Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-zinc-100">
              {data.websiteName}
            </h1>
          </div>
        </div>

        {hasNoData ? (
          <div className="bg-transparent p-5 mb-6 mx-auto">
            <Snippet
              domain={data.websiteName}
              title="Could Not find any Analytics Data"
              description="Add this script to your website to start tracking visitor data."
            />
          </div>
        ) : (
          <>
            {/* Filter and Download Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <Suspense
                fallback={
                  <div className="h-9 w-64 bg-zinc-800 rounded-lg animate-pulse" />
                }
              >
                <TimeFilter />
              </Suspense>
              <AnalyticsSummaryDownload
                analyticsData={analyticsData}
                domain={data.websiteName}
              />
            </div>

            {/* Stats Cards Row */}
            <StatsCards analyticsData={analyticsData} />

            {/* Page Views & Global Traffic Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <PageViewsChart analyticsData={analyticsData} />
              <GlobalTrafficMap analyticsData={analyticsData} />
            </div>

            {/* Top Countries, Devices, Sources Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <TopCountriesList analyticsData={analyticsData} />
              <DevicesList analyticsData={analyticsData} />
              <SourcesList analyticsData={analyticsData} />
            </div>

            {/* Top Pages & Recent Activity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <TopPagesList analyticsData={analyticsData} />
              <div className="lg:col-span-2">
                <RecentActivity analyticsData={analyticsData} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
