import { useMemo, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { validateSchema } from "../validators/schemaValidator";
import type { DataRecord, SchemaDefinition } from "../types/json";

interface ValidatorPageProps {
  records: DataRecord[];
  onSchemaChange: (schema: SchemaDefinition) => void;
}

type RawSchema = Record<string, string>;

const typeMap = new Set(["string", "number", "boolean", "array", "object"]);

export function ValidatorPage({ records, onSchemaChange }: ValidatorPageProps) {
  const [schemaText, setSchemaText] = useState(`{
  "kana": "string",
  "kanji": "string",
  "meaning": "string"
}`);
  const [issues, setIssues] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const parsedSchema = useMemo(() => {
    try {
      const raw = JSON.parse(schemaText) as RawSchema;
      const transformed: SchemaDefinition = {};
      Object.entries(raw).forEach(([field, type]) => {
        transformed[field] = {
          type: typeMap.has(type) ? (type as SchemaDefinition[string]["type"]) : "string",
          required: true,
        };
      });
      return transformed;
    } catch {
      return null;
    }
  }, [schemaText]);

  const handleValidate = () => {
    if (!parsedSchema) {
      setError("Schema JSON tidak valid.");
      return;
    }

    onSchemaChange(parsedSchema);
    setError(null);
    const result = validateSchema(records, parsedSchema);
    setIssues(result.map((issue) => issue.message));
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">Validator Schema</h2>
        <Textarea value={schemaText} onChange={(e) => setSchemaText(e.target.value)} className="min-h-[220px] font-mono text-xs" />
        <Button onClick={handleValidate}>Validasi Dataset</Button>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </Card>

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-slate-100">Hasil Validasi</h3>
        <div className="max-h-[420px] space-y-1 overflow-auto text-sm text-slate-300">
          {issues.length ? issues.map((issue) => <p key={issue}>{issue}</p>) : <p className="text-slate-400">Belum ada error.</p>}
        </div>
      </Card>
    </div>
  );
}
