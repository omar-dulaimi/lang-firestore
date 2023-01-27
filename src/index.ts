import { completeFromList } from "@codemirror/autocomplete";
import {
  IndentContext,
  LanguageSupport,
  StreamLanguage,
  StringStream
} from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

export const FireStoreLanguage = StreamLanguage.define({
  name: "firestore",
  startState: (indentUnit: number) => {
    return {};
  },
  token: (stream: StringStream, state: any = {}): string | null => {
    if (stream.match("db")) {
      state.db = true;
      return "namespace";
    }

    if (stream.match("collection")) {
      if (state.db) {
        state.collection = true;
        return "function";
      }
    }
    if (stream.match("where")) {
      if (state.collection) {
        state.where = true;
        return "function";
      }
    }
    if (stream.match("limit")) {
      if (state.where) {
        state.limit = true;
        return "function";
      }
    }
    if (stream.match("get")) {
      if (state.limit) {
        state.limit = false;
        return "function";
      }
    }
    if (stream.match(/"(?:[^\\"]|\\.)*"/)) {
      if (state.collection) {
        return "string";
      }
      if (state.where) {
        state.where = false;
        state.whereValue = true;
        return "string";
      }
      if (state.whereValue) {
        state.whereValue = false;
        return "string";
      }
      if (stream.match("==")) {
        if (state.whereValue) {
          state.whereValue = false;
          state.whereOperator = true;
          return "operator";
        }
      }
      if (stream.match(/[0-9]+/)) {
        if (state.limit) {
          return "number";
        }
      }
    }
    stream.next();
    return null;
  },
  blankLine: (state: {}, indentUnit: number): void => {},
  copyState: (state: {}) => {},
  indent: (
    state: {},
    textAfter: string,
    context: IndentContext
  ): number | null => {
    return 1;
  },
  languageData: {
    commentTokens: { line: ";" },
  },
  tokenTable: {
    db: t.namespace,
    dot: t.punctuation,
    collection: t.function(t.variableName),
    where: t.function(t.variableName),
    limit: t.function(t.variableName),
    get: t.function(t.atom),
    lParen: t.punctuation,
    rParen: t.punctuation,
    string: t.string,
  },
});

export const FireStoreCompletion = FireStoreLanguage.data.of({
  autocomplete: completeFromList([
    { label: "db", type: "namespace" },
    { label: "collection", type: "function" },
    { label: "where", type: "function" },
    { label: "limit", type: "function" },
    { label: "get", type: "function" },
  ]),
});

export function firestore() {
  return new LanguageSupport(FireStoreLanguage, [FireStoreCompletion]);
}
