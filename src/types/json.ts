export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonArray = JsonValue[];

export type DataRecord = Record<string, JsonValue>;

export interface DuplicateModes {
  caseInsensitive: boolean;
  ignoreSpaces: boolean;
  ignoreSpecialChars: boolean;
}

export interface DuplicateMatch {
  originalIndex: number;
  duplicateIndex: number;
  original: DataRecord;
  duplicate: DataRecord;
  conflictFields: string[];
  hashKey: string;
}

export interface ImportResult {
  records: DataRecord[];
  total: number;
}

export interface ParseErrorInfo {
  message: string;
  line?: number;
  column?: number;
}

export type ValidationIssueType =
  | "missing-field"
  | "wrong-type"
  | "empty-required"
  | "extra-field";

export interface ValidationIssue {
  row: number;
  field: string;
  type: ValidationIssueType;
  message: string;
}

export interface SchemaDefinitionField {
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
}

export type SchemaDefinition = Record<string, SchemaDefinitionField>;

export interface DatasetStats {
  totalData: number;
  totalFields: number;
  duplicates: number;
  validRows: number;
  invalidRows: number;
  completionPercentage: number;
  emptyFieldTop10: Array<{ field: string; emptyCount: number }>;
}

export type ExportFormat = "json-beautified" | "json-minified" | "csv" | "txt";
