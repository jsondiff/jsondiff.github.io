export interface ComparisonHistoryEntry {
  id: string;
  name: string;
  leftText: string;
  rightText: string;
  createdAt: number;
  diffCount: number;
}
