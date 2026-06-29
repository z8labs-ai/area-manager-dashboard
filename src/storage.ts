import type { CompletionStatus, StoreNotes } from "./types";

const notesKey = "areaManagerDashboard:storeNotes";

export function getCurrentMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function completionKey(monthKey: string) {
  return `areaManagerDashboard:walkStatus:${monthKey}`;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadCompletionStatus(monthKey: string): CompletionStatus {
  return readJson<CompletionStatus>(completionKey(monthKey), {});
}

export function saveCompletionStatus(monthKey: string, status: CompletionStatus) {
  writeJson(completionKey(monthKey), status);
}

export function loadStoreNotes(): StoreNotes {
  return readJson<StoreNotes>(notesKey, {});
}

export function saveStoreNotes(notes: StoreNotes) {
  writeJson(notesKey, notes);
}
