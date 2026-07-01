import React, { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import { formatValue } from "../utils/jsonFormat";

interface Props {
  data: unknown;
  label?: string;
  defaultExpanded?: boolean;
  depth?: number;
}

const JsonTreeView: React.FC<Props> = ({
  data,
  label,
  defaultExpanded = true,
  depth = 0,
}) => {
  if (data === null || typeof data !== "object") {
    return (
      <Box sx={{ display: "flex", alignItems: "baseline", pl: depth * 2 }}>
        {label !== undefined && (
          <Typography
            component="span"
            sx={{
              fontFamily: "inherit",
              fontSize: "inherit",
              fontWeight: 600,
              color: "#24292f",
              mr: 0.5,
            }}
          >
            {label}:
          </Typography>
        )}
        <Typography
          component="span"
          sx={{
            fontFamily: "inherit",
            fontSize: "inherit",
            color: valueColor(data),
          }}
        >
          {formatValue(data)}
        </Typography>
      </Box>
    );
  }

  const isArray = Array.isArray(data);
  const entries = isArray
    ? data.map((v, i) => [String(i), v] as const)
    : Object.entries(data as Record<string, unknown>);
  const isEmpty = entries.length === 0;
  const [expanded, setExpanded] = useState(defaultExpanded && depth < 2);

  if (isEmpty) {
    return (
      <Box sx={{ pl: depth * 2 }}>
        {label !== undefined && (
          <Typography
            component="span"
            sx={{ fontWeight: 600, color: "#24292f", mr: 0.5 }}
          >
            {label}:
          </Typography>
        )}
        <Typography component="span" sx={{ color: "#6e7781" }}>
          {isArray ? "[]" : "{}"}
        </Typography>
      </Box>
    );
  }

  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";

  return (
    <Box sx={{ pl: depth * 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
        <IconButton
          size="small"
          onClick={() => setExpanded((e) => !e)}
          sx={{ p: 0, color: "primary.main" }}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <IndeterminateCheckBoxIcon sx={{ fontSize: 16 }} />
          ) : (
            <AddBoxIcon sx={{ fontSize: 16 }} />
          )}
        </IconButton>
        {label !== undefined && (
          <Typography
            component="span"
            sx={{ fontWeight: 600, color: "#24292f", mr: 0.5 }}
          >
            {label}:
          </Typography>
        )}
        <Typography component="span" sx={{ color: "#6e7781" }}>
          {openBracket}
          {!expanded && (
            <Typography
              component="span"
              sx={{ color: "#9e9e9e", mx: 0.5, fontSize: "0.9em" }}
            >
              … {entries.length} {isArray ? "items" : "keys"}
            </Typography>
          )}
          {!expanded && closeBracket}
        </Typography>
      </Box>
      {expanded && (
        <Box sx={{ pl: 2, borderLeft: "1px solid #e8e8e8", ml: 1, my: 0.25 }}>
          {entries.map(([key, value]) => (
            <Box key={key} sx={{ py: 0.15 }}>
              <JsonTreeView
                data={value}
                label={isArray ? `[${key}]` : key}
                defaultExpanded={depth < 1}
                depth={0}
              />
            </Box>
          ))}
        </Box>
      )}
      {expanded && (
        <Box sx={{ pl: 2.5 }}>
          <Typography component="span" sx={{ color: "#6e7781" }}>
            {closeBracket}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

function valueColor(value: unknown): string {
  if (value === null) return "#8250df";
  if (typeof value === "boolean") return "#0550ae";
  if (typeof value === "number") return "#0550ae";
  if (typeof value === "string") return "#0a3069";
  return "#24292f";
}

export default JsonTreeView;
