import { auth } from "@/auth";
import AddNewSite from "@/components/dashboard/add-new-site";
import { WebsiteCard } from "@/components/dashboard/wesbite-card";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAllProjects } from "../actions/actions";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | WebTracker",
  },
  description:
    "A web analytics tool for tracking user behavior and performance - Dashboard",
};

export default async function Dashboard() {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  if (!session?.user?.id) {
    redirect("/");
  }

  const projects = await getAllProjects(session.user.id);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        {projects?.length === 0 ? (
          <div className="h-96 border border-dashed border-blue-500/20 rounded-md flex flex-col items-center justify-center gap-10">
            <h1 className="text-2xl font-bold text-blue-500 dark:text-blue-300">
              No websites added yet.
            </h1>

            <AddNewSite />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-blue-500 dark:text-blue-300">
                Your Websites
              </h1>
              <AddNewSite />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects?.map((website) => (
                <WebsiteCard
                  key={website.id}
                  website={{
                    id: website.id,
                    name: website.name,
                    domain: website.domain || "",
                    description: website.description || "",
                    icon: website.icon || "",
                    analytics: {
                      totalPageVisits: website?.analytics?.totalPageVisits || 0,
                      totalVisitors: website?.analytics?.totalVisitors || 0,
                    },
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
