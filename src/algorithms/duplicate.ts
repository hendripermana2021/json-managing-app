import { deepClone } from "../lib/utils";
import type { DataRecord, DuplicateMatch, DuplicateModes } from "../types/json";

function normalizeValue(value: unknown, modes: DuplicateModes): string {
  let text = String(value ?? "");

  if (modes.caseInsensitive) {
    text = text.toLowerCase();
  }

  if (modes.ignoreSpaces) {
    text = text.replace(/\s+/g, "");
  }

  if (modes.ignoreSpecialChars) {
    text = text.replace(/[^\p{L}\p{N}]/gu, "");
  }

  return text;
}

export function createHashKey(record: DataRecord, selectedFields: string[], modes: DuplicateModes): string {
  return selectedFields.map((field) => normalizeValue(record[field], modes)).join("|");
}

export function findDuplicates(
  records: DataRecord[],
  selectedFields: string[],
  modes: DuplicateModes,
): DuplicateMatch[] {
  const map = new Map<string, { index: number; record: DataRecord }>();
  const duplicates: DuplicateMatch[] = [];

  records.forEach((record, index) => {
    const key = createHashKey(record, selectedFields, modes);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, { index, record });
      return;
    }

    duplicates.push({
      originalIndex: existing.index,
      duplicateIndex: index,
      original: existing.record,
      duplicate: record,
      conflictFields: selectedFields,
      hashKey: key,
    });
  });

  return duplicates;
}

export function removeDuplicates(
  records: DataRecord[],
  selectedFields: string[],
  modes: DuplicateModes,
): { cleaned: DataRecord[]; removedIndexes: number[] } {
  const seen = new Set<string>();
  const removedIndexes: number[] = [];

  const cleaned = records.filter((record, index) => {
    const key = createHashKey(record, selectedFields, modes);
    if (seen.has(key)) {
      removedIndexes.push(index);
      return false;
    }
    seen.add(key);
    return true;
  });

  return { cleaned, removedIndexes };
}

export function mergeDuplicateData(base: DataRecord, incoming: DataRecord): DataRecord {
  const merged = deepClone(base);

  Object.entries(incoming).forEach(([key, value]) => {
    if (merged[key] === "" || merged[key] === null || merged[key] === undefined) {
      merged[key] = value;
    }
  });

  return merged;
}
