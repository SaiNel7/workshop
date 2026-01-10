"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { QuickSwitch } from "./QuickSwitch";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isQuickSwitchOpen, setIsQuickSwitchOpen] = useState(false);

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsQuickSwitchOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const openQuickSwitch = useCallback(() => {
    setIsQuickSwitchOpen(true);
  }, []);

  const closeQuickSwitch = useCallback(() => {
    setIsQuickSwitchOpen(false);
  }, []);

  return (
    <>
      <div className="flex h-screen">
        <Sidebar onOpenQuickSwitch={openQuickSwitch} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <QuickSwitch isOpen={isQuickSwitchOpen} onClose={closeQuickSwitch} />
    </>
  );
}
