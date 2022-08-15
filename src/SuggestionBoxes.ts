import debug from "./debug";
import Delta from "quill-delta";
import { QuillLanguageTool } from "./QuillLanguageTool";
import { MatchesEntity } from "./types";

export class SuggestionBoxes {
  constructor(private readonly parent: QuillLanguageTool) {}

  public removeSuggestionBoxes() {
    debug("Removing suggestion boxes for editor", this.parent.quill);

    const html = this.parent.quill.root.innerHTML;
    const cleanedHtml = this.getCleanedHtml(html);
    this.replaceEditorHtml(cleanedHtml);
  }

  public getCleanedHtml(html: string) {
    return html.replace(/<quill-lt-match .*>(.*)?<\/quill-lt-match>/g, "$1");
  }

  public addSuggestionBoxes(matches: MatchesEntity[]) {
    matches.forEach((match) => {
      this.parent.preventLoop();

      const ops = new Delta()
        .retain(match.offset)
        .retain(match.length, { ltmatch: match });
      // @ts-ignore
      this.parent.quill.updateContents(ops);

      debug("Adding formatter", "lt-match", match.offset, match.length);
    });
  }

  private replaceEditorHtml(html: string) {
    debug("Replacing editor html with", html);

    const initialSelection = this.parent.quill.getSelection();
    this.parent.preventLoop();
    this.parent.quill.clipboard.dangerouslyPasteHTML(html);

    if (initialSelection) {
      this.parent.quill.setSelection(initialSelection);
    }
  }
}
