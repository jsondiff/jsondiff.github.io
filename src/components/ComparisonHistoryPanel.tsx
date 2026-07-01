import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Tooltip,
  Divider,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import type { ComparisonHistoryEntry } from "../types/comparisonHistory";
import { formatHistoryDate } from "../utils/historyStorage";

interface Props {
  entries: ComparisonHistoryEntry[];
  onView: (entry: ComparisonHistoryEntry) => void;
  onEdit: (entry: ComparisonHistoryEntry) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const ComparisonHistoryPanel: React.FC<Props> = ({
  entries,
  onView,
  onEdit,
  onRename,
  onDelete,
  onClose,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startRename = (entry: ComparisonHistoryEntry) => {
    setEditingId(entry.id);
    setEditValue(entry.name);
  };

  const commitRename = () => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue("");
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditValue("");
  };

  return (
    <Box
      sx={{
        width: 300,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        bgcolor: "#ffffff",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1.5,
          gap: 1,
        }}
      >
        <HistoryIcon sx={{ fontSize: 18, color: "primary.main" }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
          History
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close history">
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ overflowY: "auto", flex: 1 }}>
        {entries.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.disabled">
              No saved comparisons yet. Compare two JSON documents and they
              will appear here.
            </Typography>
          </Box>
        ) : (
          entries.map((entry, index) => (
            <Box
              key={entry.id}
              sx={{
                px: 2,
                py: 1.25,
                borderLeft: "3px solid transparent",
                bgcolor: index % 2 === 0 ? "#fafafa" : "#ffffff",
                "&:hover": { bgcolor: "#f0f7ff" },
                transition: "background-color 0.1s ease",
              }}
            >
              {editingId === entry.id ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <TextField
                    size="small"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename();
                      if (e.key === "Escape") cancelRename();
                    }}
                    autoFocus
                    fullWidth
                    sx={{ "& .MuiInputBase-input": { fontSize: 13, py: 0.5 } }}
                  />
                  <IconButton size="small" onClick={commitRename}>
                    <CheckIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton size="small" onClick={cancelRename}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    cursor: "pointer",
                    "&:hover": { color: "primary.main" },
                  }}
                  onClick={() => startRename(entry)}
                  title="Click to rename"
                >
                  {entry.name}
                </Typography>
              )}

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.25 }}
              >
                {formatHistoryDate(entry.createdAt)}
                {" · "}
                {entry.diffCount === 0
                  ? "No differences"
                  : `${entry.diffCount} difference${entry.diffCount !== 1 ? "s" : ""}`}
              </Typography>

              <Box sx={{ display: "flex", gap: 0.5, mt: 0.75 }}>
                <Tooltip title="View diff result">
                  <IconButton
                    size="small"
                    onClick={() => onView(entry)}
                    sx={{ color: "primary.main" }}
                  >
                    <VisibilityIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Load into text boxes">
                  <IconButton size="small" onClick={() => onEdit(entry)}>
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(entry.id)}
                    sx={{ color: "text.secondary", ml: "auto" }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default ComparisonHistoryPanel;
