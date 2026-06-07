import type { DataRecord, SchemaDefinition, ValidationIssue } from "../types/json";

function valueType(value: unknown): "string" | "number" | "boolean" | "array" | "object" | "null" {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  return typeof value as "string" | "number" | "boolean" | "object";
}

export function validateSchema(records: DataRecord[], schema: SchemaDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  records.forEach((record, index) => {
    const row = index + 1;

    Object.entries(schema).forEach(([field, def]) => {
      if (!(field in record)) {
        issues.push({
          row,
          field,
          type: "missing-field",
          message: `Baris ${row}: Field \"${field}\" tidak ditemukan.`,
        });
        return;
      }

      const value = record[field];
      const actualType = valueType(value);

      if (def.required && (value === "" || value === null || value === undefined)) {
        issues.push({
          row,
          field,
          type: "empty-required",
          message: `Baris ${row}: Field \"${field}\" kosong.`,
        });
        return;
      }

      if (value !== null && value !== undefined && actualType !== def.type) {
        issues.push({
          row,
          field,
          type: "wrong-type",
          message: `Baris ${row}: Field \"${field}\" harus bertipe ${def.type}, ditemukan ${actualType}.`,
        });
      }
    });

    Object.keys(record).forEach((field) => {
      if (!schema[field]) {
        issues.push({
          row,
          field,
          type: "extra-field",
          message: `Baris ${row}: Field ekstra \"${field}\" tidak diizinkan.`,
        });
      }
    });
  });

  return issues;
}
