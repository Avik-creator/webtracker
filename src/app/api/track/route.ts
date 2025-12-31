import { NextRequest, NextResponse } from "next/server";
import { deviceTypeEnum, performanceAnalytics } from "@/lib/schema";
import { UAParser } from "ua-parser-js";
import { db } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { countryNames, corsHeaders } from "@/lib/utils";
import {
  projects,
  analytics,
  visitData,
  routeAnalytics,
  countryAnalytics,
  deviceAnalytics,
  osAnalytics,
  sourceAnalytics,
} from "@/lib/schema";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

function getDeviceType(userAgent: string) {
  const parser = new UAParser();
  parser.setUA(userAgent);
  const result = parser.getDevice();

  if (result.type === "mobile") {
    return "MOBILE" as (typeof deviceTypeEnum.enumValues)[number];
  } else if (result.type === "tablet") {
    return "TABLET" as (typeof deviceTypeEnum.enumValues)[number];
  } else {
    // For desktop or any other device type, return DESKTOP
    return "DESKTOP" as (typeof deviceTypeEnum.enumValues)[number];
  }
}

function getOSInformation(userAgent: string) {
  const parser = new UAParser();
  parser.setUA(userAgent);
  const result = parser.getOS();
  return {
    name: result.name,
    version: result.version,
  };
}

function getCountryInfo(req: NextRequest): { code: string; name: string } {
  // For Cloudflare
  const cfCountry = req.headers.get("cf-ipcountry");

  // Vercel
  const vercelCountry = req.headers.get("x-vercel-ip-country");

  // Fastly
  const fastlyCountry = req.headers.get("Fastly-Geo-Country");

  // Akamai
  const akamaiCountry = req.headers
    .get("X-Akamai-Edgescape")
    ?.split(",")
    .find((item) => item.trim().startsWith("country_code="))
    ?.split("=")[1];

  // AWS CloudFront
  const cloudfrontCountry = req.headers.get("CloudFront-Viewer-Country");
  // For Render
  const renderCountry = req.headers.get("X-Render-Geo-Country");

  // If none of the above headers are present, use a default value
  const countryCode =
    cfCountry ||
    vercelCountry ||
    fastlyCountry ||
    akamaiCountry ||
    cloudfrontCountry ||
    renderCountry ||
    "XX";

  // Look up the country name from our mapping, or use a generic name if not found
  const countryName =
    countryNames[countryCode] ||
    (countryCode === "XX" ? "Unknown" : `Country (${countryCode})`);

  return { code: countryCode, name: countryName };
}

function isLocalhost(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === "localhost" ||
      urlObj.hostname === "127.0.0.1" ||
      urlObj.hostname.startsWith("192.168.") ||
      urlObj.hostname.startsWith("10.") ||
      urlObj.hostname.startsWith("172.16.") ||
      urlObj.hostname.startsWith("172.17.") ||
      urlObj.hostname.startsWith("172.18.") ||
      urlObj.hostname.startsWith("172.19.") ||
      urlObj.hostname.startsWith("172.2") ||
      urlObj.hostname.startsWith("172.30.") ||
      urlObj.hostname.startsWith("172.31.") ||
      urlObj.hostname.endsWith(".local") ||
      urlObj.hostname.endsWith(".internal")
    );
  } catch (e) {
    console.error("Error parsing URL:", e);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const {
      domain,
      url,
      event,
      source,
      user_agent,
      visitor_id,
      session_id,
      utm,
      referrer,
      path,
      data,
    } = payload;

    if (isLocalhost(url)) {
      return NextResponse.json(
        {
          error:
            "Analytics tracking is not available for localhost/development environments",
        },
        { headers: corsHeaders }
      );
    }

    if (!url.includes(domain)) {
      return NextResponse.json(
        {
          error:
            "The script points to a different domain than the current URL. Make sure they match.",
        },
        { headers: corsHeaders }
      );
    }

    // Check if project exists
    const [projectExist] = await db
      .select()
      .from(projects)
      .where(eq(projects.domain, domain))
      .limit(1);

    if (!projectExist) {
      return NextResponse.json(
        {
          error:
            "The project does not exist. Make sure you have created the project in your dashboard.",
        },
        { headers: corsHeaders }
      );
    }

    const projectId = projectExist.id;

    // Get country information
    const { code: countryCode, name: countryName } = getCountryInfo(req);
    const deviceType = user_agent ? getDeviceType(user_agent) : "DESKTOP";
    const osInfo = user_agent
      ? getOSInformation(user_agent)
      : { name: "Unknown" };
    const sourceName = source || utm?.medium || utm?.source || "direct";

    console.log("==== ANALYTICS EVENT ====");
    console.log("Event Type:", event);
    console.log("Project/Domain:", domain);
    console.log("URL:", url);
    console.log("Path:", path);
    console.log("Visitor ID:", visitor_id);
    console.log("Session ID:", session_id);
    console.log("Country:", `${countryName} (${countryCode})`);
    console.log("Device Type:", deviceType);
    console.log("OS:", osInfo.name);
    console.log("Source:", sourceName);
    console.log("Referrer:", referrer);
    console.log("UTM Parameters:", utm);
    console.log("User Agent:", user_agent);
    console.log("Data:", data);
    console.log("Full Payload:", JSON.stringify(payload, null, 2));
    console.log("========================");

    // Get or create analytics record
    const eventPageview = event === "pageview" ? 1 : 0;
    const eventSession = event === "session_start" ? 1 : 0;

    const [analyticsRecord] = await db
      .insert(analytics)
      .values({
        projectId,
        totalPageVisits: eventPageview,
        totalVisitors: eventSession,
      })
      .onConflictDoUpdate({
        // target the unique index on projectId
        target: analytics.projectId,
        set: {
          // increment the counters if they already exist
          totalPageVisits: sql`${analytics.totalPageVisits} + ${eventPageview}`,
          totalVisitors: sql`${analytics.totalVisitors}   + ${eventSession}`,
          updatedAt: new Date(),
        },
      })
      .returning(); // you'll get back the inserted or updated row

    const analyticsId = analyticsRecord.id;

    // Handle daily visit data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Upsert visitData
    await db
      .insert(visitData)
      .values({
        analyticsId,
        date: todayISO,
        pageVisits: event === "pageview" ? 1 : 0,
        visitors: event === "session_start" ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: [visitData.analyticsId, visitData.date],
        set: {
          pageVisits: sql`${visitData.pageVisits} + ${
            event === "pageview" ? 1 : 0
          }`,
          visitors: sql`${visitData.visitors} + ${
            event === "session_start" ? 1 : 0
          }`,
        },
      });

    // Handle route analytics
    if (path) {
      await db
        .insert(routeAnalytics)
        .values({
          analyticsId,
          route: path,
          pageVisits: event === "pageview" ? 1 : 0,
          visitors: event === "session_start" ? 1 : 0,
          date: todayISO,
        })
        .onConflictDoUpdate({
          target: [
            routeAnalytics.analyticsId,
            routeAnalytics.route,
            routeAnalytics.date,
          ],
          set: {
            pageVisits: sql`${routeAnalytics.pageVisits} + ${
              event === "pageview" ? 1 : 0
            }`,
            visitors: sql`${routeAnalytics.visitors} + ${
              event === "session_start" ? 1 : 0
            }`,
          },
        });
    }

    // Only track visitor demographics on session_start to avoid creating records with 0 visitors
    if (event === "session_start") {
      // Handle country analytics
      await db
        .insert(countryAnalytics)
        .values({
          analyticsId,
          countryCode,
          countryName,
          visitors: 1,
          date: todayISO,
        })
        .onConflictDoUpdate({
          target: [
            countryAnalytics.analyticsId,
            countryAnalytics.countryCode,
            countryAnalytics.date,
          ],
          set: {
            visitors: sql`${countryAnalytics.visitors} + 1`,
          },
        });

      // Handle device analytics
      await db
        .insert(deviceAnalytics)
        .values({
          analyticsId,
          deviceType,
          visitors: 1,
          date: todayISO,
        })
        .onConflictDoUpdate({
          target: [
            deviceAnalytics.analyticsId,
            deviceAnalytics.deviceType,
            deviceAnalytics.date,
          ],
          set: {
            visitors: sql`${deviceAnalytics.visitors} + 1`,
          },
        });

      // Handle OS analytics
      await db
        .insert(osAnalytics)
        .values({
          analyticsId,
          osName: osInfo.name ?? "Unknown",
          visitors: 1,
          date: todayISO,
        })
        .onConflictDoUpdate({
          target: [
            osAnalytics.analyticsId,
            osAnalytics.osName,
            osAnalytics.date,
          ],
          set: {
            visitors: sql`${osAnalytics.visitors} + 1`,
          },
        });

      // Handle source analytics
      await db
        .insert(sourceAnalytics)
        .values({
          analyticsId,
          sourceName,
          visitors: 1,
          date: todayISO,
        })
        .onConflictDoUpdate({
          target: [
            sourceAnalytics.analyticsId,
            sourceAnalytics.sourceName,
            sourceAnalytics.date,
          ],
          set: {
            visitors: sql`${sourceAnalytics.visitors} + 1`,
          },
        });
    }

    if (event === "performance" && data) {
      const {
        load_time,
        dom_ready,
        network_latency,
        processing_time,
        total_time,
      } = data;

      // Get today's date for the performance record
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Insert the performance metrics into the new table
      await db.insert(performanceAnalytics).values({
        analyticsId,
        loadTime: load_time,
        domReady: dom_ready,
        networkLatency: network_latency,
        processingTime: processing_time,
        totalTime: total_time,
        date: todayISO,
      });
    }

    return NextResponse.json(
      { success: true, event, received: true },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error processing analytics data:", error);
    return NextResponse.json(
      { error: "Failed to process analytics data", details: String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
}
