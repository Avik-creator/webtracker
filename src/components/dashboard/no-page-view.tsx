"use client";

import { useRouter } from "next/navigation";
import { Card } from "../ui/card";
import Snippet from "./snippet";
import { Button } from "../ui/button";

const NoPageViews = ({ domain }: { domain: string }) => {
  const router = useRouter();

  return (
    <Card className="flex-1 flex items-center justify-center bg-transparent border-none shadow-none">
      <div className="flex flex-col gap-4 items-center">
        <h1 className="text-2xl font-bold">Waiting for your first visit...</h1>
        <p className="text-sm/6 text-gray-600 mb-8 max-w-md text-center text-pretty">
          Once you have a visit, you will be able to see your website analytics
          here.
        </p>
      </div>
      <Snippet domain={domain} />

      <div className="mt-8 flex flex-col items-center space-x-2">
        <Button
          variant="ghost"
          className="flex gap-2 items-center"
          onClick={() => router.refresh()}
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </span>
          <span className="text-sm">
            Listening to incoming page views or click to refresh
          </span>
        </Button>
      </div>
    </Card>
  );
};

export default NoPageViews;
