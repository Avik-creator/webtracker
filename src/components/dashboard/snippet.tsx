"use client"

import { Copy, CopyCheck, CopyX, Globe } from "lucide-react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useState } from "react"

interface SnippetProps {
  domain: string
  title: string
  description: string
}

export default function Snippet({ domain, title, description }: SnippetProps) {
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">("idle")

  const react_snippet = `<script
  defer
  data-domain="${domain}"
  src="https://webtracker.avikmukherjee.com/tracking-script.js"
>
</script>`

  const next_snippet = `import Script from "next/script";
// ...
<Script
  defer
  data-domain="${domain}"
  src="https://webtracker.avikmukherjee.com/tracking-script.js"
/>`

  const copySnippet = (snippet: string) => {
    try {
      navigator.clipboard.writeText(snippet)
      toast("Copied to Clipboard")
      setCopyState("success")
      setTimeout(() => setCopyState("idle"), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
      toast("Failed to copy to Clipboard")
      setCopyState("error")
      setTimeout(() => setCopyState("idle"), 2000)
    }
  }

  return (
    <Card className="w-full shadow-md dark:bg-zinc-900 border border-sky-100/50 dark:border-sky-800/50">
      <CardContent className="pt-6 p-4 sm:p-6">
        <div className="flex flex-col gap-2 mb-5 pb-2 border-b border-sky-100/50 dark:border-sky-800/50">
          <div className="flex items-center gap-2">
            <div className="bg-sky-50 p-2 rounded-full dark:bg-sky-900">
              <Globe className="h-5 w-5 text-sky-500 dark:text-sky-300" />
            </div>
            <h1 className="text-lg font-semibold text-sky-700 dark:text-sky-200">{title}</h1>
          </div>
          <p className="text-xs sm:text-sm text-sky-500 sm:ml-2 dark:text-sky-300">{description}</p>
        </div>
        <Tabs onValueChange={() => setCopyState("idle")} defaultValue="JavaScript/React.js" className="w-full">
          <TabsList className="w-full bg-sky-50 rounded-lg dark:bg-sky-900 border border-sky-100/50 dark:border-sky-800/50">
            <TabsTrigger
              value="JavaScript/React.js"
              className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-sky-600 dark:data-[state=active]:bg-sky-700 dark:data-[state=active]:text-sky-100 dark:text-sky-300"
            >
              JavaScript / React.js
            </TabsTrigger>
            <TabsTrigger
              value="Next.js"
              className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-sky-600 dark:data-[state=active]:bg-sky-700 dark:data-[state=active]:text-sky-100 dark:text-sky-300"
            >
              Next.js
            </TabsTrigger>
          </TabsList>

          <TabsContent value="JavaScript/React.js" className="mt-5">
            <div className="rounded-lg bg-white border border-sky-100/50 shadow-sm p-3 sm:p-4 overflow-hidden dark:bg-zinc-900 dark:border-sky-800/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                <p className="text-xs sm:text-sm font-medium text-sky-700 flex items-center dark:text-sky-200">
                  <span className="bg-sky-50 p-1 rounded-md mr-2 text-sky-600 text-xs dark:bg-sky-900 dark:text-sky-300">HTML</span>
                  Add to your index.html:
                </p>
                <Button
                  onClick={() => copySnippet(react_snippet)}
                  variant="outline"
                  size="sm"
                  disabled={copyState !== "idle"}
                >
                  {copyState === "idle" ? (
                    <>
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      Copy
                    </>
                  ) : (
                    <div className="flex items-center gap-1">
                      {copyState === "success" ? (
                        <CopyCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                      ) : (
                        <CopyX className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                      <span className="text-xs sm:text-sm">
                        {copyState === "success" ? "Copied" : "Error"}
                      </span>
                    </div>
                  )}
                </Button>
              </div>
              <div className="overflow-x-auto max-w-full rounded-md">
                <SyntaxHighlighter
                  language="html"
                  style={oneDark}
                  customStyle={{
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(186, 230, 253, 0.2)",
                    fontSize: "12px",
                    maxWidth: "100%",
                    overflow: "auto",
                    wordBreak: "break-all",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {react_snippet}
                </SyntaxHighlighter>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="Next.js" className="mt-5">
            <div className="rounded-lg bg-white border border-sky-100/50 shadow-sm p-3 sm:p-4 overflow-hidden dark:bg-zinc-900 dark:border-sky-800/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                <p className="text-xs sm:text-sm font-medium text-sky-700 flex items-center dark:text-sky-200">
                  <span className="bg-sky-50 p-1 rounded-md mr-2 text-sky-600 text-xs dark:bg-sky-900 dark:text-sky-300">TSX</span>
                  Add to your app/layout.tsx:
                </p>
                <Button
                  onClick={() => copySnippet(next_snippet)}
                  variant="outline"
                  size="sm"
                  disabled={copyState !== "idle"}
                >
                  {copyState === "idle" ? (
                    <>
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      Copy
                    </>
                  ) : (
                    <div className="flex items-center gap-1">
                      {copyState === "success" ? (
                        <CopyCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                      ) : (
                        <CopyX className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                      <span className="text-xs sm:text-sm">
                        {copyState === "success" ? "Copied" : "Error"}
                      </span>
                    </div>
                  )}
                </Button>
              </div>
              <div className="overflow-x-auto max-w-full rounded-md">
                <SyntaxHighlighter
                  language="jsx"
                  style={oneDark}
                  customStyle={{
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(186, 230, 253, 0.2)",
                    fontSize: "12px",
                    maxWidth: "100%",
                    overflow: "auto",
                    wordBreak: "break-all",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {next_snippet}
                </SyntaxHighlighter>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
