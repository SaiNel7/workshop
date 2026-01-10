import { Extension } from "@tiptap/core";
import Suggestion, { SuggestionOptions } from "@tiptap/suggestion";
import { commands, CommandItem } from "./CommandMenu";

export const SlashCommands = Extension.create({
  name: "slashCommands",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: any;
          range: any;
          props: CommandItem;
        }) => {
          props.command({ editor, range });
        },
      } as Partial<SuggestionOptions>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

// Filter commands by query
export function filterCommands(query: string): CommandItem[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return commands;
  }

  return commands.filter((item) => {
    const title = item.title.toLowerCase();
    const description = item.description.toLowerCase();

    // Match against title or description
    return title.includes(normalizedQuery) || description.includes(normalizedQuery);
  });
}
