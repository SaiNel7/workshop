"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CommandItem {
  title: string;
  description: string;
  icon: LucideIcon;
  command: (props: { editor: any; range: any }) => void;
}

export const commands: CommandItem[] = [
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: Heading1,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: Heading2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: Heading3,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    title: "Bulleted List",
    description: "Create a simple bulleted list",
    icon: List,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    icon: ListOrdered,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote",
    icon: Quote,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Code Block",
    description: "Display code with syntax",
    icon: Code,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Divider",
    description: "Insert a horizontal divider",
    icon: Minus,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
];

interface CommandMenuProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

export interface CommandMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const CommandMenu = forwardRef<CommandMenuRef, CommandMenuProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Reset selection when items change
    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    // Expose keyboard handler to parent
    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          return true;
        }

        if (event.key === "ArrowDown") {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }

        if (event.key === "Enter") {
          const item = items[selectedIndex];
          if (item) {
            command(item);
          }
          return true;
        }

        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-sm text-muted-foreground">
          No results
        </div>
      );
    }

    return (
      <div className="bg-background border border-border rounded-lg shadow-lg py-1 min-w-[220px] max-h-[320px] overflow-y-auto">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={() => command(item)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 text-left text-sm transition-colors",
                index === selectedIndex
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded bg-muted-foreground/10">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);

CommandMenu.displayName = "CommandMenu";
