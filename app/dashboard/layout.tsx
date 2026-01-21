import React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
