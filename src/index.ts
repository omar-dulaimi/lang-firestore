import { completeFromList } from "@codemirror/autocomplete";
import {
    IndentContext,
    LanguageSupport,
    StreamLanguage,
    StringStream,
} from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// Firestore keywords and operators we want to recognize
const firestoreApi = [
  "db",
  "collection",
  "doc",
  "where",
  "orderBy",
  "limit",
  "limitToLast",
  "startAt",
  "startAfter",
  "endAt",
  "endBefore",
  "get",
  "add",
  "set",
  "update",
  "delete",
] as const;

const opWords = [
  "in",
  "not-in",
  "array-contains",
  "array-contains-any",
];

const keywordSet = new Set<string>(firestoreApi);
const opWordSet = new Set<string>(opWords);

function readIdentifier(stream: StringStream): string | null {
  const match = stream.match(/^[A-Za-z_][\w-]*/);
  if (!match) return null;
  if (match === true) {
    // Some overloads return true when only testing; in practice this path won't happen for regex
    return null;
  }
  return match[0] ?? null;
}

// Exposed tokenizer used by the StreamLanguage and tests
export function firestoreToken(stream: StringStream, state: any = {}): string | null {
  if (stream.eatSpace()) return null;

  // Strings (single or double quoted)
  if (stream.match(/^"(?:[^\\"]|\\.)*"/) || stream.match(/^'(?:[^\\']|\\.)*'/)) {
    return "string";
  }

  // Numbers
  if (stream.match(/^[0-9]+(?:\.[0-9]+)?/)) {
    return "number";
  }

  // Punctuation
  if (stream.match(/^\./)) return "punctuation";
  if (stream.match(/^[(),]/)) return "punctuation";

  // Comparison operators
  if (stream.match(/^(==|!=|<=|>=|<|>)/)) return "operator";

  // Identifiers, keywords, and operator words
  const id = readIdentifier(stream);
  if (id) {
    if (id === "true" || id === "false" || id === "null") return "atom";
    if (id === "db") return "namespace";
    if (keywordSet.has(id)) return "function";
    if (opWordSet.has(id)) return "operator";
    return "variableName";
  }

  // Fallback
  stream.next();
  return null;
}

export const FireStoreLanguage = StreamLanguage.define({
  name: "firestore",
  startState: (indentUnit: number) => {
    return {};
  },
  token: firestoreToken,
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
    function: t.function(t.variableName),
    namespace: t.namespace,
    operator: t.operator,
    string: t.string,
    number: t.number,
    punctuation: t.punctuation,
    atom: t.atom,
    variableName: t.variableName,
  },
});

export const FIRESTORE_COMPLETIONS = [
  { label: "db", type: "namespace" as const },
  { label: "collection", type: "function" as const },
  { label: "doc", type: "function" as const },
  { label: "where", type: "function" as const },
  { label: "orderBy", type: "function" as const },
  { label: "limit", type: "function" as const },
  { label: "limitToLast", type: "function" as const },
  { label: "startAt", type: "function" as const },
  { label: "startAfter", type: "function" as const },
  { label: "endAt", type: "function" as const },
  { label: "endBefore", type: "function" as const },
  { label: "get", type: "function" as const },
  { label: "add", type: "function" as const },
  { label: "set", type: "function" as const },
  { label: "update", type: "function" as const },
  { label: "delete", type: "function" as const },
  // where operators
  { label: "==", type: "operator" as const },
  { label: "!=", type: "operator" as const },
  { label: "<", type: "operator" as const },
  { label: "<=", type: "operator" as const },
  { label: ">", type: "operator" as const },
  { label: ">=", type: "operator" as const },
  { label: "in", type: "operator" as const },
  { label: "not-in", type: "operator" as const },
  { label: "array-contains", type: "operator" as const },
  { label: "array-contains-any", type: "operator" as const },
];

export const FireStoreCompletion = FireStoreLanguage.data.of({
  autocomplete: completeFromList(FIRESTORE_COMPLETIONS as any),
});

export function firestore() {
  return new LanguageSupport(FireStoreLanguage, [FireStoreCompletion]);
}

// Helper used in tests to quickly get token types from a single line
export function tokenizeLine(line: string): string[] {
  const tokens: string[] = [];
  const state: any = {};
  let remaining = line;
  // StringStream requires a line and a starting position; we recreate it after consumption
  while (remaining.length > 0) {
    const stream = new StringStream(remaining, 2, 2);
    const before = stream.pos;
    const style = firestoreToken(stream, state);
    const consumed = stream.pos - before;
    if (style) tokens.push(style);
    // Ensure we always consume at least 1 character to avoid infinite loops
    const toConsume = Math.max(consumed, 1);
    remaining = remaining.slice(toConsume);
  }
  return tokens;
}
