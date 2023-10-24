import { createPopper } from "@popperjs/core";
import html from "nanohtml/lib/browser";
import raw from "nanohtml/raw";
import { QuillLanguageTool } from ".";
import { MatchesEntity } from "./types";

/**
 * Manager for popups.
 *
 * This handles opening and closing suggestion popups in the editor
 * when a suggestion is selected.
 */
export default class PopupManager {
  private openPopup?: HTMLElement;
  private currentSuggestionElement?: HTMLElement;

  constructor(private readonly parent: QuillLanguageTool) {
    this.closePopup = this.closePopup.bind(this);
    this.addEventHandler();
  }

  private addEventHandler() {
    this.parent.quill.root.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "QUILL-LT-MATCH") {
        this.handleSuggestionClick(target);
      }
    });

    window.addEventListener("resize", () => {
      if (this.currentSuggestionElement) {
        this.handleSuggestionClick(this.currentSuggestionElement);
      }
    });
  }

  private closePopup() {
    console.log("Closing popup", this.openPopup, this.currentSuggestionElement);
    if (this.openPopup) {
      this.openPopup.remove();
      this.openPopup = undefined;
    }
    this.currentSuggestionElement = undefined;
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

  private updateOffsets(replacementLength: number, originalLength: number, startOffset: number) {
    const diff = replacementLength - originalLength;

    this.parent.matches = this.parent.matches.filter((match) => {
      if (match.offset === startOffset) {
        return false; // Remove the match with the given startOffset
      }
      if (match.offset > startOffset) {
        match.offset += diff;
      }
      return true; // Keep all other matches
    });

    this.parent.reloadBoxes();
  }


  private createSuggestionPopup(match: MatchesEntity, suggestion: HTMLElement) {
    if (this.openPopup) {
      this.closePopup();
    }
    this.currentSuggestionElement = suggestion;

    const applySuggestion = (replacement: string) => {
      this.parent.preventLoop();
      this.parent.quill.setSelection(match.offset, match.length);
      this.parent.quill.deleteText(match.offset, match.length);
      this.parent.quill.insertText(match.offset, replacement);
      // @ts-ignore
      this.parent.quill.setSelection(match.offset + replacement.length);

      this.updateOffsets(replacement.length, match.length, match.offset);

      this.closePopup();
    };

    const popup = html`
      <quill-lt-popup role="tooltip">
        <div class="quill-lt-match-popup">
          <div class="quill-lt-match-popup-header">
            <button
              class="quill-lt-match-popup-close"
              onclick="${this.closePopup}"
            >
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
        <div class="quill-lt-popup-arrow" data-popper-arrow></div>
      </quill-lt-popup>
    `;

    document.body.appendChild(popup);

    createPopper(suggestion, popup, {
      placement: "top-end",
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 8],
          },
        },
      ],
    });

    this.openPopup = popup;
  }
}
