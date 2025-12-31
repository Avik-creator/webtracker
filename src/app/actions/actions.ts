"use server";

import { auth } from "@/auth";
import {
  getDomainAnalytics,
  getDomainProject,
  getProjects,
  TimePeriod,
} from "./db_calls";

import * as cheerio from "cheerio";

export const getAllProjects = async (id: string | undefined) => {
  if (!id) {
    return null;
  }
  try {
    const projects = await getProjects(id);
    return projects || [];
  } catch (error) {
    console.error("Error fetching all projects:", error);
    return [];
  }
};

export const getProjectByDomain = async (domain: string | null) => {
  if (!domain) {
    return null;
  }
  try {
    const res = await getDomainProject(domain);
    return res;
  } catch (error) {
    console.error(`Error fetching project for domain ${domain}:`, error);
    return null;
  }
};

export const getAnalytics = async (
  domain: string | null,
  period: TimePeriod = "7d"
) => {
  if (!domain) {
    return null;
  }
  const session = await auth();

  if (!session || !session.user) {
    return { status: 401, response: null, message: "Unauthorized" };
  }
  const userId = session?.user.id as string;

  try {
    const res = await getDomainAnalytics(domain, userId, period);
    if (res) {
      return { status: 200, response: res };
    } else {
      return { status: 403, response: null };
    }
  } catch (error) {
    console.error(`Error fetching analytics for domain ${domain}:`, error);
    return { status: 500, response: null };
  }
};

export interface LinkMetadata {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
  favicon: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}

export async function fetchLinkPreview(domain: string) {
  try {
    // Add protocol if missing
    const urlToFetch = `https://${domain}`;

    const response = await fetch(urlToFetch, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkPreviewBot/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract metadata
    const metadata: LinkMetadata = {
      url: urlToFetch,
      title:
        $("title").text() ||
        $('meta[property="og:title"]').attr("content") ||
        "",
      description:
        $('meta[name="description"]').attr("content") ||
        $('meta[property="og:description"]').attr("content") ||
        "",
      image: $('meta[property="og:image"]').attr("content") || "",
      siteName:
        $('meta[property="og:site_name"]').attr("content") ||
        new URL(urlToFetch).hostname,
      favicon:
        $('link[rel="icon"]').attr("href") ||
        $('link[rel="shortcut icon"]').attr("href") ||
        "/favicon.ico",
      ogType: $('meta[property="og:type"]').attr("content") || "website",
      twitterCard: $('meta[name="twitter:card"]').attr("content") || "summary",
      twitterTitle: $('meta[name="twitter:title"]').attr("content") || "",
      twitterDescription:
        $('meta[name="twitter:description"]').attr("content") || "",
      twitterImage: $('meta[name="twitter:image"]').attr("content") || "",
    };

    // Resolve relative URLs
    if (metadata.image && !metadata.image.startsWith("http")) {
      const baseUrl = new URL(urlToFetch).origin;
      metadata.image = new URL(metadata.image, baseUrl).toString();
    }

    if (metadata.favicon && !metadata.favicon.startsWith("http")) {
      const baseUrl = new URL(urlToFetch).origin;
      metadata.favicon = new URL(metadata.favicon, baseUrl).toString();
    }
    return metadata;
  } catch (error) {
    console.error("Error fetching link preview:", error);
    return {
      url: domain,
      title: "",
      description: "",
      image: "",
      siteName: domain,
      favicon: "/favicon.ico",
      ogType: "website",
      twitterCard: "summary",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
    };
  }
}
