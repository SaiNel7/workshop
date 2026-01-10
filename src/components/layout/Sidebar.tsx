"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Document } from "@/lib/types";
import {
  getAllDocuments,
  createDocument,
  subscribeToChanges,
} from "@/lib/store/documentStore";

interface SidebarProps {
  onOpenQuickSwitch?: () => void;
}

export function Sidebar({ onOpenQuickSwitch }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load documents from store
  const loadDocuments = useCallback(() => {
    const docs = getAllDocuments();
    setDocuments(docs);
    setIsLoaded(true);
  }, []);

  // Load on mount
  useEffect(() => {
    loadDocuments();

    // Subscribe to storage changes (cross-tab sync)
    const unsubscribe = subscribeToChanges(loadDocuments);
    return unsubscribe;
  }, [loadDocuments]);

  // Reload documents when pathname changes (new doc created)
  useEffect(() => {
    loadDocuments();
  }, [pathname, loadDocuments]);

  // Filter documents by search query
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const query = searchQuery.toLowerCase();
    return documents.filter((doc) =>
      (doc.title || "Untitled").toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

  // Create new document and navigate
  const handleNewDocument = () => {
    const newDoc = createDocument({ title: "Untitled" });
    router.push(`/doc/${newDoc.id}`);
  };

  return (
    <aside className="w-60 h-screen bg-[#fbfbfa] border-r border-border flex flex-col">
      {/* Workspace header */}
      <div className="p-3 border-b border-border">
        <Link
          href="/"
          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer transition-colors"
        >
          <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
            P
          </div>
          <span className="text-sm font-medium text-foreground">Playground</span>
        </Link>
      </div>

      {/* Quick Switch button */}
      <div className="p-2">
        <button
          onClick={onOpenQuickSwitch}
          className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors"
        >
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span>Quick Switch</span>
          </span>
          <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>
      </div>

      {/* Documents list */}
      <div className="flex-1 overflow-auto px-2 flex flex-col">
        <div className="flex items-center justify-between px-2 py-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Documents
          </span>
          <button
            onClick={handleNewDocument}
            className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
            title="New document"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        {documents.length > 0 && (
          <div className="px-2 pb-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter..."
                className="w-full pl-7 pr-7 py-1 text-sm bg-muted/50 border border-transparent focus:border-border rounded-md outline-none placeholder:text-muted-foreground/60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {isLoaded && documents.length === 0 && (
          <div className="px-2 py-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              No documents yet
            </p>
            <button
              onClick={handleNewDocument}
              className="text-sm text-foreground hover:underline"
            >
              Create your first document
            </button>
          </div>
        )}

        {/* No filter results */}
        {isLoaded && documents.length > 0 && filteredDocuments.length === 0 && (
          <div className="px-2 py-4 text-center">
            <p className="text-sm text-muted-foreground">No matches</p>
          </div>
        )}

        {/* Document list */}
        <nav className="space-y-0.5 flex-1 overflow-auto">
          {filteredDocuments.map((doc) => {
            const isActive = pathname === `/doc/${doc.id}`;
            return (
              <Link
                key={doc.id}
                href={`/doc/${doc.id}`}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{doc.title || "Untitled"}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <button
          onClick={handleNewDocument}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New document</span>
        </button>
      </div>
    </aside>
  );
}
