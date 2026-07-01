import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Alert,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import HistoryIcon from "@mui/icons-material/History";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import {
  computeDiff,
  buildAnnotatedLines,
  type Difference,
  type DiffType,
} from "../utils/jsonDiff";
import DiffCodePanel from "./DiffCodePanel";
import DiffSidebar from "./DiffSidebar";
import ComparisonHistoryPanel from "./ComparisonHistoryPanel";
import JsonFormatTab from "./JsonFormatTab";
import { useComparisonHistory } from "../hooks/useComparisonHistory";
import type { ComparisonHistoryEntry } from "../types/comparisonHistory";
import { APP_VERSION } from "../version";

type AppTab = "diff" | "format";

const SAMPLE_LEFT = JSON.stringify(
  {
    "Aidan Gillen": {
      aboolean: true,
      array: ["Game of Thron\\es", "The Wire"],
      boolean: true,
      int: 2,
      object: {
        foo: "bar",
        object1: { "new prop1": "new prop value" },
        object2: { "new prop1": "new prop value" },
        object3: { "new prop1": "new prop value" },
        object4: { "new prop1": "new prop value" },
      },
      string: "some string",
    },
    "Alexander Skarsgard": ["Generation Kill", "True Blood"],
    "Amy Ryan": { one: "In Treatment", two: "The Wire" },
    "Annie Fitzgerald": ["Big Love", "True Blood"],
    "Anwan Glover": ["Treme", "The Wire"],
    "Clarke Peters": null,
  },
  null,
  2,
);

const SAMPLE_RIGHT = JSON.stringify(
  {
    "Aidan Gillen": {
      aboolean: "true",
      array: ["Game of Thrones", "The Wire"],
      boolean: false,
      int: "2",
      object: { foo: "bar" },
      otherint: 4,
      string: "some string",
    },
    "Alexander Skarsg?rd": ["Generation Kill", "True Blood"],
    "Alice Farmer": ["The Corner", "Oz", "The Wire"],
    "Amy Ryan": ["In Treatment", "The Wire"],
    "Annie Fitzgerald": ["True Blood", "Big Love", "The Sopranos", "Oz"],
    "Anwan Glover": ["Treme", "The Wire"],
  },
  null,
  2,
);

const JsonDiffApp: React.FC = () => {
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [differences, setDifferences] = useState<Difference[]>([]);
  const [hasCompared, setHasCompared] = useState(false);
  const [activeDiffIndex, setActiveDiffIndex] = useState(0);
  const [filters, setFilters] = useState<Record<DiffType, boolean>>({
    "missing-left": true,
    "missing-right": true,
    "type-mismatch": true,
    "value-mismatch": true,
  });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>("diff");

  const { entries: historyEntries, saveComparison, rename, remove } =
    useComparisonHistory();

  const visibleDiffs = differences.filter((d) => filters[d.type]);
  const activeDiff = visibleDiffs[activeDiffIndex];

  const handleCompare = useCallback(() => {
    setError(null);
    try {
      JSON.parse(leftText || "{}");
    } catch {
      setError("Left JSON is invalid. Please fix the syntax and try again.");
      return;
    }
    try {
      JSON.parse(rightText || "{}");
    } catch {
      setError("Right JSON is invalid. Please fix the syntax and try again.");
      return;
    }
    const diffs = computeDiff(leftText || "{}", rightText || "{}");
    setDifferences(diffs);
    setHasCompared(true);
    setActiveDiffIndex(0);
    saveComparison(leftText || "{}", rightText || "{}", diffs.length);
  }, [leftText, rightText, saveComparison]);

  const loadHistoryView = useCallback((entry: ComparisonHistoryEntry) => {
    setLeftText(entry.leftText);
    setRightText(entry.rightText);
    const diffs = computeDiff(entry.leftText, entry.rightText);
    setDifferences(diffs);
    setHasCompared(true);
    setActiveDiffIndex(0);
    setError(null);
  }, []);

  const loadHistoryEdit = useCallback((entry: ComparisonHistoryEntry) => {
    setLeftText(entry.leftText);
    setRightText(entry.rightText);
    setDifferences([]);
    setHasCompared(false);
    setActiveDiffIndex(0);
    setError(null);
  }, []);

  const handleReset = () => {
    setLeftText("");
    setRightText("");
    setDifferences([]);
    setHasCompared(false);
    setError(null);
    setActiveDiffIndex(0);
  };

  const loadSample = () => {
    setLeftText(SAMPLE_LEFT);
    setRightText(SAMPLE_RIGHT);
    setHasCompared(false);
    setDifferences([]);
    setError(null);
  };

  const handleFilterChange = (type: DiffType, checked: boolean) => {
    setFilters((prev) => ({ ...prev, [type]: checked }));
    setActiveDiffIndex(0);
  };

  const handleActivate = (id: number) => {
    const idx = visibleDiffs.findIndex((d) => d.id === id);
    if (idx !== -1) setActiveDiffIndex(idx);
  };

  const leftLines = hasCompared
    ? buildAnnotatedLines(leftText || "{}", differences, "left")
    : [];
  const rightLines = hasCompared
    ? buildAnnotatedLines(rightText || "{}", differences, "right")
    : [];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* ── Top Bar (title + tabs + actions) ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 0.75,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          boxShadow: 2,
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, letterSpacing: "-0.3px", whiteSpace: "nowrap" }}
        >
          JSON Diff Tool
        </Typography>
        <Tooltip
          title={`Release ${APP_VERSION} — Compare, Format & Tree, and History`}
        >
          <Chip
            label={`v${APP_VERSION}`}
            size="small"
            sx={{
              height: 20,
              fontSize: 10,
              fontWeight: 600,
              bgcolor: "rgba(255,255,255,0.2)",
              color: "inherit",
              "& .MuiChip-label": { px: 0.75 },
            }}
          />
        </Tooltip>

        <Tabs
          value={activeTab}
          onChange={(_, v) => {
            setActiveTab(v);
            if (v === "format") setHistoryOpen(false);
          }}
          sx={{
            minHeight: 36,
            ml: 0.5,
            "& .MuiTabs-indicator": {
              backgroundColor: "rgba(255,255,255,0.95)",
              height: 2,
            },
            "& .MuiTab-root": {
              color: "rgba(255,255,255,0.72)",
              minHeight: 36,
              minWidth: 0,
              px: 1.5,
              py: 0.5,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13,
              "&.Mui-selected": { color: "#fff" },
            },
          }}
        >
          <Tab
            icon={<CompareArrowsIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Compare"
            value="diff"
          />
          <Tab
            icon={<AccountTreeIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Format & Tree"
            value="format"
          />
        </Tabs>

        <Box sx={{ flexGrow: 1 }} />

        {activeTab === "diff" && (
          <Tooltip title="Comparison history">
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setHistoryOpen((o) => !o)}
              aria-label="Toggle history"
            >
              <Badge
                badgeContent={historyEntries.length}
                color="secondary"
                max={99}
                invisible={historyEntries.length === 0}
              >
                <HistoryIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
        )}
        <Typography
          variant="caption"
          sx={{ opacity: 0.75, display: { xs: "none", sm: "block" } }}
        >
          jsondiff.github.io
        </Typography>
      </Box>

      {/* ── Diff Navigation Bar (only after compare) ── */}
      {activeTab === "diff" && hasCompared && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 3,
            py: 1,
            bgcolor: "#ffffff",
            borderBottom: "1px solid #e0e0e0",
            gap: 2,
            flexShrink: 0,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {differences.length === 0
              ? "✓ No differences found"
              : `Found ${differences.length} difference${differences.length !== 1 ? "s" : ""}`}
          </Typography>

          {visibleDiffs.length > 0 && (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  ml: "auto",
                }}
              >
                <IconButton
                  size="small"
                  disabled={activeDiffIndex === 0}
                  onClick={() => setActiveDiffIndex((i) => i - 1)}
                >
                  <NavigateBeforeIcon fontSize="small" />
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{ minWidth: 60, textAlign: "center" }}
                >
                  {activeDiffIndex + 1} of {visibleDiffs.length}
                </Typography>
                <IconButton
                  size="small"
                  disabled={activeDiffIndex === visibleDiffs.length - 1}
                  onClick={() => setActiveDiffIndex((i) => i + 1)}
                >
                  <NavigateNextIcon fontSize="small" />
                </IconButton>
              </Box>
            </>
          )}

          <Tooltip title="Start a new comparison">
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              sx={{ ml: visibleDiffs.length === 0 ? "auto" : 0 }}
            >
              New Diff
            </Button>
          </Tooltip>
        </Box>
      )}

      {activeTab === "diff" && error && (
        <Alert
          severity="error"
          sx={{ mx: 3, mt: 1.5 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* ── Main Content ── */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden", p: 2, gap: 2 }}>
        {activeTab === "format" ? (
          <JsonFormatTab />
        ) : (
          <>
        {historyOpen && (
          <ComparisonHistoryPanel
            entries={historyEntries}
            onView={loadHistoryView}
            onEdit={loadHistoryEdit}
            onRename={rename}
            onDelete={remove}
            onClose={() => setHistoryOpen(false)}
          />
        )}
        {!hasCompared ? (
          /* ── Input View ── */
          <Box sx={{ flex: 1, display: "flex", gap: 2, alignItems: "stretch" }}>
            <JsonTextArea
              value={leftText}
              onChange={setLeftText}
              placeholder="Enter JSON to compare, or enter a URL to JSON"
              label="Left JSON"
            />

            {/* Centre column */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                minWidth: 140,
              }}
            >
              <Button
                variant="outlined"
                size="large"
                onClick={handleCompare}
                sx={{ px: 4, py: 1.5, fontSize: 15 }}
              >
                Compare
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={loadSample}
                sx={{ color: "primary.main", fontSize: 12 }}
              >
                or try some{"\n"}sample data
              </Button>
            </Box>

            <JsonTextArea
              value={rightText}
              onChange={setRightText}
              placeholder="Enter JSON to compare, or enter a URL to JSON"
              label="Right JSON"
            />
          </Box>
        ) : (
          /* ── Diff View ── */
          <Box sx={{ flex: 1, display: "flex", gap: 2, overflow: "hidden" }}>
            {/* Left panel */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.5, pl: 0.5 }}
              >
                Left JSON
              </Typography>
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <DiffCodePanel
                  lines={leftLines}
                  activeDiffId={activeDiff?.id}
                />
              </Box>
            </Box>

            {/* Right panel */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.5, pl: 0.5 }}
              >
                Right JSON
              </Typography>
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <DiffCodePanel
                  lines={rightLines}
                  activeDiffId={activeDiff?.id}
                />
              </Box>
            </Box>

            {/* Sidebar */}
            {differences.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5, pl: 0.5 }}
                >
                  Differences
                </Typography>
                <Box sx={{ flex: 1, overflow: "hidden" }}>
                  <DiffSidebar
                    differences={differences}
                    activeDiffId={activeDiff?.id}
                    onActivate={handleActivate}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
          </>
        )}
      </Box>
    </Box>
  );
};

// ─── Inline textarea component ─────────────────────────────────────────────

interface TextAreaProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}

const JsonTextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder,
  label,
}) => {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch {
      // clipboard not accessible
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "#ffffff",
        "&:focus-within": {
          borderColor: "primary.main",
          boxShadow: "0 0 0 2px rgba(0,92,153,0.12)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1.5,
          py: 0.5,
          borderBottom: "1px solid #f0f0f0",
          bgcolor: "#f9fafb",
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ flex: 1, fontWeight: 600 }}
        >
          {label}
        </Typography>
        <Tooltip title="Paste from clipboard">
          <IconButton size="small" onClick={handlePaste}>
            <ContentPasteIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        component="textarea"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        spellCheck={false}
        sx={{
          flex: 1,
          resize: "none",
          border: "none",
          outline: "none",
          p: 1.5,
          fontFamily: '"Consolas", "Cascadia Code", "Courier New", monospace',
          fontSize: "12.5px",
          lineHeight: "20px",
          bgcolor: "transparent",
          color: "#24292f",
          "&::placeholder": { color: "#aaa" },
        }}
      />
    </Box>
  );
};

export default JsonDiffApp;
