import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import { SuggestionProps, SuggestionKeyDownProps } from "@tiptap/suggestion";
import { SlashCommands, filterCommands } from "./slashCommands";
import { CommandMenu, CommandMenuRef, CommandItem } from "./CommandMenu";
import { CommentMark } from "./commentMark";

// Custom extension to add Ctrl+Y / Cmd+Y shortcut for redo (Windows/Linux style)
const RedoShortcut = Extension.create({
  name: "redoShortcut",

  addKeyboardShortcuts() {
    return {
      "Mod-y": () => this.editor.commands.redo(),
    };
  },
});

// Debug extension to test Context Pack extraction (Alt+P)
// Set to false in production
const DEBUG_CONTEXT_PACK = false;

const DebugContextPack = Extension.create({
  name: "debugContextPack",

  addKeyboardShortcuts() {
    return {
      "Alt-p": () => {
        if (!DEBUG_CONTEXT_PACK) return false;

        // Import helpers dynamically to avoid circular deps
        import("@/lib/contextExtractor").then(({ buildContextPack }) => {
          const contextPack = buildContextPack(this.editor, {
            includeFullDoc: false,
          });

          console.log("=== DEBUG CONTEXT PACK (Alt+P) ===");
          console.log("Selected text:", contextPack.selectedText);
          console.log("Local context:", contextPack.localContext);
          console.log("Outline:", contextPack.outline);
          console.log("================================");
        });

        return true;
      },
    };
  },
});

// Create suggestion render function for React
function createSuggestionRender() {
  let component: ReactRenderer<CommandMenuRef> | null = null;
  let popup: HTMLDivElement | null = null;

  return {
    onStart: (props: SuggestionProps) => {
      const items = filterCommands(props.query);

      component = new ReactRenderer(CommandMenu, {
        props: {
          items,
          command: (item: CommandItem) => {
            props.command(item);
          },
        },
        editor: props.editor,
      });

      popup = document.createElement("div");
      popup.style.position = "absolute";
      popup.style.zIndex = "50";
      document.body.appendChild(popup);
      popup.appendChild(component.element);

      // Position popup
      const { clientRect } = props;
      if (clientRect) {
        const rect = clientRect();
        if (rect) {
          popup.style.left = `${rect.left}px`;
          popup.style.top = `${rect.bottom + 8}px`;
        }
      }
    },

    onUpdate: (props: SuggestionProps) => {
      const items = filterCommands(props.query);

      component?.updateProps({
        items,
        command: (item: CommandItem) => {
          props.command(item);
        },
      });

      // Update position
      if (popup) {
        const { clientRect } = props;
        if (clientRect) {
          const rect = clientRect();
          if (rect) {
            popup.style.left = `${rect.left}px`;
            popup.style.top = `${rect.bottom + 8}px`;
          }
        }
      }
    },

    onKeyDown: (props: SuggestionKeyDownProps) => {
      if (props.event.key === "Escape") {
        popup?.remove();
        component?.destroy();
        popup = null;
        component = null;
        return true;
      }

      return component?.ref?.onKeyDown(props) ?? false;
    },

    onExit: () => {
      popup?.remove();
      component?.destroy();
      popup = null;
      component = null;
    },
  };
}

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
  SlashCommands.configure({
    suggestion: {
      items: ({ query }: { query: string }) => filterCommands(query),
      render: createSuggestionRender,
    },
  }),
  CommentMark,
  RedoShortcut,
  DebugContextPack,
];
