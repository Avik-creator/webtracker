import Footer from "@/components/Footer/mainFooter";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import type { PropsWithChildren } from "react";
import { GeistMono } from "geist/font/mono";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "WebTracker",
    template: "%s | WebTracker",
  },
  description:
    "A web analytics tool for tracking user behavior and performance",
  keywords: [
    "web analytics",
    "user behavior",
    "performance tracking",
    "data visualization",
    "real-time analytics",
    "user engagement",
    "website performance",
    "analytics dashboard",
    "data analysis",
    "user experience",
    "conversion tracking",
    "event tracking",
  ],
  openGraph: {
    description:
      "A web analytics tool for tracking user behavior and performance",
    title: "WebTracker",
    type: "website",
    siteName: "WebTracker",
    locale: "en_US",
    url: "https://webtracker.avikmukherjee.tech",
    images: [
      {
        url: "https://webtracker.avikmukherjee.tech/og-image.png",
        width: 1200,
        height: 630,
        alt: "WebTracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    description:
      "A web analytics tool for tracking user behavior and performance",
    title: "WebTracker",
    images: [
      {
        url: "https://webtracker.avikmukherjee.tech/og-image.png",
        width: 1200,
        height: 630,
        alt: "WebTracker",
      },
    ],
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${GeistMono.variable} font-sans antialiased selection:bg-primary/10 selection:text-primary dark:selection:bg-primary/20 dark:selection:text-primary-foreground`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-background to-secondary/30 dark:from-background dark:to-secondary/5">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <Toaster className="bg-blue-500" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
