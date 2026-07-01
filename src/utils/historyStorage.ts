import type { ComparisonHistoryEntry } from "../types/comparisonHistory";

const STORAGE_KEY = "jsondiff-comparison-history";
const MAX_ENTRIES = 50;

function readRaw(): ComparisonHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ComparisonHistoryEntry[];
  } catch {
    return [];
  }
}

export function loadHistory(): ComparisonHistoryEntry[] {
  return readRaw().sort((a, b) => b.createdAt - a.createdAt);
}

function persist(entries: ComparisonHistoryEntry[]): ComparisonHistoryEntry[] {
  const trimmed = entries
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return trimmed;
}

export function generateUntitledName(entries: ComparisonHistoryEntry[]): string {
  let max = 0;
  for (const entry of entries) {
    const match = entry.name.match(/^Untitled (\d+)$/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return `Untitled ${max + 1}`;
}

export function addEntry(
  entry: Omit<ComparisonHistoryEntry, "id" | "createdAt"> & {
    id?: string;
    createdAt?: number;
  },
): ComparisonHistoryEntry[] {
  const existing = readRaw();
  const newEntry: ComparisonHistoryEntry = {
    id: entry.id ?? crypto.randomUUID(),
    name: entry.name,
    leftText: entry.leftText,
    rightText: entry.rightText,
    diffCount: entry.diffCount,
    createdAt: entry.createdAt ?? Date.now(),
  };
  return persist([newEntry, ...existing]);
}

export function updateEntryName(
  id: string,
  name: string,
): ComparisonHistoryEntry[] {
  const trimmed = name.trim();
  if (!trimmed) return loadHistory();
  const entries = readRaw().map((e) =>
    e.id === id ? { ...e, name: trimmed } : e,
  );
  return persist(entries);
}

export function deleteEntry(id: string): ComparisonHistoryEntry[] {
  return persist(readRaw().filter((e) => e.id !== id));
}

export function formatHistoryDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
