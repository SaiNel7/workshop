// AI API types for Playground v1
// Following the locked contract defined in CLAUDE.md

// Supported AI modes
export type AskAIMode = "critique" | "synthesize";

// Project Brain - explicit context about the document's goals and constraints
export type ProjectBrain = {
  goal: string; // What this piece is trying to accomplish
  constraints: string[]; // Tone, audience, length, rules
  glossary: { term: string; definition: string }[]; // Key term definitions
  decisions: { text: string; createdAt: number }[]; // Past decisions ("we chose X because Y")
};

// Context Pack - the text context sent with each AI request
export type ContextPack = {
  selectedText: string; // The highlighted text (primary focus)
  localContext?: string; // Current paragraph + 2 before + 1 after
  outline?: string; // Document structure (H1/H2/H3 hierarchy)
  fullDocText?: string; // Full document text (only if explicitly enabled)
  sources?: { id: string; title: string; excerpt: string }[]; // Attached sources (future feature)
};

// AI Request - sent from client to /api/ai
export type AskAIRequest = {
  mode: AskAIMode; // Critique or synthesize
  userPrompt: string; // User's custom request (e.g., "Does this align with Kant?")
  context: ContextPack; // Text context
  brain: ProjectBrain; // Project Brain context
  meta?: {
    // Optional metadata
    documentId?: string; // Document ID for logging
    anchorId?: string; // Comment thread anchor ID
  };
};

// AI Response - returned from /api/ai
export type AskAIResponse = {
  message: string; // AI's response (always present)
  proposedText?: string; // Suggested rewrite (only for synthesize mode)
  clarifyingQuestion?: string; // AI's question if intent is ambiguous (max 1)
};
