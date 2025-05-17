import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, AlertTriangle } from "lucide-react";
import Link from "next/link";

import { getAnalytics } from "@/app/actions/actions";
import DashboardCards from "@/components/dashboard/analytics/dashboardCard";
import TrafficSourcesChart from "@/components/dashboard/analytics/trafficSources";
import DeviceDistributionChart from "@/components/dashboard/analytics/deviceDistribution";
import TopPagesChart from "@/components/dashboard/analytics/topPages";
import PerformanceMetricsCard from "@/components/dashboard/analytics/Performance";
import CountryDistribution from "@/components/dashboard/analytics/countryDistribution";
import OperatingSystemsChart from "@/components/dashboard/analytics/osDistribution";

import { AnalyticsData } from "@/lib/types";
import { Metadata } from "next";
import { fetchLinkPreview } from "@/app/actions/actions";
import WebsitePreview from "@/components/dashboard/analytics/websitePreview";
import NoPageViews from "@/components/dashboard/no-page-view";

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
}: {
  params: Promise<{ websiteName: string }>;
}) {
  const data = await params;

  // Fetch data server-side
  const analyticsResponse = await getAnalytics(data.websiteName);
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

  const websiteMetadata = await fetchLinkPreview(data.websiteName);

  if (responseStatus === 403) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 dark:bg-zinc-950">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-10 max-w-md w-full border border-gray-100 transform transition-all dark:from-zinc-900 dark:to-zinc-800 dark:border-zinc-800">
          <div className="flex justify-center mb-6">
            <div className="bg-red-50 p-4 rounded-full dark:bg-red-900">
              <AlertTriangle className="h-14 w-14 text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight dark:text-blue-200">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed dark:text-blue-200">
            You don&apos;t have permission to view analytics for{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {data.websiteName}
            </span>
            .
          </p>
          <Link href="/dashboard" className="block">
            <Button className="bg-blue-600 text-white hover:bg-blue-700 w-full py-6 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2 dark:bg-blue-700 dark:hover:bg-blue-600">
              <ArrowLeft className="h-4 w-4" />
              Return to Your Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-2 sm:p-6 overflow-hidden mb-3 dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <Link href="/dashboard">
            <Button variant="default">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-blue-200  overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:bg-zinc-900 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-2 flex items-center dark:text-blue-200">
            <Globe className="h-7 w-7 mr-3 text-blue-500 dark:text-blue-300" />
            Analytics for {data.websiteName}
          </h1>
          <p className="text-gray-600 dark:text-blue-200">
            View detailed analytics and insights for your website
          </p>
        </div> */}

        {hasNoData ? (
          <NoPageViews domain={data.websiteName} />
        ) : (
          <>
          <div className="flex flex-row-reverse mb-6">
          <AnalyticsSummaryDownload
            analyticsData={analyticsData}
            domain={data.websiteName}
          />
          </div>
            {/* Dashboard components */}
            <DashboardCards analyticsData={analyticsData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <TrafficSourcesChart analyticsData={analyticsData} />
              <DeviceDistributionChart analyticsData={analyticsData} />
            </div>

            <TopPagesChart analyticsData={analyticsData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <PerformanceMetricsCard analyticsData={analyticsData} />
              <OperatingSystemsChart analyticsData={analyticsData} />
              <WebsitePreview
                metadata={websiteMetadata}
                domain={data.websiteName}
              />
            </div>

            <div className="mb-6">
              <CountryDistribution analyticsData={analyticsData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
