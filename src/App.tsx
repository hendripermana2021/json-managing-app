import { useEffect, useMemo, useState } from "react";
import { findDuplicates } from "./algorithms/duplicate";
import { HeaderBar } from "./components/HeaderBar";
import { Sidebar, type AppSection } from "./components/Sidebar";
import { Button } from "./components/ui/button";
import { useAutoSave } from "./hooks/useAutoSave";
import { DashboardPage } from "./pages/DashboardPage";
import { DuplicatePage } from "./pages/DuplicatePage";
import { EditorPage } from "./pages/EditorPage";
import { ExportPage } from "./pages/ExportPage";
import { FormatterPage } from "./pages/FormatterPage";
import { ImportPage } from "./pages/ImportPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { ValidatorPage } from "./pages/ValidatorPage";
import { buildStats } from "./services/stats";
import { useJsonStore } from "./store/useJsonStore";
import type { DataRecord, SchemaDefinition } from "./types/json";
import { validateSchema } from "./validators/schemaValidator";

function mergeIncomingWithFirst(records: DataRecord[], incoming: DataRecord): DataRecord[] {
  if (!records.length) {
    return [incoming];
  }

  const first = records[0];
  const merged = { ...incoming, ...first };
  return [merged, ...records.slice(1)];
}

function App() {
  const [activeSection, setActiveSection] = useState<AppSection>("dashboard");
  const [schema, setSchema] = useState<SchemaDefinition>({});
  const [beforeImportRecords, setBeforeImportRecords] = useState<DataRecord[] | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const records = useJsonStore((state) => state.records);
  const selectedFields = useJsonStore((state) => state.selectedFields);
  const duplicateModes = useJsonStore((state) => state.duplicateModes);
  const globalSearch = useJsonStore((state) => state.globalSearch);
  const darkMode = useJsonStore((state) => state.darkMode);
  const past = useJsonStore((state) => state.past);
  const future = useJsonStore((state) => state.future);

  const setRecords = useJsonStore((state) => state.setRecords);
  const updateCell = useJsonStore((state) => state.updateCell);
  const addRecord = useJsonStore((state) => state.addRecord);
  const deleteRecord = useJsonStore((state) => state.deleteRecord);
  const setSelectedFields = useJsonStore((state) => state.setSelectedFields);
  const setDuplicateModes = useJsonStore((state) => state.setDuplicateModes);
  const removeDuplicatesByIndexes = useJsonStore((state) => state.removeDuplicatesByIndexes);
  const mergeRecordInto = useJsonStore((state) => state.mergeRecordInto);
  const setGlobalSearch = useJsonStore((state) => state.setGlobalSearch);
  const setDarkMode = useJsonStore((state) => state.setDarkMode);
  const undo = useJsonStore((state) => state.undo);
  const redo = useJsonStore((state) => state.redo);
  const loadFromLocalStorage = useJsonStore((state) => state.loadFromLocalStorage);
  const saveToLocalStorage = useJsonStore((state) => state.saveToLocalStorage);
  const clearSavedSession = useJsonStore((state) => state.clearSavedSession);

  useAutoSave(30000);

  useEffect(() => {
    loadFromLocalStorage();
    setIsHydrated(true);
  }, [loadFromLocalStorage]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveToLocalStorage();
  }, [isHydrated, records, selectedFields, duplicateModes, darkMode, saveToLocalStorage]);

  const duplicateList = useMemo(() => {
    if (!selectedFields.length) {
      return [];
    }
    return findDuplicates(records, selectedFields, duplicateModes);
  }, [records, selectedFields, duplicateModes]);

  const validationErrors = useMemo(() => {
    if (!Object.keys(schema).length) {
      return [];
    }
    return validateSchema(records, schema);
  }, [records, schema]);

  const stats = useMemo(() => buildStats(records, selectedFields, duplicateModes, schema), [records, selectedFields, duplicateModes, schema]);

  const handleImport = (importedRecords: DataRecord[]) => {
    setBeforeImportRecords(records);
    setRecords(importedRecords);
  };

  const handleResetToEmpty = () => {
    clearSavedSession();
    setRecords([]);
    setBeforeImportRecords(null);
  };

  const handleRestoreBeforeImport = () => {
    if (!beforeImportRecords) {
      return;
    }

    setRecords(beforeImportRecords);
  };

  const handleResetFromHeader = () => {
    const confirmed = window.confirm("Reset semua data menjadi kosong?");
    if (!confirmed) {
      return;
    }
    clearSavedSession();
    setRecords([]);
    setBeforeImportRecords(null);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardPage stats={stats} />;
      case "import":
        return (
          <ImportPage
            onImported={handleImport}
            onResetToEmpty={handleResetToEmpty}
            onRestoreBeforeImport={handleRestoreBeforeImport}
            canRestoreBeforeImport={beforeImportRecords !== null}
          />
        );
      case "editor":
        return (
          <EditorPage
            records={records}
            onEditCell={updateCell}
            onDeleteRow={deleteRecord}
            onAddRecord={addRecord}
            onMergeIncoming={(record) => setRecords(mergeIncomingWithFirst(records, record))}
            duplicateFields={selectedFields}
            duplicateModes={duplicateModes}
          />
        );
      case "duplicate":
        return (
          <DuplicatePage
            records={records}
            selectedFields={selectedFields}
            duplicateModes={duplicateModes}
            onUpdateFields={setSelectedFields}
            onUpdateModes={setDuplicateModes}
            onRemoveIndexes={removeDuplicatesByIndexes}
            onMergePair={mergeRecordInto}
          />
        );
      case "validator":
        return <ValidatorPage records={records} onSchemaChange={setSchema} />;
      case "formatter":
        return <FormatterPage records={records} onApplyRecords={setRecords} />;
      case "statistics":
        return <StatisticsPage stats={stats} />;
      case "export":
        return (
          <ExportPage
            records={records}
            duplicateCount={duplicateList.length}
            validationErrors={validationErrors.length}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.15),transparent_35%)]" />

      <div className="relative flex min-h-screen">
        <Sidebar active={activeSection} onChange={setActiveSection} />

        <main className="flex-1">
          <HeaderBar
            search={globalSearch}
            onSearch={setGlobalSearch}
            darkMode={darkMode}
            onToggleDark={() => setDarkMode(!darkMode)}
            onQuickImport={() => setActiveSection("import")}
            onQuickExport={() => setActiveSection("export")}
            onResetAll={handleResetFromHeader}
          />

          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 px-6 py-3">
            <Button variant="secondary" size="sm" onClick={undo} disabled={!past.length}>
              Undo
            </Button>
            <Button variant="secondary" size="sm" onClick={redo} disabled={!future.length}>
              Redo
            </Button>
          </div>

          <section className="p-6">{renderSection()}</section>
        </main>
      </div>
    </div>
  );
}

export default App;
