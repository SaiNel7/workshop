"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Document } from "@/lib/types";
import {
  getAllDocuments,
  createDocument,
  subscribeToChanges,
} from "@/lib/store/documentStore";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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

      {/* Search (placeholder) */}
      <div className="p-2">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors">
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>
      </div>

      {/* Documents list */}
      <div className="flex-1 overflow-auto px-2">
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

        {/* Document list */}
        <nav className="space-y-0.5">
          {documents.map((doc) => {
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
