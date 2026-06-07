import { deepClone } from "../lib/utils";
import type { DataRecord } from "../types/json";

function sortObjectKeys(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .reduce<Record<string, unknown>>((acc, key) => {
      const value = obj[key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        acc[key] = sortObjectKeys(value as Record<string, unknown>);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
}

function removeEmptyValuesInObject(obj: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      const nextArray = value.filter((item) => item !== "" && item !== null && item !== undefined);
      output[key] = nextArray;
      return;
    }

    if (typeof value === "object") {
      output[key] = removeEmptyValuesInObject(value as Record<string, unknown>);
      return;
    }

    if (typeof value === "string") {
      output[key] = value.replace(/\s+/g, " ").trim();
      return;
    }

    output[key] = value;
  });

  return output;
}

export function sortJson(records: DataRecord[], field?: string): DataRecord[] {
  const cloned = deepClone(records);
  if (!field) {
    return cloned;
  }

  return cloned.sort((a, b) => String(a[field] ?? "").localeCompare(String(b[field] ?? "")));
}

export function beautifyJson(records: DataRecord[], indent: number | "\t"): string {
  return JSON.stringify(records, null, indent);
}

export function minifyJson(records: DataRecord[]): string {
  return JSON.stringify(records);
}

export function normalizeRecords(records: DataRecord[], options: {
  sortKeys: boolean;
  removeEmptyValues: boolean;
  removeDuplicateWhitespace: boolean;
}): DataRecord[] {
  const cloned = deepClone(records);

  return cloned.map((record) => {
    let next: Record<string, unknown> = record;

    if (options.sortKeys) {
      next = sortObjectKeys(next);
    }

    if (options.removeEmptyValues || options.removeDuplicateWhitespace) {
      next = removeEmptyValuesInObject(next);
    }

    return next as DataRecord;
  });
}
