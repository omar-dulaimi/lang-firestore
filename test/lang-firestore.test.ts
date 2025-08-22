import { describe, expect, it } from 'vitest';
import { FIRESTORE_COMPLETIONS, tokenizeLine } from '../src/index.js';

describe('tokenizer', () => {
  it('tokenizes a basic firestore query chain', () => {
    const line = "db.collection(\"users\").where(\"age\", \"==\", 21).orderBy(\"age\").limit(10).get()";
    const tokens = tokenizeLine(line);
    // Ensure key token categories are present in order
    expect(tokens).toContain('namespace'); // db
    expect(tokens).toContain('function'); // collection, where, limit, get
    expect(tokens).toContain('string'); // "users", "age"
    expect(tokens).toContain('number'); // 21, 10
    expect(tokens).toContain('punctuation'); // . , ( )
  });

  it('recognizes operators and operator words', () => {
    const line = "where(\"tags\", array-contains, \"blue\").where(\"v\", >=, 2)";
    const tokens = tokenizeLine(line);
    expect(tokens).toContain('operator');
  });
});

describe('completions', () => {
  it('includes core firestore API', () => {
    const labels = new Set(FIRESTORE_COMPLETIONS.map(c => c.label));
    for (const label of [
      'db', 'collection', 'doc', 'where', 'orderBy',
      'limit', 'limitToLast', 'startAt', 'startAfter',
      'endAt', 'endBefore', 'get', 'add', 'set', 'update', 'delete'
    ]) {
      expect(labels.has(label)).toBe(true);
    }
  });

  it('includes where operator words', () => {
    const labels = new Set(FIRESTORE_COMPLETIONS.map(c => c.label));
    for (const label of ['in', 'not-in', 'array-contains', 'array-contains-any']) {
      expect(labels.has(label)).toBe(true);
    }
  });
});
