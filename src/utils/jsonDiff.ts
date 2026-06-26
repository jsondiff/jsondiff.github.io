export type DiffType =
  | "missing-left"
  | "missing-right"
  | "type-mismatch"
  | "value-mismatch";

export interface Difference {
  id: number;
  type: DiffType;
  path: string;
  leftValue?: unknown;
  rightValue?: unknown;
  label: string;
  description: string;
}

function getType(val: unknown): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}

function formatValue(val: unknown): string {
  if (val === undefined) return "undefined";
  if (val === null) return "null";
  if (typeof val === "string") return `"${val}"`;
  if (typeof val === "object")
    return Array.isArray(val) ? "[Array]" : "{Object}";
  return String(val);
}

let idCounter = 0;

function collectDiffs(
  left: unknown,
  right: unknown,
  path: string,
  diffs: Difference[],
): void {
  const leftType = getType(left);
  const rightType = getType(right);

  if (leftType !== rightType) {
    diffs.push({
      id: idCounter++,
      type: "type-mismatch",
      path,
      leftValue: left,
      rightValue: right,
      label: path || "(root)",
      description: `Type mismatch: left is ${leftType}, right is ${rightType}`,
    });
    return;
  }

  if (leftType === "object" && left !== null && right !== null) {
    const leftObj = left as Record<string, unknown>;
    const rightObj = right as Record<string, unknown>;
    const allKeys = new Set([
      ...Object.keys(leftObj),
      ...Object.keys(rightObj),
    ]);

    for (const key of allKeys) {
      const childPath = path ? `${path}.${key}` : key;
      if (!(key in leftObj)) {
        diffs.push({
          id: idCounter++,
          type: "missing-left",
          path: childPath,
          rightValue: rightObj[key],
          label: key,
          description: `Missing property ${key} from the object on the left side`,
        });
      } else if (!(key in rightObj)) {
        diffs.push({
          id: idCounter++,
          type: "missing-right",
          path: childPath,
          leftValue: leftObj[key],
          label: key,
          description: `Missing property ${key} from the object on the right side`,
        });
      } else {
        collectDiffs(leftObj[key], rightObj[key], childPath, diffs);
      }
    }
    return;
  }

  if (leftType === "array") {
    const leftArr = left as unknown[];
    const rightArr = right as unknown[];
    const maxLen = Math.max(leftArr.length, rightArr.length);
    for (let i = 0; i < maxLen; i++) {
      const childPath = `${path}[${i}]`;
      if (i >= leftArr.length) {
        diffs.push({
          id: idCounter++,
          type: "missing-left",
          path: childPath,
          rightValue: rightArr[i],
          label: `[${i}]`,
          description: `Missing array item at index ${i} on the left side`,
        });
      } else if (i >= rightArr.length) {
        diffs.push({
          id: idCounter++,
          type: "missing-right",
          path: childPath,
          leftValue: leftArr[i],
          label: `[${i}]`,
          description: `Missing array item at index ${i} on the right side`,
        });
      } else {
        collectDiffs(leftArr[i], rightArr[i], childPath, diffs);
      }
    }
    return;
  }

  if (left !== right) {
    diffs.push({
      id: idCounter++,
      type: "value-mismatch",
      path,
      leftValue: left,
      rightValue: right,
      label: path || "(root)",
      description: `Value mismatch: left is ${formatValue(left)}, right is ${formatValue(right)}`,
    });
  }
}

export function computeDiff(leftJson: string, rightJson: string): Difference[] {
  idCounter = 0;
  const leftObj = JSON.parse(leftJson);
  const rightObj = JSON.parse(rightJson);
  const diffs: Difference[] = [];
  collectDiffs(leftObj, rightObj, "", diffs);
  return diffs;
}

// ─── Annotated line rendering ───────────────────────────────────────────────

export type LineStatus = "normal" | "added" | "removed" | "changed" | "missing";

export interface AnnotatedLine {
  lineNumber: number;
  content: string;
  status: LineStatus;
  diffId?: number;
}

/** Returns a set of paths that are marked on a given side */
function buildHighlightedPaths(
  diffs: Difference[],
  side: "left" | "right",
): Map<string, { status: LineStatus; diffId: number }> {
  const map = new Map<string, { status: LineStatus; diffId: number }>();
  for (const diff of diffs) {
    if (diff.type === "missing-right" && side === "left") {
      map.set(diff.path, { status: "removed", diffId: diff.id });
    } else if (diff.type === "missing-left" && side === "right") {
      map.set(diff.path, { status: "added", diffId: diff.id });
    } else if (
      diff.type === "type-mismatch" ||
      diff.type === "value-mismatch"
    ) {
      map.set(diff.path, { status: "changed", diffId: diff.id });
    }
  }
  return map;
}

function annotateLines(
  obj: unknown,
  highlighted: Map<string, { status: LineStatus; diffId: number }>,
  currentPath: string,
  lines: AnnotatedLine[],
  indent: number,
): void {
  const pad = "  ".repeat(indent);
  const highlight = highlighted.get(currentPath);

  if (obj === null || typeof obj !== "object") {
    const content = JSON.stringify(obj);
    lines.push({
      lineNumber: lines.length + 1,
      content: `${pad}${content}`,
      status: highlight?.status ?? "normal",
      diffId: highlight?.diffId,
    });
    return;
  }

  if (Array.isArray(obj)) {
    lines.push({
      lineNumber: lines.length + 1,
      content: `${pad}[`,
      status: "normal",
    });
    obj.forEach((item, i) => {
      const childPath = currentPath ? `${currentPath}[${i}]` : `[${i}]`;
      const childHighlight = highlighted.get(childPath);
      const isLast = i === obj.length - 1;
      if (item !== null && typeof item === "object") {
        annotateLines(item, highlighted, childPath, lines, indent + 1);
        if (!isLast) {
          const last = lines[lines.length - 1];
          lines[lines.length - 1] = { ...last, content: last.content + "," };
        }
      } else {
        lines.push({
          lineNumber: lines.length + 1,
          content: `${"  ".repeat(indent + 1)}${JSON.stringify(item)}${isLast ? "" : ","}`,
          status: childHighlight?.status ?? "normal",
          diffId: childHighlight?.diffId,
        });
      }
    });
    lines.push({
      lineNumber: lines.length + 1,
      content: `${pad}]`,
      status: "normal",
    });
    return;
  }

  const entries = Object.entries(obj as Record<string, unknown>);
  lines.push({
    lineNumber: lines.length + 1,
    content: `${pad}{`,
    status: "normal",
  });
  entries.forEach(([key, value], i) => {
    const childPath = currentPath ? `${currentPath}.${key}` : key;
    const childHighlight = highlighted.get(childPath);
    const isLast = i === entries.length - 1;
    const keyStr = `${"  ".repeat(indent + 1)}"${key}": `;

    if (value !== null && typeof value === "object") {
      const keyLine: AnnotatedLine = {
        lineNumber: lines.length + 1,
        content: keyStr,
        status: childHighlight?.status ?? "normal",
        diffId: childHighlight?.diffId,
      };
      lines.push(keyLine);
      annotateLines(value, highlighted, childPath, lines, indent + 1);
      if (!isLast) {
        const last = lines[lines.length - 1];
        lines[lines.length - 1] = { ...last, content: last.content + "," };
      }
    } else {
      lines.push({
        lineNumber: lines.length + 1,
        content: `${keyStr}${JSON.stringify(value)}${isLast ? "" : ","}`,
        status: childHighlight?.status ?? "normal",
        diffId: childHighlight?.diffId,
      });
    }
  });
  lines.push({
    lineNumber: lines.length + 1,
    content: `${pad}}`,
    status: "normal",
  });
}

export function buildAnnotatedLines(
  jsonStr: string,
  diffs: Difference[],
  side: "left" | "right",
): AnnotatedLine[] {
  const obj = JSON.parse(jsonStr);
  const highlighted = buildHighlightedPaths(diffs, side);
  const lines: AnnotatedLine[] = [];
  annotateLines(obj, highlighted, "", lines, 0);
  return lines;
}
