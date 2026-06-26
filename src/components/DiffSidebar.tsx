import React from "react";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Chip,
  Divider,
} from "@mui/material";
import type { Difference, DiffType } from "../utils/jsonDiff";

interface Props {
  differences: Difference[];
  activeDiffId: number | undefined;
  onActivate: (id: number) => void;
  filters: Record<DiffType, boolean>;
  onFilterChange: (type: DiffType, checked: boolean) => void;
}

const TYPE_LABELS: Record<DiffType, string> = {
  "missing-right": "Missing on right",
  "missing-left": "Missing on left",
  "type-mismatch": "Incorrect types",
  "value-mismatch": "Unequal values",
};

const TYPE_COLORS: Record<DiffType, "error" | "warning" | "info" | "success"> =
  {
    "missing-right": "error",
    "missing-left": "info",
    "type-mismatch": "warning",
    "value-mismatch": "warning",
  };

const DiffSidebar: React.FC<Props> = ({
  differences,
  activeDiffId,
  onActivate,
  filters,
  onFilterChange,
}) => {
  const missingRight = differences.filter(
    (d) => d.type === "missing-right",
  ).length;
  const missingLeft = differences.filter(
    (d) => d.type === "missing-left",
  ).length;
  const typeMismatch = differences.filter(
    (d) => d.type === "type-mismatch",
  ).length;
  const valueMismatch = differences.filter(
    (d) => d.type === "value-mismatch",
  ).length;

  const visible = differences.filter((d) => filters[d.type]);

  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        bgcolor: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* Summary Header */}
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700 }}
          color="text.primary"
        >
          Found {differences.length} difference
          {differences.length !== 1 ? "s" : ""}
        </Typography>
      </Box>

      <Divider />

      {/* Filters */}
      <Box sx={{ px: 1.5, py: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 0.5, mb: 0.5, display: "block" }}
        >
          Show
        </Typography>
        {missingRight > 0 && (
          <FilterRow
            label={`${missingRight} missing on right`}
            type="missing-right"
            checked={filters["missing-right"]}
            onChange={onFilterChange}
          />
        )}
        {missingLeft > 0 && (
          <FilterRow
            label={`${missingLeft} missing on left`}
            type="missing-left"
            checked={filters["missing-left"]}
            onChange={onFilterChange}
          />
        )}
        {typeMismatch > 0 && (
          <FilterRow
            label={`${typeMismatch} incorrect types`}
            type="type-mismatch"
            checked={filters["type-mismatch"]}
            onChange={onFilterChange}
          />
        )}
        {valueMismatch > 0 && (
          <FilterRow
            label={`${valueMismatch} unequal values`}
            type="value-mismatch"
            checked={filters["value-mismatch"]}
            onChange={onFilterChange}
          />
        )}
      </Box>

      <Divider />

      {/* Difference List */}
      <Box sx={{ overflowY: "auto", flex: 1 }}>
        {visible.map((diff, index) => (
          <Box
            key={diff.id}
            onClick={() => onActivate(diff.id)}
            sx={{
              px: 2,
              py: 1.25,
              cursor: "pointer",
              borderLeft: `3px solid`,
              borderLeftColor:
                activeDiffId === diff.id ? "primary.main" : "transparent",
              bgcolor:
                activeDiffId === diff.id
                  ? "#f0f7ff"
                  : index % 2 === 0
                    ? "#fafafa"
                    : "#ffffff",
              "&:hover": { bgcolor: "#f0f7ff" },
              transition: "background-color 0.1s ease",
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              <Chip
                label={TYPE_LABELS[diff.type]}
                color={TYPE_COLORS[diff.type]}
                size="small"
                sx={{ height: 18, fontSize: 10 }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Consolas", "Cascadia Code", monospace',
                fontSize: 11,
                color: "text.secondary",
                wordBreak: "break-all",
              }}
            >
              {diff.path || "(root)"}
            </Typography>
          </Box>
        ))}
        {visible.length === 0 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.disabled">
              No differences visible with current filters.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

interface FilterRowProps {
  label: string;
  type: DiffType;
  checked: boolean;
  onChange: (type: DiffType, checked: boolean) => void;
}

const FilterRow: React.FC<FilterRowProps> = ({
  label,
  type,
  checked,
  onChange,
}) => (
  <FormControlLabel
    control={
      <Checkbox
        size="small"
        checked={checked}
        onChange={(e) => onChange(type, e.target.checked)}
        sx={{ py: 0.25 }}
      />
    }
    label={<Typography variant="caption">{label}</Typography>}
    sx={{ display: "flex", m: 0, ml: 0 }}
  />
);

export default DiffSidebar;
