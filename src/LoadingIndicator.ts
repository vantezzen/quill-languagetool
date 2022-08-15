import { QuillLanguageTool } from "./QuillLanguageTool";
import html from "nanohtml/lib/browser";

/**
 * Manager for the loading indicator.
 *
 * This handles showing and hiding the loading indicator in the editor.
 */
export default class LoadingIndicator {
  private currentLoader?: HTMLElement;

  constructor(private readonly parent: QuillLanguageTool) {}

  public startLoading() {
    this.currentLoader?.remove();

    if (this.parent.params.showLoadingIndicator) {
      const loadingIndicator = html`
        <div class="quill-lt-loading-indicator">
          <div class="quill-lt-loading-indicator-spinner"></div>
        </div>
      `;
      this.currentLoader = loadingIndicator;
      this.parent.quill.root.parentElement?.appendChild(loadingIndicator);
    }
  }
  public stopLoading() {
    this.currentLoader?.remove();
  }
}
