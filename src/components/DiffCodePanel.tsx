import React from "react";
import { Box, Typography } from "@mui/material";
import type { AnnotatedLine } from "../utils/jsonDiff";

interface Props {
  lines: AnnotatedLine[];
  activeDiffId?: number;
}

const BG: Record<string, string> = {
  normal: "transparent",
  added: "#e6ffed",
  removed: "#ffeef0",
  changed: "#fff8c5",
  missing: "#e6f4ff",
};

const BORDER: Record<string, string> = {
  normal: "transparent",
  added: "#34d058",
  removed: "#f97583",
  changed: "#e3b341",
  missing: "#58a6ff",
};

const DiffCodePanel: React.FC<Props> = ({ lines, activeDiffId }) => {
  return (
    <Box
      sx={{
        fontFamily: '"Consolas", "Cascadia Code", "Courier New", monospace',
        fontSize: "12.5px",
        lineHeight: "20px",
        overflowX: "auto",
        overflowY: "auto",
        height: "100%",
        bgcolor: "#fafafa",
        border: "1px solid #e0e0e0",
        borderRadius: 1,
      }}
    >
      {lines.map((line) => {
        const isActive =
          activeDiffId !== undefined && line.diffId === activeDiffId;
        return (
          <Box
            key={line.lineNumber}
            sx={{
              display: "flex",
              alignItems: "stretch",
              bgcolor: isActive ? `${BG[line.status]}cc` : BG[line.status],
              borderLeft: `3px solid ${BORDER[line.status]}`,
              outline: isActive ? `1px solid ${BORDER[line.status]}` : "none",
              transition: "background-color 0.15s ease",
            }}
          >
            {/* Line number gutter */}
            <Box
              sx={{
                minWidth: 40,
                px: 1,
                textAlign: "right",
                color: "#9e9e9e",
                borderRight: "1px solid #eeeeee",
                userSelect: "none",
                flexShrink: 0,
              }}
            >
              {line.lineNumber}
            </Box>

            {/* Code content */}
            <Box
              sx={{
                px: 1.5,
                py: 0,
                whiteSpace: "pre",
                flexGrow: 1,
                color: line.status === "normal" ? "#24292f" : "inherit",
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  fontWeight: line.status !== "normal" ? 600 : 400,
                  color:
                    line.status === "added"
                      ? "#1a7f37"
                      : line.status === "removed"
                        ? "#cf222e"
                        : line.status === "changed"
                          ? "#9a6700"
                          : line.status === "missing"
                            ? "#0969da"
                            : "#24292f",
                }}
              >
                {line.content}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default DiffCodePanel;
