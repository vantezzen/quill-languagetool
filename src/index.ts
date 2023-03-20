import Quill from "quill"
import debug from "./debug"
import { SuggestionBoxes } from "./SuggestionBoxes"
import "./QuillSpellChecker.css"
import createSuggestionBlotForQuillInstance from "./SuggestionBlot"
import PopupManager from "./PopupManager"
import { SpellCheckerApi, MatchesEntity } from "./types"
import LoadingIndicator from "./LoadingIndicator"

export type QuillSpellCheckerParams = {
  disableNativeSpellcheck: boolean
  cooldownTime: number
  showLoadingIndicator: boolean
  api: SpellCheckerApi
}

/**
 * QuillSpellChecker is a Quill plugin that provides spellchecking and grammar checking
 * using the SpellChecker API.
 */
export class QuillSpellChecker {
  static DEFAULTS: QuillSpellCheckerParams = {
    api: {
      url: "https://languagetool.org/api/v2/check",
      body: (text: string) => {
        const body = {
          text,
          language: "auto",
        }
        return Object.keys(body)
          .map((key) => `${key}=${encodeURIComponent(body[key])}`)
          .join("&")
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      mode: "cors",
      mapResponse: async (response) => await response.json(),
    },
    disableNativeSpellcheck: true,
    cooldownTime: 3000,
    showLoadingIndicator: false,
  }

  protected typingCooldown?: NodeJS.Timeout

  // A loop is used to prevent suggestion updates from triggering a checkSpelling() call again.
  protected loopPreventionCooldown?: NodeJS.Timeout

  // Dependencies
  protected popups = new PopupManager(this)
  protected loader = new LoadingIndicator(this)

  public boxes = new SuggestionBoxes(this)
  public matches: MatchesEntity[] = []

  /**
   * Create a new QuillSpellChecker instance.
   *
   * @param quill Instance of the Qill editor.
   * @param params Options for the QuillSpellChecker instance.
   */
  constructor(public quill: Quill, public params: QuillSpellCheckerParams) {
    debug("Attaching QuillSpellChecker to Quill instance", quill)

    // not allow the insertion of images and texts with formatting
    quill.clipboard.addMatcher(Node.ELEMENT_NODE, function (node) {
      const plaintext = node.innerText
      const Delta = Quill.import("delta")
      return new Delta().insert(plaintext)
    })

    // break line using ctrl + enter
    this.quill.root.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && event.ctrlKey) {
        const selectionIndex = quill.getSelection()?.index
        if (typeof selectionIndex !== "undefined") {
          quill.insertText(selectionIndex, "\n")
          event.preventDefault()
        }
      }
    })

    // clear text when use ctrl + z
    this.quill.root.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "z") {
        this.quill.getModule("history").undo()
      }
    })

    this.quill.on("text-change", (_delta, _, source) => {
      if (source !== "silent") {
        this.onTextChange()
      }
    })

    this.checkSpelling()
    this.disableNativeSpellcheckIfSet()
  }

  private disableNativeSpellcheckIfSet() {
    if (this.params.disableNativeSpellcheck) {
      this.quill.root.setAttribute("spellcheck", "false")
    }
  }

  private onTextChange() {
    if (this.loopPreventionCooldown) return
    if (this.typingCooldown) {
      clearTimeout(this.typingCooldown)
    }
    this.typingCooldown = setTimeout(() => {
      debug("User stopped typing, checking spelling")

      this.checkSpelling()
    }, this.params.cooldownTime)
  }

  private async checkSpelling() {
    if (document.querySelector("spck-toolbar")) {
      debug("SpellChecker is installed as extension, not checking")
      return
    }

    const text = this.quill.getText()

    if (!text.replace(/[\n\t\r]/g, "").trim()) {
      return
    }

    debug("Removing existing suggestion boxes")
    this.boxes.removeSuggestionBoxes()

    debug("Checking spelling")
    this.loader.startLoading()
    const json = await this.getSpellCheckerResults(text)

    if (json && json.matches && json.matches.length > 0) {
      this.matches = json.matches.filter(
        (match) => match.replacements && match.replacements.length > 0
      )

      debug("Adding suggestion boxes")
      this.boxes.addSuggestionBoxes()
    } else {
      debug("No matches found")
      this.matches = []
    }
    this.loader.stopLoading()
  }

  private async getSpellCheckerResults(text: string) {
    try {
      const response = await fetch(this.params.api.url, {
        ...this.params.api,
        body: this.params.api.body(text),
      })
      return this.params.api.mapResponse(response)
    } catch (e) {
      console.error(e)
      return null
    }
  }

  public preventLoop() {
    if (this.loopPreventionCooldown) {
      clearTimeout(this.loopPreventionCooldown)
    }
    this.loopPreventionCooldown = setTimeout(() => {
      this.loopPreventionCooldown = undefined
    }, 100)
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
  debug("Registering QuillSpellChecker module for Quill instance")
  Quill.register({
    "modules/spellChecker": QuillSpellChecker,
    "formats/spck-match": createSuggestionBlotForQuillInstance(Quill),
  })
}

export { getCleanedHtml, removeSuggestionBoxes } from "./SuggestionBoxes"
