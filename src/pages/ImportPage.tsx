import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { importJsonFromFile, parseJsonSafely } from "../utils/io";
import type { DataRecord } from "../types/json";

interface ImportPageProps {
  onImported: (records: DataRecord[]) => void;
  onResetToEmpty: () => void;
  onRestoreBeforeImport: () => void;
  canRestoreBeforeImport: boolean;
}

export function ImportPage({
  onImported,
  onResetToEmpty,
  onRestoreBeforeImport,
  canRestoreBeforeImport,
}: ImportPageProps) {
  const [jsonText, setJsonText] = useState("");
  const [message, setMessage] = useState("Belum ada data yang diimport.");
  const [error, setError] = useState<string | null>(null);
  const [hasImported, setHasImported] = useState(false);

  const handleValidateAndLoad = () => {
    const { result, error: parseError } = parseJsonSafely(jsonText);
    if (parseError) {
      setError(parseError.message);
      setMessage("JSON tidak valid.");
      return;
    }

    setError(null);
    setMessage(`${result?.total ?? 0} data berhasil dimuat.`);
    onImported(result?.records ?? []);
    setHasImported(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const { result, error: parseError } = await importJsonFromFile(file);
    if (parseError) {
      setError(parseError.message);
      setMessage("File JSON tidak valid.");
      return;
    }

    setError(null);
    const nextText = JSON.stringify(result?.records ?? [], null, 2);
    setJsonText(nextText);
    setMessage(`${result?.total ?? 0} data berhasil dimuat dari file.`);
    onImported(result?.records ?? []);
    setHasImported(true);
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">Import JSON</h2>
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">
          Upload .json
          <input type="file" accept="application/json,.json" className="hidden" onChange={handleFileUpload} />
        </label>
        <Button onClick={handleValidateAndLoad}>Validasi & Muat</Button>
      </div>

      <Textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder="Paste JSON array di sini"
        className="min-h-[360px] font-mono text-xs"
      />

      <p className="text-sm text-slate-300">{message}</p>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {hasImported ? (
        <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-3">
          <Button variant="destructive" onClick={onResetToEmpty}>
            Reset Jadi Kosong
          </Button>
          <Button variant="secondary" onClick={onRestoreBeforeImport} disabled={!canRestoreBeforeImport}>
            Kembalikan Seperti Semula
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
