"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationsDropdown } from "./notifications-dropdown";
import { Search } from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  const { data: session } = useSession();

  const getUserInitials = () => {
    if (!session?.user?.name) return "AD";
    const names = session.user.name.split(" ");
    return (names[0][0] + (names[1]?.[0] || "")).toUpperCase();
  };

  return (
    <div className="flex items-center justify-between px-8 py-4 border-b bg-white">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm w-48"
          />
        </div>

        {/* Notifications */}
        <NotificationsDropdown />

        {/* User Profile */}
        <Link href="/dashboard/settings">
          <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-blue-600 text-white">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </div>
  );
}
