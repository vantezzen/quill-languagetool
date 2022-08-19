# quill-languagetool

> LanguageTool integration for Quill.js editors

[![NPM](https://img.shields.io/npm/v/quill-languagetool.svg)](https://www.npmjs.com/package/quill-languagetool) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This library adds a [LanguageTool](https://languagetool.org/) integration to Quill.js editors. This allows adding spell checking and grammar checking to your editor.

## Demo

![Example video](https://raw.githubusercontent.com/vantezzen/quill-languagetool/master/assets/quill-lt-example.gif)

A live demo can be found at <https://vantezzen.github.io/quill-languagetool>. The source code for a complete example with react-quill can be found in `/example`.

## Features

- [x] LanguageTool integration
- [x] TypeScript typed
- [x] Easy integration with Quill.js
- [x] Custom server support
- [x] Custom CSS support
- [x] Server spam prevention

## Install

```bash
npm install --save quill-languagetool
```

## Usage

```tsx
import Quill from "quill";
import registerQuillLanguageTool from "quill-languagetool";

registerQuillLanguageTool(Quill);

const quill = new Quill("#editor", {
  theme: "snow",
  modules: {
    languageTool: true,
    // OR
    languageTool: {
      // options here
    },
  },
});
```

Using this module **will change** the contents of the editor to add control elements for spell checking and grammar checking. Look at ["Getting the contents of the editor"](#getting-the-contents-of-the-editor) for information on how to use the contents of the editor.

### registerQuillLanguageTool(Quill)

This package exports a default function to register the LanguageTool module to Quill.js.

```tsx
import Quill from "quill";
import registerQuillLanguageTool from "quill-languagetool";

registerQuillLanguageTool(Quill);
```

This adds the LanguageTool module and the suggestion blot element to Quill.js so they can be used on any editor using that Quill import.

### Options

Options can be provided into the `languageTool` option of the Quill module.

```tsx
const quill = new Quill("#editor", {
  theme: "snow",
  modules: {
    languageTool: {
      // options here
    },
  },
});
```

Available options are:

- `server` (default `"https://languagetool.org/api"`): The URL of the LanguageTool server without `/v2/check`
- `language` (default `"en-US"`): The language to use for the LanguageTool server
- `disableNativeSpellcheck` (default `true`): Disable the native spellchecker on the editor to prevent two conflicting systems trying to underline the same words
- `cooldownTime` (default `3000`): The time after a user stops typing before the LanguageTool server is queried
- `showLoadingIndicator` (default `true`): Show a loading indicator when the LanguageTool server is queried in the bottom right corner of the editor
- `apiOptions` (default `{}`): Options to pass to the LanguageTool server (e.g. API Key, disabled rules, picky level etc.). Take a look at https://languagetool.org/http-api/#!/default/post_check for all options.
  - Do not set `text`, `data` or `language` in the `apiOptions` as these are set automatically.

### Server

By default, the official LanguageTool server is used. Please note that you may be rate-limited when using the server and you need to comply with LanguageTool's [ProofReading API Terms](https://dev.languagetool.org/public-http-api).

If you plan on using the library for larger sites, please consider using your own server. Check out <https://github.com/smarketer-de/languagetool-docker-compose> for an easy-to-use LanguageTool setup for Docker and AWS Elastic Beanstalk.

### cooldownTime

To prevent spamming the LanguageTool server, a cooldown time is used. By default, this is set to 3000 milliseconds so the server is queries only once the user stopped typing 3s ago.

### Getting the contents of the editor

This library adds a custom blot element to the editor that is used to add formatting and click listeners.
This transforms content like this:

```html
<p>This text conatins typos,, that should get corrected by LanguageTool</p>
```

into this:

```html
<p>
  This text
  <quill-lt-match
    data-offset="10"
    data-length="8"
    data-rule-id="MORFOLOGIK_RULE_EN_US"
  >
    conatins
  </quill-lt-match>
  typos
  <quill-lt-match
    data-offset="24"
    data-length="2"
    data-rule-id="DOUBLE_PUNCTUATION"
  >
    ,,
  </quill-lt-match>
  that should get corrected by LanguageTool
</p>
```

When getting the contents of the editor, the custom blot elements need to be removed. For this, the library exposes a `getCleanedHtml` method that removes the elements from an HTML string.

```tsx
import { getCleanedHtml } from "quill-languagetool";

const dirtyContents = quill.root.innerHTML;
const cleanedContents = getCleanedHtml(quillHtml);
```

Alternatively, `removeSuggestionBoxes` can be used to remove the custom blot elements from the editor's content itself. Please note that this will trigger an update of the editor which will re-trigger the module to add them back again.

```tsx
import { removeSuggestionBoxes } from "quill-languagetool";

const quill = new Quill(...);
removeSuggestionBoxes(quill);
```

### Customizing design

By default, the library uses a simple, light-mode design for the suggestion boxes. By overriding the CSS classes used you can customize the design. Take a look at [`/src/QuillLanguageTool.css`](https://github.com/vantezzen/quill-languagetool/blob/master/src/QuillLanguageTool.css) for all styles and classes used by the default design

## Development

1. Clone this repository
2. Run `npm install` in the root directory and `/example` (`npm i && cd example && npm i`)
3. Run `npm start` in `/example` to start development using the example project

## License

MIT © [vantezzen](https://github.com/vantezzen)

---

This project is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
