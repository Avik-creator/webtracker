"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface WebsiteCardProps {
  website: {
    id: number;
    name: string;
    domain: string;
    icon: string;
    description: string;
    analytics?: {
      totalVisitors?: number;
      totalPageVisits?: number;
    };
  };
}

export function WebsiteCard({ website }: WebsiteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to the project page
    e.stopPropagation(); // Stop event propagation
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/project/${website.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the page to show updated list
        router.refresh();
      } else {
        const data = await response.json();
        alert(`Failed to delete project: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("An error occurred while deleting the project");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <Link href={`/dashboard/${website.domain}`}>
        <Card className="hover:ring ring-sky-100/30 group/main relative overflow-hidden border border-sky-700/20 bg-gradient-to-br from-sky-100 via-white to-sky-50 flex flex-col transition-all duration-300 dark:border-sky-900/40 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-200/20 via-sky-100/10 to-transparent opacity-0 transition-opacity duration-500 group-hover/main:opacity-100 dark:from-sky-900/20 dark:via-zinc-800/10 dark:to-transparent" />
          <div className="absolute -inset-px bg-gradient-to-br from-sky-200/30 via-sky-300/10 to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover/main:opacity-100 dark:from-sky-900/30 dark:via-zinc-900/10 dark:to-transparent" />
          <CardHeader className="flex items-center gap-2 z-10">
            <div className="size-10 rounded-md bg-sky-500/20 flex items-center justify-center">
              <Image
                src={website.icon}
                alt={website.name}
                width={32}
                height={32}
                className="size-8 object-cover"
              />
            </div>
            <div className="flex flex-col">
              <CardTitle className="">
                <span className="text-sky-800 dark:text-sky-200">
                  {website.name}
                </span>
              </CardTitle>
              <a
                href={`https://${website.domain}`}
                target="_blank"
                className="text-sm text-sky-600 dark:text-sky-300 group/link flex items-center gap-1 hover:underline"
              >
                <span>{website.domain}</span>
                <ExternalLink className="size-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300" />
              </a>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="ml-auto"
              onClick={handleDeleteClick}
            >
              <Trash2 className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex flex-col space-y-2">
              <p className="text-sm text-sky-600 dark:text-sky-300">
                {website.description || "No description provided"}
              </p>
              <p className="text-sm text-sky-600 dark:text-sky-300">
                <span className="font-semibold">
                  {website.analytics?.totalVisitors}
                </span>{" "}
                visitors
              </p>
            </div>

            <div className="absolute inset-0 -translate-x-full rotate-12 transform bg-gradient-to-r from-transparent via-sky-200/20 to-transparent opacity-0 transition-all duration-1000 group-hover/main:translate-x-full group-hover/main:opacity-100 dark:via-sky-900/20" />
          </CardContent>
        </Card>
      </Link>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{website.name}</span>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
