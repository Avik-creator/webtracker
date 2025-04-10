'use client';

import { ChartBar, Menu, X, ArrowRight, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSession } from "next-auth/react";
import { signOut } from 'next-auth/react';
import Image from 'next/image';

function SignOut() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        signOut()
      }}
    >
      <Button type="submit" className='bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2'>
        <LogOut className="h-4 w-4" />
        <span>Sign out</span>
      </Button>
    </form>
  )
}

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {data: session} = useSession();

  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Testimonials', href: '/#testimonials' },
    { name: 'FAQ', href: '/#faq' },
  ];

  const afterAuthenticatedNavLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> }
  ];

  const userImage = session?.user?.image;
  const userName = session?.user?.name;
  
  // Get only the first name if full name exists
  const firstName = userName?.split(' ')[0];

  return (
    <div className="relative">
      <nav className="flex flex-row items-center justify-center bg-white shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold flex items-center space-x-2 text-blue-700">
            <ChartBar className="h-6 w-6" />
            <span>WebTracker</span>
          </Link>
  
          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">
            {session ? afterAuthenticatedNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 font-medium"
              >
                {link.icon}
                {link.name}
              </Link>
            )) : navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
  
          {/* Desktop Auth Buttons or User Profile */}
          <div className="hidden md:flex items-center">
            {session ? (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 border-r border-blue-100 pr-6">
                  {userImage ? (
                    <Image 
                      src={userImage} 
                      alt={userName || "User"} 
                      width={36} 
                      height={36} 
                      className="rounded-full ring-2 ring-blue-100"
                    />
                  ) : (
                    <div className="bg-blue-100 rounded-full w-9 h-9 flex items-center justify-center text-blue-600 font-semibold">
                      {firstName?.[0]}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-blue-800 font-medium text-sm">Welcome,</span>
                    <span className="text-blue-600 font-semibold">{firstName}</span>
                  </div>
                </div>
                <SignOut />
              </div>
            ) : (
              <>
                <Link href="/auth" className="text-blue-600 hover:text-blue-800 mr-4">
                  Login
                </Link>
                <Link href="/auth">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
  
          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsOpen(!isOpen)} 
              className="rounded-xl border-blue-200 text-blue-600"
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </nav>
  
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden w-full px-4 py-4 flex flex-col gap-3 bg-white shadow-md z-10">
          {session ? (
            <div className="flex items-center gap-3 border-b border-blue-100 pb-4 mb-2">
              {userImage ? (
                <Image 
                  src={userImage} 
                  alt={userName || "User"} 
                  width={40} 
                  height={40} 
                  className="rounded-full ring-2 ring-blue-100"
                />
              ) : (
                <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center text-blue-600 font-semibold">
                  {firstName?.[0]}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-blue-800 font-medium text-sm">Welcome,</span>
                <span className="text-blue-600 font-semibold">{firstName}</span>
              </div>
            </div>
          ) : null}
          
          {session ? afterAuthenticatedNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-blue-600 hover:text-blue-800 transition-colors py-2 flex items-center gap-3"
              onClick={() => setIsOpen(false)}
            >
              {link.icon}
              {link.name}
            </Link>
          )) : navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-blue-600 hover:text-blue-800 transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}
          
          <hr className="my-2 border-blue-100 w-full" />
          
          {session ? (
            <SignOut />
          ) : (
            <>
              <Link
                href="/auth"
                className="text-blue-600 hover:text-blue-800 py-2"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link href="/auth" onClick={() => setIsOpen(false)} className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};