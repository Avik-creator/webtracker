"use server";

import { db } from "@/lib/db";
import {
  projects,
  visitData,
  routeAnalytics,
  countryAnalytics,
  deviceAnalytics,
  osAnalytics,
  sourceAnalytics,
  performanceAnalytics,
} from "@/lib/schema";
import { and, eq, gte, sql } from "drizzle-orm";

export type TimePeriod = "24h" | "7d" | "30d";

// Helper function to get cutoff date based on period
function getCutoffDate(period: TimePeriod): Date {
  const now = new Date();
  switch (period) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

export const getProjects = async (userId: string) => {
  const res = await db.query.projects.findMany({
    where: eq(projects.ownerId, userId),
    with: {
      analytics: true,
    },
  });
  return res;
};

export const getDomainProject = async (domain: string) => {
  const res = await db.query.projects.findFirst({
    where: eq(projects.domain, domain),
  });
  return res;
};

// Helper to get previous period cutoff date (for percentage comparison)
function getPreviousPeriodDates(period: TimePeriod): {
  start: string;
  end: string;
} {
  const now = new Date();
  let periodMs: number;

  switch (period) {
    case "24h":
      periodMs = 24 * 60 * 60 * 1000;
      break;
    case "7d":
      periodMs = 7 * 24 * 60 * 60 * 1000;
      break;
    case "30d":
      periodMs = 30 * 24 * 60 * 60 * 1000;
      break;
    default:
      periodMs = 7 * 24 * 60 * 60 * 1000;
  }

  const currentPeriodStart = new Date(now.getTime() - periodMs);
  const previousPeriodStart = new Date(currentPeriodStart.getTime() - periodMs);

  return {
    start: previousPeriodStart.toISOString().split("T")[0],
    end: currentPeriodStart.toISOString().split("T")[0],
  };
}

export const getDomainAnalytics = async (
  domain: string,
  userId: string,
  period: TimePeriod = "7d"
) => {
  const cutoffDate = getCutoffDate(period);
  const cutoffDateStr = cutoffDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD for date comparison
  const previousPeriod = getPreviousPeriodDates(period);

  // First, get the project with basic analytics info
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.domain, domain), eq(projects.ownerId, userId)),
    with: {
      analytics: true,
    },
  });

  if (!project?.analytics) {
    return null;
  }

  const analyticsId = project.analytics.id;

  // Get filtered visit history for current period
  const filteredVisitHistory = await db
    .select()
    .from(visitData)
    .where(
      and(
        eq(visitData.analyticsId, analyticsId),
        gte(visitData.date, cutoffDateStr)
      )
    );

  // Get previous period visit history for percentage comparison
  const previousVisitHistory = await db
    .select()
    .from(visitData)
    .where(
      and(
        eq(visitData.analyticsId, analyticsId),
        gte(visitData.date, previousPeriod.start),
        sql`${visitData.date} < ${previousPeriod.end}`
      )
    );

  // Get filtered route analytics and aggregate by route
  const rawRouteAnalytics = await db
    .select({
      id: sql<number>`MIN(${routeAnalytics.id})`.as("id"),
      analyticsId: routeAnalytics.analyticsId,
      route: routeAnalytics.route,
      visitors: sql<string>`COALESCE(SUM(${routeAnalytics.visitors}), 0)`.as(
        "visitors"
      ),
      pageVisits:
        sql<string>`COALESCE(SUM(${routeAnalytics.pageVisits}), 0)`.as(
          "pageVisits"
        ),
    })
    .from(routeAnalytics)
    .where(
      and(
        eq(routeAnalytics.analyticsId, analyticsId),
        gte(routeAnalytics.date, cutoffDateStr)
      )
    )
    .groupBy(routeAnalytics.analyticsId, routeAnalytics.route);

  // Convert string sums to numbers
  const filteredRouteAnalytics = rawRouteAnalytics.map((r) => ({
    ...r,
    visitors: parseInt(String(r.visitors), 10) || 0,
    pageVisits: parseInt(String(r.pageVisits), 10) || 0,
  }));

  // Get filtered country analytics and aggregate by country
  const rawCountryAnalytics = await db
    .select({
      id: sql<number>`MIN(${countryAnalytics.id})`.as("id"),
      analyticsId: countryAnalytics.analyticsId,
      countryCode: countryAnalytics.countryCode,
      countryName: sql<string>`MIN(${countryAnalytics.countryName})`.as(
        "countryName"
      ),
      visitors: sql<string>`COALESCE(SUM(${countryAnalytics.visitors}), 0)`.as(
        "visitors"
      ),
    })
    .from(countryAnalytics)
    .where(
      and(
        eq(countryAnalytics.analyticsId, analyticsId),
        gte(countryAnalytics.date, cutoffDateStr)
      )
    )
    .groupBy(countryAnalytics.analyticsId, countryAnalytics.countryCode);

  // Convert string sums to numbers
  const filteredCountryAnalytics = rawCountryAnalytics.map((c) => ({
    ...c,
    visitors: parseInt(String(c.visitors), 10) || 0,
  }));

  // Get filtered device analytics and aggregate by device type
  const rawDeviceAnalytics = await db
    .select({
      id: sql<number>`MIN(${deviceAnalytics.id})`.as("id"),
      analyticsId: deviceAnalytics.analyticsId,
      deviceType: deviceAnalytics.deviceType,
      visitors: sql<string>`COALESCE(SUM(${deviceAnalytics.visitors}), 0)`.as(
        "visitors"
      ),
    })
    .from(deviceAnalytics)
    .where(
      and(
        eq(deviceAnalytics.analyticsId, analyticsId),
        gte(deviceAnalytics.date, cutoffDateStr)
      )
    )
    .groupBy(deviceAnalytics.analyticsId, deviceAnalytics.deviceType);

  // Convert string sums to numbers
  const filteredDeviceAnalytics = rawDeviceAnalytics.map((d) => ({
    ...d,
    visitors: parseInt(String(d.visitors), 10) || 0,
  }));

  // Get filtered OS analytics and aggregate by OS
  const rawOsAnalytics = await db
    .select({
      id: sql<number>`MIN(${osAnalytics.id})`.as("id"),
      analyticsId: osAnalytics.analyticsId,
      osName: osAnalytics.osName,
      visitors: sql<string>`COALESCE(SUM(${osAnalytics.visitors}), 0)`.as(
        "visitors"
      ),
    })
    .from(osAnalytics)
    .where(
      and(
        eq(osAnalytics.analyticsId, analyticsId),
        gte(osAnalytics.date, cutoffDateStr)
      )
    )
    .groupBy(osAnalytics.analyticsId, osAnalytics.osName);

  // Convert string sums to numbers
  const filteredOsAnalytics = rawOsAnalytics.map((o) => ({
    ...o,
    visitors: parseInt(String(o.visitors), 10) || 0,
  }));

  // Get filtered source analytics and aggregate by source
  const rawSourceAnalytics = await db
    .select({
      id: sql<number>`MIN(${sourceAnalytics.id})`.as("id"),
      analyticsId: sourceAnalytics.analyticsId,
      sourceName: sourceAnalytics.sourceName,
      visitors: sql<string>`COALESCE(SUM(${sourceAnalytics.visitors}), 0)`.as(
        "visitors"
      ),
    })
    .from(sourceAnalytics)
    .where(
      and(
        eq(sourceAnalytics.analyticsId, analyticsId),
        gte(sourceAnalytics.date, cutoffDateStr)
      )
    )
    .groupBy(sourceAnalytics.analyticsId, sourceAnalytics.sourceName);

  // Convert string sums to numbers
  const filteredSourceAnalytics = rawSourceAnalytics.map((s) => ({
    ...s,
    visitors: parseInt(String(s.visitors), 10) || 0,
  }));

  // Get filtered performance analytics
  const filteredPerformanceAnalytics = await db
    .select()
    .from(performanceAnalytics)
    .where(
      and(
        eq(performanceAnalytics.analyticsId, analyticsId),
        gte(performanceAnalytics.date, cutoffDateStr)
      )
    );

  // Get previous period performance for comparison
  const previousPerformanceAnalytics = await db
    .select()
    .from(performanceAnalytics)
    .where(
      and(
        eq(performanceAnalytics.analyticsId, analyticsId),
        gte(performanceAnalytics.date, previousPeriod.start),
        sql`${performanceAnalytics.date} < ${previousPeriod.end}`
      )
    );

  // Calculate totals from filtered data (current period)
  const totals = filteredVisitHistory.reduce(
    (acc, visit) => ({
      totalPageVisits: acc.totalPageVisits + (visit.pageVisits || 0),
      totalVisitors: acc.totalVisitors + (visit.visitors || 0),
    }),
    { totalPageVisits: 0, totalVisitors: 0 }
  );

  // Calculate totals from previous period data
  const previousTotals = previousVisitHistory.reduce(
    (acc, visit) => ({
      totalPageVisits: acc.totalPageVisits + (visit.pageVisits || 0),
      totalVisitors: acc.totalVisitors + (visit.visitors || 0),
    }),
    { totalPageVisits: 0, totalVisitors: 0 }
  );

  // Calculate average load times
  const avgLoadTime =
    filteredPerformanceAnalytics.length > 0
      ? filteredPerformanceAnalytics.reduce((sum, p) => sum + p.loadTime, 0) /
        filteredPerformanceAnalytics.length
      : 0;

  const previousAvgLoadTime =
    previousPerformanceAnalytics.length > 0
      ? previousPerformanceAnalytics.reduce((sum, p) => sum + p.loadTime, 0) /
        previousPerformanceAnalytics.length
      : 0;

  // Return the project with all filtered analytics
  return {
    ...project,
    analytics: {
      ...project.analytics,
      visitHistory: filteredVisitHistory,
      routeAnalytics: filteredRouteAnalytics,
      countryAnalytics: filteredCountryAnalytics,
      deviceAnalytics: filteredDeviceAnalytics,
      osAnalytics: filteredOsAnalytics,
      sourceAnalytics: filteredSourceAnalytics,
      performanceAnalytics: filteredPerformanceAnalytics,
      totalPageVisits: totals.totalPageVisits,
      totalVisitors: totals.totalVisitors,
      // Previous period data for percentage comparison
      previousPeriod: {
        totalPageVisits: previousTotals.totalPageVisits,
        totalVisitors: previousTotals.totalVisitors,
        avgLoadTime: previousAvgLoadTime,
      },
      avgLoadTime: avgLoadTime,
    },
  };
};
