<p align="center">
  <h3 align="center">lang-firestore</h3>
  <p align="center">
    Firestore query language support for the <a href="https://codemirror.net/6/">CodeMirror</a> editor.
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/lang-firestore"><img alt="npm version" src="https://img.shields.io/npm/v/lang-firestore.svg"></a>
  <a href="https://www.npmjs.com/package/lang-firestore"><img alt="npm downloads" src="https://img.shields.io/npm/dt/lang-firestore.svg"></a>
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/npm/l/lang-firestore.svg"></a>
  <a href="https://github.com/sponsors/omar-dulaimi"><img alt="GitHub Sponsors" src="https://img.shields.io/badge/Sponsor-💖-ea4aaa?logo=github"></a>
</p>

## Install

```bash
npm install lang-firestore
```

## Usage

```ts
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { firestore } from "lang-firestore";

new EditorView({
  state: EditorState.create({
    doc: 'db.collection("users").where("age", ">=", 21).get()',
    extensions: [basicSetup, firestore()],
  }),
  parent: document.querySelector("#app")!,
});
```

## Features

- Syntax highlighting for common Firestore query chains (db, collection, doc, where, orderBy, limit, pagination, mutations)
- Operator words: `in`, `not-in`, `array-contains`, `array-contains-any`
- Basic completions for Firestore API and operators

## Contributing

PRs welcome. Run tests and build locally:

```bash
npm i
npm run test
npm run build
```

## Sponsor

If you find this useful, consider sponsoring: <a href="https://github.com/sponsors/omar-dulaimi">github.com/sponsors/omar-dulaimi</a>

## License

MIT
