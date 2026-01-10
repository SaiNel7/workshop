"use client";

import { createContext, useContext, useCallback, useRef, ReactNode } from "react";

// Types for the editor methods
export interface EditorMethods {
  applyCommentMark: (commentId: string) => void;
  removeCommentMark: (commentId: string) => void;
  getCommentText: (commentId: string) => string | null;
  getAllCommentTexts: () => Record<string, string>;
  getAllCommentData: () => Record<string, { text: string; position: number }>;
}

interface EditorContextValue {
  // Register editor methods (called by Editor)
  registerEditor: (methods: EditorMethods) => void;
  unregisterEditor: () => void;
  // Access editor methods (called by CommentPanel)
  editorMethods: EditorMethods | null;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const methodsRef = useRef<EditorMethods | null>(null);

  const registerEditor = useCallback((methods: EditorMethods) => {
    methodsRef.current = methods;
  }, []);

  const unregisterEditor = useCallback(() => {
    methodsRef.current = null;
  }, []);

  // We use a getter-like pattern to always get the current ref value
  const value: EditorContextValue = {
    registerEditor,
    unregisterEditor,
    get editorMethods() {
      return methodsRef.current;
    },
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context;
}

// Hook for registering editor methods
export function useEditorRegistration(methods: EditorMethods | null) {
  const { registerEditor, unregisterEditor } = useEditorContext();

  // Effect-like behavior handled by the caller
  if (methods) {
    registerEditor(methods);
  }

  return { unregisterEditor };
}
