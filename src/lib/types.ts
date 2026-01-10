export type Document = {
  id: string;
  title: string;
  content: any; // Tiptap JSON
  createdAt: number;
  updatedAt: number;
};

export type DocumentListItem = Pick<Document, "id" | "title" | "updatedAt">;
