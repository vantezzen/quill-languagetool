# quill-languagetool

> LanguageTool integration for Quill.js editors

[![NPM](https://img.shields.io/npm/v/quill-languagetool.svg)](https://www.npmjs.com/package/quill-languagetool) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save quill-languagetool
```

## Usage

```tsx
import * as React from "react";

import { useMyHook } from "quill-languagetool";

const Example = () => {
  const example = useMyHook();
  return <div>{example}</div>;
};
```

## Development

1. Clone this repository
2. Run `npm install` in the root directory and `/example` (`npm i && cd example && npm i`)
3. Run `npm start` in `/example` to start development using the example project

## License

MIT © [vantezzen](https://github.com/vantezzen)

---

This project is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
