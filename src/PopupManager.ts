import html from "nanohtml/lib/browser";
import raw from "nanohtml/raw";
import { QuillLanguageTool } from "./QuillLanguageTool";
import { MatchesEntity } from "./types";

export default class PopupManager {
  private openPopup?: HTMLElement;

  constructor(private readonly parent: QuillLanguageTool) {
    this.addEventHandler();
  }

  private addEventHandler() {
    this.parent.quill.root.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "QUILL-LT-MATCH") {
        this.handleSuggestionClick(target);
      }
    });
  }

  private handleSuggestionClick(suggestion: HTMLElement) {
    const offset = parseInt(suggestion.getAttribute("data-offset") || "0");
    const length = parseInt(suggestion.getAttribute("data-length") || "0");
    const ruleId = suggestion.getAttribute("data-rule-id");
    const rule = this.parent.matches.find(
      (r) => r.offset === offset && r.length === length && r.rule.id === ruleId
    );
    if (!rule) {
      throw new Error(`Could not find rule with id ${ruleId}`);
    }

    this.createSuggestionPopup(rule, suggestion);
  }

  private createSuggestionPopup(match: MatchesEntity, suggestion: HTMLElement) {
    if (this.openPopup) {
      this.openPopup.remove();
    }

    const suggestionPosition = suggestion.getBoundingClientRect();
    const top = suggestionPosition.top + suggestionPosition.height;
    const left = suggestionPosition.left;
    let closePopup = () => {
      document.body.removeChild(popup);
    };

    const applySuggestion = (replacement: string) => {
      this.parent.preventLoop();
      this.parent.quill.setSelection(match.offset, match.length);
      this.parent.quill.deleteText(match.offset, match.length);
      this.parent.quill.insertText(match.offset, replacement);
      // @ts-ignore
      this.parent.quill.setSelection(match.offset + replacement.length);

      closePopup();
    };

    const popup = html`
      <div class="quill-lt-match-popup" style="top:${top}px;left:${left}px;">
        <div class="quill-lt-match-popup-header">
          <button class="quill-lt-match-popup-close" onclick="${closePopup}">
            ${raw("&times;")}
          </button>
        </div>
        <div class="quill-lt-match-popup-title">${match.shortMessage}</div>
        <div class="quill-lt-match-popup-description">${match.message}</div>

        <div class="quill-lt-match-popup-actions">
          ${match.replacements?.slice(0, 3).map((replacement) => {
            return html`
              <button
                class="quill-lt-match-popup-action"
                data-replacement="${replacement.value}"
                onclick=${() => applySuggestion(replacement.value)}
              >
                ${replacement.value}
              </button>
            `;
          })}
        </div>

        <div class="quill-lt-powered-by">
          Powered by <a href="https://languagetool.org">LanguageTool</a>
        </div>
      </div>
    `;

    document.body.appendChild(popup);
    this.openPopup = popup;
  }
}
