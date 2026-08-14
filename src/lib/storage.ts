import type { Answers } from "./scoring";

export interface StoredResult {
  answers: Answers;
  date: string;
}

interface Store {
  latest: StoredResult | null;
  history: StoredResult[];
}

const KEY = "camphermes.rank.v1";

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { latest: null, history: [] };
    const parsed = JSON.parse(raw) as Store;
    return {
      latest: parsed.latest ?? null,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return { latest: null, history: [] };
  }
}

export function loadResult(): StoredResult | null {
  return read().latest;
}

export function previousResult(): StoredResult | null {
  const { history } = read();
  return history.length ? history[history.length - 1] : null;
}

// Saving pushes the old latest into history, so an abandoned retake keeps
// the previous result and a finished retake can show the delta against it.
export function saveResult(answers: Answers): void {
  try {
    const store = read();
    if (store.latest) store.history.push(store.latest);
    store.history = store.history.slice(-20);
    store.latest = { answers, date: new Date().toISOString().slice(0, 10) };
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Private mode or full storage: the result still renders, it just won't persist.
  }
}
