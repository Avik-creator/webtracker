"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChartBar,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function SignOut() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        signOut();
      }}
    >
      <Button
        type="submit"
        variant="default"
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/10 transition-all duration-300"
      >
        <LogOut className="h-4 w-4" />
        <span>Sign out</span>
      </Button>
    </form>
  );
}

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
    { name: "FAQ", href: "/#faq" },
  ];

  const afterAuthenticatedNavLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
  ];

  const userImage = session?.user?.image;
  const userName = session?.user?.name;

  const firstName = userName?.split(" ")[0];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 border-b border-transparent backdrop-blur-md bg-white/80 dark:bg-neutral-900/80",
        {
          "border-b border-gray-200 dark:border-gray-800": isScrolled,
          "bg-background dark:bg-zinc-950": session,
        }
      )}
    >
      <nav className="relative flex flex-row items-center justify-center">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6 py-4">
          <Link
            href={session ? "/dashboard" : "/"}
            className="flex items-center space-x-2"
          >
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-1.5 rounded-lg shadow-md">
              <ChartBar className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">
              WebTracker
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <ThemeSwitcher />

            {session ? (
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-3 border-r border-gray-200 dark:border-gray-700 pr-5">
                  {userImage ? (
                    <div className="relative">
                      <Image
                        src={userImage}
                        alt={userName || "User"}
                        width={38}
                        height={38}
                        className="rounded-full ring-2 ring-blue-100 dark:ring-blue-900 shadow-md"
                      />
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900"></span>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-semibold shadow-md">
                        {firstName?.[0]}
                      </div>
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900"></span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {firstName}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Welcome back,
                    </span>
                  </div>
                </div>
                <SignOut />
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link href="/auth">
                  <Button
                    variant="default"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/10 transition-all duration-300"
                  >
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full w-9 h-9 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-5 bg-white dark:bg-neutral-900 shadow-lg border-t border-gray-200 dark:border-gray-800">
              {session ? (
                <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                  {userImage ? (
                    <div className="relative">
                      <Image
                        src={userImage}
                        alt={userName || "User"}
                        width={45}
                        height={45}
                        className="rounded-full ring-2 ring-blue-100 dark:ring-blue-900 shadow-md"
                      />
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900"></span>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-semibold shadow-md">
                        {firstName?.[0]}
                      </div>
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900"></span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Welcome back,
                    </span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {firstName}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-4">
                {session
                  ? afterAuthenticatedNavLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 flex items-center gap-3"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg">
                          {link.icon}
                        </div>
                        <span className="font-medium">{link.name}</span>
                      </Link>
                    ))
                  : navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 flex items-center"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="font-medium">{link.name}</span>
                      </Link>
                    ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                {session ? (
                  <SignOut />
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/auth"
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/auth"
                      onClick={() => setIsOpen(false)}
                      className="w-full"
                    >
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
                        Get Started <ArrowRight className="h-4 w-4 " />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
