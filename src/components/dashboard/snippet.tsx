"use client";

import { Copy, CopyCheck, CopyX, Globe } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";

interface SnippetProps {
  domain: string;
}

type SnippetType = "html" | "nextjs";

export default function Snippet({ domain }: SnippetProps) {
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const [activeTab, setActiveTab] = useState<SnippetType>("html");

  const snippets: Record<
    SnippetType,
    { code: string; header: string; language: string }
  > = {
    html: {
      code: `<script
  defer
  data-domain="${domain}"
  src="https://webtracker.avikmukherjee.tech/tracking-script.js"
>
</script>
`,
      header: "JavaScript/React.js",
      language: "html",
    },
    nextjs: {
      code: `import Script from "next/script";
// ...
<Script
  defer
  data-domain="${domain}"
  src="https://webtracker.avikmukherjee.tech/tracking-script.js"
/>`,
      header: "Next.js",
      language: "jsx",
    },
  };

  const copySnippet = (snippet: string) => {
    try {
      navigator.clipboard.writeText(snippet);
      toast("Copied to Clipboard");
      setCopyState("success");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast("Failed to copy to Clipboard");
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Tabs
        onValueChange={() => setCopyState("idle")}
        defaultValue="html"
        className="w-full rounded-xl overflow-hidden gap-0"
      >
        <div className="w-full flex items-center justify-between h-14  border rounded-t-xl bg-background pr-2">
          <TabsList className=" bg-transparent h-full rounded-none p-0">
            {Object.entries(snippets).map(([type, { header }]) => (
              <TabsTrigger
                key={type}
                value={type}
                onClick={() => setActiveTab(type as SnippetType)}
                className="w-fit relative data-[state=active]:shadow-none data-[state=active]:before:absolute data-[state=active]:before:inset-x-0 data-[state=active]:before:bottom-0 data-[state=active]:before:h-px data-[state=active]:before:bg-primary h-full border-0 data-[state=active]:bg-transparent!"
              >
                {header}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="ml-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => copySnippet(snippets[activeTab].code)}
            >
              <span className="sr-only">Copy</span>
              {copyState === "success" ? (
                <CopyCheck className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : copyState === "error" ? (
                <CopyX className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="min-h-48 dark:bg-sidebar bg-[rgb(40,44,52)] border border-t-0 border-black dark:border-border  rounded-b-xl">
          <TabsContent value={activeTab}>
            <SyntaxHighlighter
              language={snippets[activeTab].language}
              style={oneDark}
              customStyle={{
                margin: 0,
                padding: "1rem",
                fontSize: "0.875rem",
                lineHeight: "1.5",
                borderRadius: "0px",
              }}
              showLineNumbers
            >
              {snippets[activeTab].code}
            </SyntaxHighlighter>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
