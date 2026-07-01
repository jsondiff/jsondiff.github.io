import { useState, useEffect, useCallback } from "react";
import type { ComparisonHistoryEntry } from "../types/comparisonHistory";
import {
  loadHistory,
  addEntry,
  updateEntryName,
  deleteEntry,
  generateUntitledName,
} from "../utils/historyStorage";

export function useComparisonHistory() {
  const [entries, setEntries] = useState<ComparisonHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  const saveComparison = useCallback(
    (
      leftText: string,
      rightText: string,
      diffCount: number,
      name?: string,
    ) => {
      const current = loadHistory();
      const entryName = name?.trim() || generateUntitledName(current);
      const updated = addEntry({
        name: entryName,
        leftText,
        rightText,
        diffCount,
      });
      setEntries(updated);
      return updated[0];
    },
    [],
  );

  const rename = useCallback((id: string, name: string) => {
    const updated = updateEntryName(id, name);
    setEntries(updated);
  }, []);

  const remove = useCallback((id: string) => {
    const updated = deleteEntry(id);
    setEntries(updated);
  }, []);

  return { entries, saveComparison, rename, remove };
}
