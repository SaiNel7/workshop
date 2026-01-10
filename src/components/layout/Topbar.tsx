"use client";

import { MoreHorizontal, Star } from "lucide-react";

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <div className="h-11 flex items-center justify-between px-3 border-b border-transparent hover:border-border transition-colors">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        {/* Breadcrumb placeholder */}
        <span className="hover:bg-muted px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          {title || "Untitled"}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
          <Star className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
