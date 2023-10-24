import { MatchesEntity } from "./types";

/**
 * Quill editor blot that represents a suggestion.
 *
 * This is added to the text to enable the suggestion to be selected and inserted.
 *
 * @param Quill Quill static instance
 * @returns Blot class that can be registered on the Quill instance
 */
export default function createSuggestionBlotForQuillInstance(Quill: any) {
  const ParentBlot = Quill.import("formats/bold");

  return class SuggestionBlot extends ParentBlot {
    static blotName = "ltmatch";
    static tagName = "quill-lt-match";

    static create(match?: MatchesEntity) {
      let node: HTMLElement = super.create();
      if (match) {
        node.setAttribute("data-offset", match.offset.toString());
        node.setAttribute("data-length", match.length.toString());
        node.setAttribute("data-rule-id", match.rule.id);
      }
      console.log("Created blot", node);
      return node;
    }

    optimize() {}
  };
}
