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
};

export class QuillLanguageTool {
  static DEFAULTS: QuillLanguageToolParams = {
    server: "https://languagetool.org/api",
    language: "en-US",
  };

  protected typingCooldown?: NodeJS.Timeout;
  protected loopPreventionCooldown?: NodeJS.Timeout;
  protected boxes = new SuggestionBoxes(this);
  protected popups = new PopupManager(this);
  protected loader = new LoadingIndicator(this);

  public matches: MatchesEntity[] = [];

  constructor(public quill: Quill, public params: QuillLanguageToolParams) {
    debug("Attaching QuillLanguageTool to Quill instance", quill);

    this.quill.on("text-change", (_delta, _oldDelta, source) => {
      if (source === "user") {
        this.onTextChange();
      }
    });
    this.checkSpelling();
  }

  private onTextChange() {
    if (this.loopPreventionCooldown) return;
    if (this.typingCooldown) {
      clearTimeout(this.typingCooldown);
    }
    this.typingCooldown = setTimeout(() => {
      debug("User stopped typing, checking spelling");

      this.checkSpelling();
    }, 1000);
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
    if (json.matches) {
      this.matches = json.matches;

      debug("Adding suggestion boxes");
      this.boxes.addSuggestionBoxes(this.matches);
    } else {
      debug("No matches found");
      this.matches = [];
    }
    this.loader.stopLoading();
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

export default function registerQuillLanguageTool(Quill: any) {
  debug("Registering QuillLanguageTool module for Quill instance");
  Quill.register({
    "modules/languageTool": QuillLanguageTool,
    "formats/ltmatch": createSuggestionBlotForQuillInstance(Quill),
  });
}
