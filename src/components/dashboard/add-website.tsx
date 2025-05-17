"use client";
import { useState, useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import Snippet from "./snippet";
import { useCreateNewSite } from "@/store";
import { Label } from "@/components/ui/label";

export default function AddWebsite() {
  const [website, setWebsite] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [error, setError] = useState("");
  const { onClose } = useCreateNewSite();

  const id = useId();

  const addWebsite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (website.trim() === "" || loading) return;
    setLoading(true);

    try {
      const response = await fetch("/api/project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: website.trim(),
          name: name.trim() || website.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add website");
      }

      if (data.success) {
        toast.success(data.message || "Website added successfully");
        router.push(`/dashboard/${website.trim()}`);
        onClose();
      } else {
        toast.error(data.message || "Failed to add website");
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to add website");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const invalidChars = ["http", "://", "/", "https"];
    const hasInvalidChars = invalidChars.some((char) =>
      website.trim().includes(char)
    );
    if (hasInvalidChars) {
      setError("Please enter the domain only (e.g., google.com).");
    } else {
      setError("");
    }
  }, [website]);

  return (
    <Card className="text-white border-0 shadow-none bg-transparent overflow-hidden dark:bg-zinc-900 dark:text-neutral-200">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-blue-500 dark:text-blue-300">
          Add Website
        </CardTitle>
        <CardDescription className="text-blue-500 dark:text-blue-300">
          Add your website to start tracking analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <form onSubmit={addWebsite}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-500 dark:text-blue-300">
                  Domain
                </label>
                <div className="*:not-first:mt-2 flex ">
                  <Label htmlFor={id} className="bg-blue-500 hidden">
                    Input with start add-on
                  </Label>
                  <div className="flex rounded-md shadow-xs">
                    <span className="border-input border-r-0 bg-background dark:bg-zinc-800 text-muted-foreground  inline-flex items-center rounded-s-md border px-3 text-sm">
                      https://
                    </span>
                  </div>
                  <Input
                    value={website}
                    onChange={(e) =>
                      setWebsite(e.target.value.trim().toLowerCase())
                    }
                    id={id}
                    placeholder="example.com"
                    type="text"
                    className={`bg-white -ms-px rounded-s-none  ${
                      error ? "border-red-500 dark:border-red-400" : ""
                    }`}
                  />
                </div>
                {error ? (
                  <p className="text-sm text-red-400 dark:text-red-300">
                    {error}
                  </p>
                ) : (
                  <p className="text-sm text-blue-500 dark:text-blue-300">
                    Enter the domain or subdomain without &quot;www&quot;
                  </p>
                )}
              </div>

              {/* <div className="space-y-2">
              <label className="text-sm font-medium text-blue-500 dark:text-blue-300">
                Website Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Website"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-500 dark:text-blue-300">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your website"
              />
            </div> */}

              {!error && (
                <Button
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-white"
                  disabled={loading || !website.trim()}
                >
                  {loading ? "Adding Website..." : "Add Website"}
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            <Snippet domain={website.trim()} />
            <Button
              onClick={() => router.push(`/dashboard/${website.trim()}`)}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-white"
            >
              View Analytics
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
