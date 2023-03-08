import type Quill from "quill";
import debug from "./debug";
import { SuggestionBoxes } from "./SuggestionBoxes";
import "./QuillSpellChecker.css";
import createSuggestionBlotForQuillInstance from "./SuggestionBlot";
import PopupManager from "./PopupManager";
import { SpellCheckerApi, SpellCheckerApiParams, MatchesEntity } from "./types";
import LoadingIndicator from "./LoadingIndicator";

export type QuillSpellCheckerParams = {
  server?: string;
  language: string;
  disableNativeSpellcheck: boolean;
  cooldownTime: number;
  showLoadingIndicator: boolean;
  apiOptions?: Partial<SpellCheckerApiParams>;
};

/**
 * QuillSpellChecker is a Quill plugin that provides spellchecking and grammar checking
 * using the SpellChecker API.
 */
export class QuillSpellChecker {
  static DEFAULTS: QuillSpellCheckerParams = {
    language: "en-US",
    disableNativeSpellcheck: true,
    cooldownTime: 3000,
    showLoadingIndicator: true,
    apiOptions: {},
  };

  protected typingCooldown?: NodeJS.Timeout;

  // A loop is used to prevent suggestion updates from triggering a checkSpelling() call again.
  protected loopPreventionCooldown?: NodeJS.Timeout;

  // Dependencies
  protected popups = new PopupManager(this);
  protected loader = new LoadingIndicator(this);
  
  public boxes = new SuggestionBoxes(this);
  public matches: MatchesEntity[] = [];

  /**
   * Create a new QuillSpellChecker instance.
   *
   * @param quill Instance of the Qill editor.
   * @param params Options for the QuillSpellChecker instance.
   */
  constructor(public quill: Quill, public params: QuillSpellCheckerParams) {
    debug("Attaching QuillSpellChecker to Quill instance", quill);

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
      debug("SpellChecker is installed as extension, not checking");
      return;
    }

    debug("Checking spelling");
    this.loader.startLoading();
    const json = await this.getSpellCheckerResults();

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

  private async getSpellCheckerResults() {
    const params = this.getApiParams();

    try {
      const response = await fetch(this.params.server + "/v2/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        mode: "cors",
        body: params,
      });
      const json = (await response.json()) as SpellCheckerApi;
      return json;
    } catch (e) {
      return null;
    }
  }

  private getApiParams() {
    const paramsObject = {
      text: this.quill.getText(),
      language: this.params.language,
      ...this.params.apiOptions,
    };

    return Object.keys(paramsObject)
      .map((key) => `${key}=${encodeURIComponent(paramsObject[key])}`)
      .join("&");
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
 * Register all QuillSpellChecker modules with Quill.
 *
 * This needs access to the exact Quill static instance
 * you will be using in your application.
 *
 * Example:
 * ```
 * import Quill from "quill";
 * import registerQuillSpellChecker from "react-quill-spell-checker";
 * registerQuillSpellChecker(Quill);
 * ```
 *
 * @param Quill Quill static instance.
 */
export default function registerQuillSpellChecker(Quill: any) {
  debug("Registering QuillSpellChecker module for Quill instance");
  Quill.register({
    "modules/spellChecker": QuillSpellChecker,
    "formats/ltmatch": createSuggestionBlotForQuillInstance(Quill),
  });
}

export { getCleanedHtml, removeSuggestionBoxes } from "./SuggestionBoxes";
