import { useMemo, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { beautifyJson, minifyJson, normalizeRecords, sortJson } from "../utils/jsonFormatters";
import type { DataRecord } from "../types/json";

interface FormatterPageProps {
  records: DataRecord[];
  onApplyRecords: (records: DataRecord[]) => void;
}

export function FormatterPage({ records, onApplyRecords }: FormatterPageProps) {
  const [indentOption, setIndentOption] = useState<"2" | "4" | "tab">("2");
  const [sortField, setSortField] = useState("");
  const [sortKeys, setSortKeys] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [removeWhitespace, setRemoveWhitespace] = useState(true);

  const processed = useMemo(() => {
    const normalized = normalizeRecords(records, {
      sortKeys,
      removeEmptyValues: removeEmpty,
      removeDuplicateWhitespace: removeWhitespace,
    });
    return sortJson(normalized, sortField || undefined);
  }, [records, sortKeys, removeEmpty, removeWhitespace, sortField]);

  const indent = indentOption === "tab" ? "\t" : Number(indentOption);

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">JSON Formatter</h2>

      <div className="flex flex-wrap gap-2 text-sm text-slate-300">
        <label className="flex items-center gap-2">
          Indent
          <select
            className="h-10 rounded-xl border border-slate-700 bg-slate-950 px-3"
            value={indentOption}
            onChange={(e) => setIndentOption(e.target.value as "2" | "4" | "tab")}
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </select>
        </label>

        <Input value={sortField} onChange={(e) => setSortField(e.target.value)} placeholder="Sort array by field" className="max-w-[220px]" />

        <label className="flex items-center gap-2"><input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} /> Sort object keys</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={removeEmpty} onChange={(e) => setRemoveEmpty(e.target.checked)} /> Remove empty values</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={removeWhitespace} onChange={(e) => setRemoveWhitespace(e.target.checked)} /> Remove duplicate whitespace</label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => onApplyRecords(processed)}>Apply to Dataset</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div>
          <p className="mb-2 text-sm text-slate-300">Preview Beautify</p>
          <pre className="max-h-[420px] overflow-auto rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200">
            {beautifyJson(processed, indent)}
          </pre>
        </div>
        <div>
          <p className="mb-2 text-sm text-slate-300">Preview Minify</p>
          <pre className="max-h-[420px] overflow-auto rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200">
            {minifyJson(processed)}
          </pre>
        </div>
      </div>
    </Card>
  );
}
