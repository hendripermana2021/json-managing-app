import { saveAs } from "file-saver";
import Papa from "papaparse";
import { getLineColumnFromPosition } from "../lib/utils";
import type { DataRecord, ExportFormat, ImportResult, ParseErrorInfo } from "../types/json";

function normalizeImportedArray(value: unknown): DataRecord[] {
  if (!Array.isArray(value)) {
    throw new Error("Root JSON harus berupa array.");
  }

  return value.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Item pada index ${index} harus object.`);
    }
    return item as DataRecord;
  });
}

export function importJsonFromText(rawText: string): ImportResult {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { records: [], total: 0 };
  }

  const parsed = JSON.parse(trimmed);
  const records = normalizeImportedArray(parsed);

  return { records, total: records.length };
}

export function parseJsonSafely(rawText: string): { result?: ImportResult; error?: ParseErrorInfo } {
  try {
    return { result: importJsonFromText(rawText) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal parse JSON";
    const posMatch = /position (\d+)/i.exec(message);
    if (posMatch) {
      const position = Number(posMatch[1]);
      const { line, column } = getLineColumnFromPosition(rawText, position);
      return {
        error: {
          message: `Unexpected token at line ${line} column ${column}`,
          line,
          column,
        },
      };
    }

    return { error: { message } };
  }
}

export async function importJsonFromFile(file: File): Promise<{ result?: ImportResult; error?: ParseErrorInfo }> {
  const text = await file.text();
  return parseJsonSafely(text);
}

export function exportJson(records: DataRecord[], beautify: boolean): void {
  const json = JSON.stringify(records, null, beautify ? 2 : 0);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  saveAs(blob, beautify ? "dataset-beautified.json" : "dataset-minified.json");
}

export function exportCsv(records: DataRecord[]): void {
  const csv = Papa.unparse(records);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, "dataset.csv");
}

export function exportTxt(records: DataRecord[]): void {
  const lines = records.map((record, index) => `${index + 1}. ${JSON.stringify(record)}`);
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  saveAs(blob, "dataset.txt");
}

export function exportData(records: DataRecord[], format: ExportFormat): void {
  switch (format) {
    case "json-beautified":
      exportJson(records, true);
      break;
    case "json-minified":
      exportJson(records, false);
      break;
    case "csv":
      exportCsv(records);
      break;
    case "txt":
      exportTxt(records);
      break;
    default:
      break;
  }
}
