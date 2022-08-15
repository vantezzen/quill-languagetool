import type Quill from "quill";
import debug from "./debug";
import { SuggestionBoxes } from "./SuggestionBoxes";
import "./QuillLanguageTool.css";
import createSuggestionBlotForQuillInstance from "./SuggestionBlot";
import PopupManager from "./PopupManager";
import { LanguageToolApi, MatchesEntity } from "./types";
import LoadingIndicator from "./LoadingIndicator";

export type QuillLanguageToolParams = {
  server: string;
  language: string;
  disableNativeSpellcheck: boolean;
  cooldownTime: number;
  showLoadingIndicator: boolean;
};

/**
 * QuillLanguageTool is a Quill plugin that provides spellchecking and grammar checking
 * using the LanguageTool API.
 */
export class QuillLanguageTool {
  static DEFAULTS: QuillLanguageToolParams = {
    server: "https://languagetool.org/api",
    language: "en-US",
    disableNativeSpellcheck: true,
    cooldownTime: 3000,
    showLoadingIndicator: true,
  };

  protected typingCooldown?: NodeJS.Timeout;

  // A loop is used to prevent suggestion updates from triggering a checkSpelling() call again.
  protected loopPreventionCooldown?: NodeJS.Timeout;

  // Dependencies
  protected boxes = new SuggestionBoxes(this);
  protected popups = new PopupManager(this);
  protected loader = new LoadingIndicator(this);

  public matches: MatchesEntity[] = [];

  /**
   * Create a new QuillLanguageTool instance.
   *
   * @param quill Instance of the Qill editor.
   * @param params Options for the QuillLanguageTool instance.
   */
  constructor(public quill: Quill, public params: QuillLanguageToolParams) {
    debug("Attaching QuillLanguageTool to Quill instance", quill);

    this.quill.on("text-change", (_delta, _oldDelta, source) => {
      if (source === "user") {
        this.onTextChange();
      }
    });
    this.checkSpelling();
    this.disableNativeSpellcheckIfSet();
  }

  private disableNativeSpellcheckIfSet() {
    if (this.params.disableNativeSpellcheck) {
      this.quill.root.setAttribute("spellcheck", "false");
    }
  }

  private onTextChange() {
    if (this.loopPreventionCooldown) return;
    if (this.typingCooldown) {
      clearTimeout(this.typingCooldown);
    }
    this.typingCooldown = setTimeout(() => {
      debug("User stopped typing, checking spelling");

      this.checkSpelling();
    }, this.params.cooldownTime);
  }

  private async checkSpelling() {
    debug("Removing existing suggestion boxes");
    this.boxes.removeSuggestionBoxes();

    if (document.querySelector("lt-toolbar")) {
      debug("Languagetool is installed as extension, not checking");
      return;
    }

    debug("Checking spelling");
    this.loader.startLoading();
    const json = await this.getLanguageToolResults();

    if (json && json.matches) {
      this.matches = json.matches;

      debug("Adding suggestion boxes");
      this.boxes.addSuggestionBoxes();
    } else {
      debug("No matches found");
      this.matches = [];
    }
    this.loader.stopLoading();
  }

  private async getLanguageToolResults() {
    try {
      const response = await fetch(this.params.server + "/v2/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        mode: "cors",
        body: `text=${encodeURIComponent(this.quill.getText())}&language=${
          this.params.language
        }`,
      });
      const json = (await response.json()) as LanguageToolApi;
      return json;
    } catch (e) {
      return null;
    }
  }

  public preventLoop() {
    if (this.loopPreventionCooldown) {
      clearTimeout(this.loopPreventionCooldown);
    }
    this.loopPreventionCooldown = setTimeout(() => {
      this.loopPreventionCooldown = undefined;
    }, 100);
  }
}

/**
 * Register all QuillLanguageTool modules with Quill.
 *
 * This needs access to the exact Quill static instance
 * you will be using in your application.
 *
 * Example:
 * ```
 * import Quill from "quill";
 * import registerQuillLanguageTool from "quill-languagetool";
 * registerQuillLanguageTool(Quill);
 * ```
 *
 * @param Quill Quill static instance.
 */
export default function registerQuillLanguageTool(Quill: any) {
  debug("Registering QuillLanguageTool module for Quill instance");
  Quill.register({
    "modules/languageTool": QuillLanguageTool,
    "formats/ltmatch": createSuggestionBlotForQuillInstance(Quill),
  });
}

export { getCleanedHtml, removeSuggestionBoxes } from "./SuggestionBoxes";
