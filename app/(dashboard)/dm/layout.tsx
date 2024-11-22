"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import { DMSidebar } from "./_components/sidebar";

export default function DMLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DMSidebar />
      {children}
    </SidebarProvider>
  );
}
