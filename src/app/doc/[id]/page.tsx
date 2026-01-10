"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Editor } from "@/components/editor/Editor";
import {
  getDocument,
  createDocument,
  updateDocument,
} from "@/lib/store/documentStore";
import { Document } from "@/lib/types";

interface DocPageProps {
  params: {
    id: string;
  };
}

export default function DocPage({ params }: DocPageProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState("");
  const [lastEdited, setLastEdited] = useState<number | null>(null);
  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load or create document on mount
  useEffect(() => {
    let doc = getDocument(params.id);

    // Auto-create document if it doesn't exist
    if (!doc) {
      doc = createDocument({ id: params.id, title: "Untitled" });
    }

    setDocument(doc);
    setTitle(doc.title);
    setLastEdited(doc.updatedAt);
  }, [params.id]);

  // Debounced title save
  const saveTitle = useCallback(
    (newTitle: string) => {
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current);
      }

      titleTimeoutRef.current = setTimeout(() => {
        updateDocument(params.id, { title: newTitle });
        setLastEdited(Date.now());
      }, 500);
    },
    [params.id]
  );

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    saveTitle(newTitle);
  };

  // Handle editor content update
  const handleEditorUpdate = useCallback(() => {
    setLastEdited(Date.now());
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current);
      }
    };
  }, []);

  // Format relative time
  const formatLastEdited = (timestamp: number | null) => {
    if (!timestamp) return "";

    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 5) return "Saved";
    if (seconds < 60) return `Edited ${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Edited ${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Edited ${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `Edited ${days}d ago`;
  };

  // Loading state
  if (!document) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-11 border-b border-border" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Topbar title={title || "Untitled"} />

      <div className="flex-1 overflow-auto">
        {/* Document header with large editable title */}
        <div className="max-w-3xl mx-auto px-16 pt-16 pb-4">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="w-full text-4xl font-bold text-foreground bg-transparent outline-none placeholder:text-muted-foreground/40"
            spellCheck={false}
          />

          {/* Last edited indicator */}
          <div className="mt-3 text-xs text-muted-foreground/60">
            {formatLastEdited(lastEdited)}
          </div>
        </div>

        {/* Editor */}
        <Editor documentId={params.id} onUpdate={handleEditorUpdate} />
      </div>
    </div>
  );
}
