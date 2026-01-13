// Context Pack extraction helpers for AI collaboration
// Extracts selectedText, localContext, outline, and fullDocText from Tiptap editor

import type { Editor } from "@tiptap/react";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

/**
 * Extract selected text from the editor.
 * Returns empty string if no selection.
 */
export function getSelectedText(editor: Editor): string {
  try {
    if (!editor) return "";

    const { from, to } = editor.state.selection;

    // No selection (cursor only)
    if (from === to) return "";

    // Extract text between selection bounds
    const text = editor.state.doc.textBetween(from, to, "\n");
    return text.trim();
  } catch (error) {
    console.warn("[getSelectedText] Failed to extract selection:", error);
    return "";
  }
}

/**
 * Extract document outline (H1, H2, H3 hierarchy) from editor JSON.
 * Returns formatted outline with markdown-style prefixes (# ## ###).
 */
export function getOutlineFromJSON(json: any): string {
  try {
    if (!json || !json.content) return "";

    const headings: string[] = [];

    // Recursive traversal to find all heading nodes
    const traverse = (node: any): void => {
      if (!node) return;

      // Check if this is a heading node (levels 1-3)
      if (node.type === "heading" && node.attrs?.level) {
        const level = node.attrs.level;
        if (level >= 1 && level <= 3) {
          // Extract text content from heading
          const text = extractTextFromNode(node);
          if (text) {
            const prefix = "#".repeat(level);
            headings.push(`${prefix} ${text}`);
          }
        }
      }

      // Traverse children
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(traverse);
      }
    };

    traverse(json);

    return headings.join("\n");
  } catch (error) {
    console.warn("[getOutlineFromJSON] Failed to extract outline:", error);
    return "";
  }
}

/**
 * Extract plain text from a node (recursive).
 */
function extractTextFromNode(node: any): string {
  if (!node) return "";

  let text = "";

  // If this is a text node, return its text
  if (node.type === "text" && node.text) {
    return node.text;
  }

  // Otherwise, traverse children
  if (node.content && Array.isArray(node.content)) {
    text = node.content.map(extractTextFromNode).join("");
  }

  return text;
}

/**
 * Extract local context around the current selection.
 * Returns: current block + 2 blocks before + 1 block after.
 *
 * "Block" = paragraph, heading, list item, blockquote, code block, etc.
 */
export function getLocalContext(editor: Editor): string {
  try {
    if (!editor) return "";

    const { doc, selection } = editor.state;
    const { from } = selection;

    // Find all block nodes in the document
    const blocks: { node: ProseMirrorNode; pos: number; text: string }[] = [];

    doc.descendants((node, pos) => {
      // Check if this is a block-level node
      if (node.isBlock && !node.type.spec.code) {
        // Extract text from this block
        const text = node.textContent.trim();
        if (text) {
          blocks.push({ node, pos, text });
        }
      }
      return true; // Continue traversal
    });

    if (blocks.length === 0) return "";

    // Find the block containing the selection
    let currentBlockIndex = -1;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const blockEnd = block.pos + block.node.nodeSize;

      if (from >= block.pos && from <= blockEnd) {
        currentBlockIndex = i;
        break;
      }
    }

    // If no block found (shouldn't happen), return empty
    if (currentBlockIndex === -1) {
      // Fallback: just return the first few blocks
      currentBlockIndex = 0;
    }

    // Collect: 2 blocks before + current + 1 block after
    const startIndex = Math.max(0, currentBlockIndex - 2);
    const endIndex = Math.min(blocks.length - 1, currentBlockIndex + 1);

    const contextBlocks = blocks.slice(startIndex, endIndex + 1);
    const contextText = contextBlocks.map(b => b.text).join("\n\n");

    return contextText;
  } catch (error) {
    console.warn("[getLocalContext] Failed to extract local context:", error);
    return "";
  }
}

/**
 * Extract full document text from the editor.
 */
export function getFullDocText(editor: Editor): string {
  try {
    if (!editor) return "";
    return editor.getText();
  } catch (error) {
    console.warn("[getFullDocText] Failed to extract full document:", error);
    return "";
  }
}

/**
 * Build a complete Context Pack for AI requests.
 *
 * @param editor - Tiptap editor instance
 * @param opts - Options (e.g., includeFullDoc flag)
 * @returns Context Pack object
 */
export function buildContextPack(
  editor: Editor,
  opts?: { includeFullDoc?: boolean }
): {
  selectedText: string;
  localContext: string;
  outline: string;
  fullDocText?: string;
} {
  try {
    if (!editor) {
      return {
        selectedText: "",
        localContext: "",
        outline: "",
      };
    }

    const selectedText = getSelectedText(editor);
    const localContext = getLocalContext(editor);
    const json = editor.getJSON();
    const outline = getOutlineFromJSON(json);

    const contextPack: {
      selectedText: string;
      localContext: string;
      outline: string;
      fullDocText?: string;
    } = {
      selectedText,
      localContext,
      outline,
    };

    // Conditionally include full document text
    if (opts?.includeFullDoc) {
      contextPack.fullDocText = getFullDocText(editor);
    }

    return contextPack;
  } catch (error) {
    console.error("[buildContextPack] Failed to build context pack:", error);
    return {
      selectedText: "",
      localContext: "",
      outline: "",
    };
  }
}
