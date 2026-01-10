# Playground — Project Overview (Cursor Rules)

## What we are building
Playground is a Notion-like web workspace for creating and iterating on artifacts (starting with documents).
Phase 1 is ONLY the editor and document persistence (no AI yet).

## Phase 1 MVP (must-have)
- Notion-like layout: sidebar + main editor page
- Rich text editor: headings, paragraphs, bullet/numbered lists, quote, code block
- Document CRUD (Create, Rename, Delete)
- Local persistence (localStorage)
- Routing: /doc/[id]
- Autosave (debounced)

## Non-goals for Phase 1
- AI integration
- Accounts/auth
- Collaboration / realtime
- Backend database

## Tech decisions
- Next.js (App Router)
- Tiptap editor (StarterKit)
- Tailwind + shadcn/ui for UI
- localStorage for persistence (JSON)

## Cursor Rules (how to work on this repo)
1) Make small, testable changes per commit:
   - One feature per PR/commit (layout, editor, storage, routing, polish).
2) Do NOT rewrite working code unless needed.
3) Prefer composing small components over big files.
4) Avoid adding libraries unless they clearly reduce work.
5) Keep types strict:
   - Define shared types in /src/lib/types.ts
6) Keep editor logic isolated:
   - All Tiptap setup belongs in /src/components/editor/*
7) Persistence rules:
   - Single source of truth is DocumentStore abstraction in /src/lib/store/*
   - UI never talks to localStorage directly.
8) UX rules:
   - Changes should feel instant (debounced autosave).
   - Show clear empty states and error states.
9) Styling rules:
   - Match Notion vibe: calm, minimal borders, lots of whitespace.
   - Use Tailwind + shadcn components; avoid custom CSS unless necessary.

## Definition of done for a task
- It runs locally with no console errors
- The feature works in the browser
- Types compile cleanly
- Basic empty/loading states exist

## Folder structure (target)
src/
  app/
    page.tsx                  # redirect or home
    doc/[id]/page.tsx         # editor page
  components/
    layout/Sidebar.tsx
    layout/Topbar.tsx
    editor/Editor.tsx
    editor/extensions.ts
  lib/
    store/documentStore.ts    # CRUD + autosave
    types.ts                  # Document types
    u
