import { findDuplicates } from "../algorithms/duplicate";
import { validateSchema } from "../validators/schemaValidator";
import type { DataRecord, DatasetStats, DuplicateModes, SchemaDefinition } from "../types/json";

export function buildStats(
  records: DataRecord[],
  duplicateFields: string[],
  duplicateModes: DuplicateModes,
  schema: SchemaDefinition,
): DatasetStats {
  const allFields = new Set<string>();
  records.forEach((record) => Object.keys(record).forEach((key) => allFields.add(key)));

  const selected = duplicateFields.length ? duplicateFields : [...allFields].slice(0, 2);
  const duplicates = selected.length ? findDuplicates(records, selected, duplicateModes).length : 0;
  const validationIssues = Object.keys(schema).length ? validateSchema(records, schema) : [];
  const invalidRows = new Set(validationIssues.map((issue) => issue.row)).size;
  const validRows = Math.max(0, records.length - invalidRows);

  let totalCells = 0;
  let filledCells = 0;
  const emptyCountByField = new Map<string, number>();

  records.forEach((record) => {
    allFields.forEach((field) => {
      totalCells += 1;
      const value = record[field];
      const isEmpty = value === "" || value === null || value === undefined;
      if (isEmpty) {
        emptyCountByField.set(field, (emptyCountByField.get(field) ?? 0) + 1);
      } else {
        filledCells += 1;
      }
    });
  });

  const completionPercentage = totalCells ? Math.round((filledCells / totalCells) * 10000) / 100 : 0;

  const emptyFieldTop10 = [...emptyCountByField.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([field, emptyCount]) => ({ field, emptyCount }));

  return {
    totalData: records.length,
    totalFields: allFields.size,
    duplicates,
    validRows,
    invalidRows,
    completionPercentage,
    emptyFieldTop10,
  };
}
