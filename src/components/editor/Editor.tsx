"use client";

import { useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { editorExtensions } from "./extensions";
import "./editor.css";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDocument, updateDocument } from "@/lib/store/documentStore";

interface EditorProps {
  documentId: string;
  onUpdate?: () => void; // Callback when content changes (for parent to update timestamp)
}

export function Editor({ documentId, onUpdate }: EditorProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Debounced save function
  const saveContent = useCallback(
    (content: any) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        updateDocument(documentId, { content });
        onUpdate?.();
      }, 600); // 600ms debounce
    },
    [documentId, onUpdate]
  );

  const editor = useEditor({
    extensions: editorExtensions,
    content: "",
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Only save after initial load
      if (isInitializedRef.current) {
        const json = editor.getJSON();
        saveContent(json);
      }
    },
  });

  // Load document content on mount or when documentId changes
  useEffect(() => {
    if (!editor) return;

    isInitializedRef.current = false;
    const doc = getDocument(documentId);

    if (doc?.content) {
      editor.commands.setContent(doc.content);
    } else {
      editor.commands.clearContent();
    }

    // Mark as initialized after a tick to avoid saving the loaded content
    setTimeout(() => {
      isInitializedRef.current = true;
    }, 0);
  }, [editor, documentId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return (
      <div className="max-w-3xl mx-auto px-16 py-4">
        <div className="h-48 animate-pulse bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-16 pb-16">
      {/* Floating toolbar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2 mb-4 border-b border-transparent">
        <div className="flex items-center gap-0.5 flex-wrap">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold (Cmd+B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic (Cmd+I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}

// Toolbar button component
function ToolbarButton({
  children,
  onClick,
  isActive,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded hover:bg-muted transition-colors",
        isActive && "bg-muted text-foreground"
      )}
    >
      {children}
    </button>
  );
}

// Toolbar divider
function ToolbarDivider() {
  return <div className="w-px h-5 bg-border mx-1" />;
}
