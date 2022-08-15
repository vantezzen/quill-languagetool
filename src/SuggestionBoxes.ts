import debug from "./debug";
import Delta from "quill-delta";
import type Quill from "quill";
import { QuillLanguageTool } from ".";

/**
 * Clean all suggestion boxes from an HTML string
 *
 * @param html HTML to clean
 * @returns Cleaned text
 */
export function getCleanedHtml(html: string) {
  return html.replace(/<quill-lt-match .*>(.*)?<\/quill-lt-match>/g, "$1");
}

/**
 * Remove all suggestion boxes from the editor.
 */
export function removeSuggestionBoxes(quillEditor: Quill) {
  debug("Removing suggestion boxes for editor", quillEditor);

  const initialSelection = quillEditor.getSelection();
  const deltas = quillEditor.getContents();

  const deltasWithoutSuggestionBoxes = deltas.ops.map((delta) => {
    if (delta.attributes && delta.attributes.ltmatch) {
      return {
        ...delta,
        attributes: {
          ...delta.attributes,
          ltmatch: null,
        },
      };
    }
    return delta;
  });

  // @ts-ignore
  quillEditor.setContents(new Delta(deltasWithoutSuggestionBoxes));

  if (initialSelection) {
    quillEditor.setSelection(initialSelection);
  }
}

/**
 * Manager for the suggestion boxes.
 * This handles inserting and removing suggestion box elements from the editor.
 */
export class SuggestionBoxes {
  constructor(private readonly parent: QuillLanguageTool) {}

  /**
   * Remove all suggestion boxes from the editor.
   */
  public removeSuggestionBoxes() {
    this.parent.preventLoop();
    removeSuggestionBoxes(this.parent.quill);
  }

  /**
   * Insert a suggestion box into the editor.
   *
   * This uses the matches stored in the parent class
   */
  public addSuggestionBoxes() {
    this.parent.matches.forEach((match) => {
      this.parent.preventLoop();

      const ops = new Delta()
        .retain(match.offset)
        .retain(match.length, { ltmatch: match });
      // @ts-ignore
      this.parent.quill.updateContents(ops);

      debug("Adding formatter", "lt-match", match.offset, match.length);
    });
  }
}
