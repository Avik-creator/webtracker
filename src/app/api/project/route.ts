import { auth } from "@/auth";
import { db } from "@/lib/db";
import { projects } from "@/lib/schema";
import { load } from "cheerio";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { Agent, fetch } from "undici";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          user: null,
          message: "Unauthorized",
          success: false,
        },
        { status: 403 }
      );
    }

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          user: null,
          message: "Unauthorized",
          success: false,
        },
        { status: 403 }
      );
    }
    const values = await req.json();

    if (!values.domain) {
      return NextResponse.json(
        { message: "Missing required fields", success: false },
        { status: 400 }
      );
    }

    const validDomain = values.domain.trim().toLowerCase();

    if (!validDomain.includes(".")) {
      return NextResponse.json(
        { message: "Invalid domain", success: false },
        { status: 400 }
      );
    }

    const domainMetadata = await getDomainMetadata(validDomain);

    const exisitingProject = await db.query.projects.findFirst({
      where: (projects, { eq }) => eq(projects.domain, validDomain),
    });

    if (exisitingProject) {
      return NextResponse.json(
        { message: "Domain already exists", success: false },
        { status: 400 }
      );
    }

    const newProject = await db.insert(projects).values({
      domain: values.domain,
      name: domainMetadata.title || values.domain,
      description: domainMetadata.description || "",
      icon: domainMetadata.iconLink || "",
      ownerId: session.user.id,
    });

    revalidatePath("/projects");
    revalidateTag("projects");

    return NextResponse.json(
      {
        newProject,
        message: "Project created successfully",
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error creating project", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

/**
 * Fetches and extracts metadata from a domain
 * @param domain - The domain to fetch metadata from (e.g., 'example.com')
 * @returns An object containing the title, description, and icon link
 */
interface DomainMetadata {
  title: string | null;
  description: string | null;
  iconLink: string | null;
}

async function getDomainMetadata(domain: string): Promise<DomainMetadata> {
  try {
    const url = domain.startsWith("http") ? domain : `https://${domain}`;

    // Create a custom agent that ignores SSL certificate errors
    const undiciAgent = new Agent({
      connect: {
        rejectUnauthorized: false,
      },
    });

    const response = await fetch(url, {
      dispatcher:
        process.env.NODE_ENV === "development" ? undiciAgent : undefined,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}. Status: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);

    const title =
      $("title").text() ||
      $('meta[property="og:title"]').attr("content") ||
      null;

    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      null;

    let iconLink =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      "/favicon.ico";

    if (iconLink && !iconLink.startsWith("http")) {
      const baseUrl = new URL(url);
      iconLink = iconLink.startsWith("/")
        ? `${baseUrl.protocol}//${baseUrl.host}${iconLink}`
        : `${baseUrl.protocol}//${baseUrl.host}/${iconLink}`;
    }

    console.log({ title, description, iconLink });

    return {
      title,
      description,
      iconLink,
    };
  } catch (error) {
    console.error(`Error fetching metadata for ${domain}:`, error);
    return {
      title: null,
      description: null,
      iconLink: null,
    };
  }
}
