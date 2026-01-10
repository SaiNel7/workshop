import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

export const editorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
    codeBlock: {
      HTMLAttributes: {
        class: "editor-code-block",
      },
    },
    blockquote: {
      HTMLAttributes: {
        class: "editor-blockquote",
      },
    },
  }),
  Placeholder.configure({
    placeholder: "Type '/' for commands, or just start writing...",
    emptyEditorClass: "is-editor-empty",
  }),
];
