import { Document } from "@/lib/types";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "playground:documents";

// Default empty Tiptap document (prevents hydration edge cases)
const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

// Helper: Read all documents from localStorage
function readFromStorage(): Document[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    console.error("Failed to read documents from localStorage");
    return [];
  }
}

// Helper: Write all documents to localStorage
function writeToStorage(documents: Document[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  } catch {
    console.error("Failed to write documents to localStorage");
  }
}

// Get all documents sorted by updatedAt (descending)
// Note: spread to avoid mutating the original array
export function getAllDocuments(): Document[] {
  const docs = readFromStorage();
  return [...docs].sort((a, b) => b.updatedAt - a.updatedAt);
}

// Get a single document by ID
export function getDocument(id: string): Document | null {
  const docs = readFromStorage();
  return docs.find((doc) => doc.id === id) || null;
}

// Create a new document (with uniqueness protection)
export function createDocument(partial?: Partial<Document>): Document {
  const now = Date.now();
  const docs = readFromStorage();

  // If partial.id is provided and already exists, generate a new ID
  let id = partial?.id || generateId();
  if (partial?.id && docs.some((doc) => doc.id === partial.id)) {
    id = generateId();
  }

  const newDoc: Document = {
    id,
    title: partial?.title || "Untitled",
    content: partial?.content ?? EMPTY_DOC,
    createdAt: partial?.createdAt || now,
    updatedAt: partial?.updatedAt || now,
  };

  docs.push(newDoc);
  writeToStorage(docs);

  return newDoc;
}

// Update an existing document
// Note: respects updates.updatedAt if explicitly provided (for imports/restores)
export function updateDocument(id: string, updates: Partial<Document>): void {
  const docs = readFromStorage();
  const index = docs.findIndex((doc) => doc.id === id);

  if (index === -1) return;

  const updatedAt = updates.updatedAt ?? Date.now();
  docs[index] = {
    ...docs[index],
    ...updates,
    updatedAt,
  };

  writeToStorage(docs);
}

// Delete a document
export function deleteDocument(id: string): void {
  const docs = readFromStorage();
  const filtered = docs.filter((doc) => doc.id !== id);
  writeToStorage(filtered);
}

// Toggle starred status
export function toggleStarDocument(id: string): boolean {
  const docs = readFromStorage();
  const index = docs.findIndex((doc) => doc.id === id);

  if (index === -1) return false;

  const newStarred = !docs[index].starred;
  docs[index] = {
    ...docs[index],
    starred: newStarred,
  };

  writeToStorage(docs);
  return newStarred;
}

// Get starred documents
export function getStarredDocuments(): Document[] {
  const docs = readFromStorage();
  return [...docs]
    .filter((doc) => doc.starred)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

// Subscribe to storage changes (for cross-tab sync)
export function subscribeToChanges(callback: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }

  return () => {};
}
