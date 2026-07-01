import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Alert,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from "@mui/material";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  parseAndFormat,
  type IndentStyle,
} from "../utils/jsonFormat";
import JsonTreeView from "./JsonTreeView";

const FORMAT_SAMPLE = JSON.stringify(
  {
    store: {
      book: [
        {
          category: "reference",
          author: "Nigel Rees",
          title: "Sayings of the Century",
          price: 8.95,
        },
        {
          category: "fiction",
          author: "Evelyn Waugh",
          title: "Sword of Honour",
          price: 12.99,
        },
        {
          category: "fiction",
          author: "J. R. R. Tolkien",
          title: "The Lord of the Rings",
          price: 22.99,
        },
      ],
      bicycle: { color: "red", price: 19.95 },
    },
  },
  null,
  0,
);

type OutputView = "formatted" | "tree";

const JsonFormatTab: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [indent, setIndent] = useState<IndentStyle>("2");
  const [outputView, setOutputView] = useState<OutputView>("formatted");
  const [formatted, setFormatted] = useState<string | null>(null);
  const [parsed, setParsed] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const process = useCallback(
    (text: string, style: IndentStyle) => {
      const result = parseAndFormat(text, style);
      if (!result.ok) {
        setError(result.error);
        setFormatted(null);
        setParsed(null);
        return;
      }
      setError(null);
      setFormatted(result.formatted);
      setParsed(result.parsed);
    },
    [],
  );

  const handleProcess = () => process(inputText, indent);

  const handleIndentChange = (style: IndentStyle) => {
    setIndent(style);
    if (parsed !== null) {
      process(inputText, style);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
    } catch {
      // clipboard not accessible
    }
  };

  const handleCopy = async () => {
    if (!formatted) return;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not accessible
    }
  };

  const loadExample = () => {
    setInputText(FORMAT_SAMPLE);
    setError(null);
    setFormatted(null);
    setParsed(null);
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      <Box sx={{ display: "flex", gap: 2, flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Input */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#ffffff",
            minWidth: 0,
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
              gap: 1,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ flex: 1, fontWeight: 600 }}
            >
              JSON input
            </Typography>
            <Tooltip title="Paste from clipboard">
              <IconButton size="small" onClick={handlePaste}>
                <ContentPasteIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear">
              <IconButton
                size="small"
                onClick={() => {
                  setInputText("");
                  setFormatted(null);
                  setParsed(null);
                  setError(null);
                }}
              >
                <DeleteIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            component="textarea"
            value={inputText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setInputText(e.target.value)
            }
            placeholder='Paste minified JSON, e.g. {"key":"value"}'
            spellCheck={false}
            sx={{
              flex: 1,
              resize: "none",
              border: "none",
              outline: "none",
              p: 1.5,
              fontFamily:
                '"Consolas", "Cascadia Code", "Courier New", monospace',
              fontSize: "12.5px",
              lineHeight: "20px",
              bgcolor: "transparent",
              color: "#24292f",
              minHeight: 120,
              "&::placeholder": { color: "#aaa" },
            }}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: 1.5,
              py: 1,
              borderTop: "1px solid #f0f0f0",
              bgcolor: "#f9fafb",
              flexWrap: "wrap",
            }}
          >
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="indent-label">Pretty-print spacing</InputLabel>
              <Select
                labelId="indent-label"
                label="Pretty-print spacing"
                value={indent}
                onChange={(e) =>
                  handleIndentChange(e.target.value as IndentStyle)
                }
              >
                <MenuItem value="2">2 spaces per level</MenuItem>
                <MenuItem value="3">3 spaces per level</MenuItem>
                <MenuItem value="4">4 spaces per level</MenuItem>
                <MenuItem value="tab">Tab per level</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleProcess}>
              Format
            </Button>
            <Button variant="text" size="small" onClick={loadExample}>
              Load example
            </Button>
          </Box>
        </Box>

        {/* Output */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#ffffff",
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #f0f0f0",
              bgcolor: "#f9fafb",
              px: 1,
            }}
          >
            <Tabs
              value={outputView}
              onChange={(_, v) => setOutputView(v)}
              sx={{ minHeight: 36, flex: 1 }}
            >
              <Tab
                label="Formatted"
                value="formatted"
                sx={{ minHeight: 36, py: 0, fontSize: 13 }}
              />
              <Tab
                label="Tree"
                value="tree"
                sx={{ minHeight: 36, py: 0, fontSize: 13 }}
              />
            </Tabs>
            {formatted && outputView === "formatted" && (
              <Tooltip title={copied ? "Copied!" : "Copy formatted JSON"}>
                <IconButton size="small" onClick={handleCopy}>
                  <ContentCopyIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Box sx={{ flex: 1, overflow: "auto", p: 1.5, minHeight: 0 }}>
            {!formatted && !error && (
              <Typography variant="body2" color="text.disabled">
                Paste JSON on the left and click Format to see pretty-printed
                output or an expandable tree.
              </Typography>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            )}
            {formatted && outputView === "formatted" && (
              <Box
                component="pre"
                sx={{
                  m: 0,
                  fontFamily:
                    '"Consolas", "Cascadia Code", "Courier New", monospace',
                  fontSize: "12.5px",
                  lineHeight: "20px",
                  color: "#24292f",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {formatted}
              </Box>
            )}
            {parsed !== null && outputView === "tree" && (
              <Box
                sx={{
                  fontFamily:
                    '"Consolas", "Cascadia Code", "Courier New", monospace',
                  fontSize: "12.5px",
                  lineHeight: "22px",
                }}
              >
                <JsonTreeView data={parsed} defaultExpanded />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default JsonFormatTab;
