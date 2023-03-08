# react-quill-spell-checker

> Integrate any spell checker on Quill.js editor

[![NPM](https://img.shields.io/npm/v/react-quill-spell-checker.svg)](https://www.npmjs.com/package/react-quill-spell-checker) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Demo

![Example video](https://raw.githubusercontent.com/andersoncoder/react-quill-spell-checker/master/assets/quill-spck-example.gif)

A live demo can be found at <https://andersoncoder.github.io/react-quill-spell-checker>. The source code for a complete example with react-quill can be found in `/example`.

## Features

- [x] SpellChecker integration
- [x] TypeScript typed
- [x] Easy integration with Quill.js
- [x] Custom server support
- [x] Custom CSS support
- [x] Server spam prevention

## Install

```bash
npm install --save react-quill-spell-checker
```

## Usage

```tsx
import Quill from 'quill'
import registerQuillSpellChecker from 'react-quill-spell-checker'

registerQuillSpellChecker(Quill)

const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    spellChecker: {
      // options here
    }
  }
})
```

Using this module **will change** the contents of the editor to add control elements for spell checking and grammar checking. Look at ["Getting the contents of the editor"](#getting-the-contents-of-the-editor) for information on how to use the contents of the editor.

### registerQuillSpellChecker(Quill)

This package exports a default function to register the SpellChecker module to Quill.js.

```tsx
import Quill from 'quill'
import registerQuillSpellChecker from 'react-quill-spell-checker'

registerQuillSpellChecker(Quill)
```

This adds the SpellChecker module and the suggestion blot element to Quill.js so they can be used on any editor using that Quill import.

### Options

Options can be provided into the `spellChecker` option of the Quill module.

```tsx
const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    spellChecker: {
      // options here
    }
  }
})
```

Available options are:

- `server`: The URL of the Spell Checker server
- `language` (default `"en-US"`): The language to use for the SpellChecker server
- `disableNativeSpellcheck` (default `true`): Disable the native spellchecker on the editor to prevent two conflicting systems trying to underline the same words
- `cooldownTime` (default `3000`): The time after a user stops typing before the SpellChecker server is queried
- `showLoadingIndicator` (default `true`): Show a loading indicator when the SpellChecker server is queried in the bottom right corner of the editor
- `apiOptions` (default `{}`): Options to pass to the SpellChecker server (e.g. API Key, disabled rules, picky level etc.).
  - Do not set `text`, `data` or `language` in the `apiOptions` as these are set automatically.

### Server

You can use any spell checker API, if you plan on using the library for larger sites, please consider using your own server.

### cooldownTime

To prevent spamming the server, a cooldown time is used. By default, this is set to 3000 milliseconds so the server is queries only once the user stopped typing 3s ago.

### Getting the contents of the editor

This library adds a custom blot element to the editor that is used to add formatting and click listeners.
This transforms content like this:

```html
<p>This text conatins typos,, that should get corrected by SpellChecker</p>
```

into this:

```html
<p>
  This text
  <quill-spck-match
    data-offset="10"
    data-length="8"
    data-rule-id="MORFOLOGIK_RULE_EN_US"
  >
    conatins
  </quill-spck-match>
  typos
  <quill-spck-match
    data-offset="24"
    data-length="2"
    data-rule-id="DOUBLE_PUNCTUATION"
  >
    ,,
  </quill-spck-match>
  that should get corrected by SpellChecker
</p>
```

When getting the contents of the editor, the custom blot elements need to be removed. For this, the library exposes a `getCleanedHtml` method that removes the elements from an HTML string.

```tsx
import { getCleanedHtml } from 'react-quill-spell-checker'

const dirtyContents = quill.root.innerHTML
const cleanedContents = getCleanedHtml(quillHtml)
```

Alternatively, `removeSuggestionBoxes` can be used to remove the custom blot elements from the editor's content itself. Please note that this will trigger an update of the editor which will re-trigger the module to add them back again.

```tsx
import { removeSuggestionBoxes } from "react-quill-spell-checker";

const quill = new Quill(...);
removeSuggestionBoxes(quill);
```

### Customizing design

By default, the library uses a simple, light-mode design for the suggestion boxes. By overriding the CSS classes used you can customize the design. Take a look at [`/src/QuillSpellChecker.css`](https://github.com/andersoncoder/react-quill-spell-checker/blob/master/src/QuillSpellChecker.css) for all styles and classes used by the default design

## Development

1. Clone this repository
2. Run `npm install` in the root directory and `/example` (`npm i && cd example && npm i`)
3. Run `npm start` in `/example` to start development using the example project

## License

MIT © [vantezzen](https://github.com/vantezzen)

---

This project is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
