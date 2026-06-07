import { Download, FileUp, Moon, Search, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface HeaderBarProps {
  search: string;
  onSearch: (value: string) => void;
  darkMode: boolean;
  onToggleDark: () => void;
  onQuickImport: () => void;
  onQuickExport: () => void;
}

export function HeaderBar({
  search,
  onSearch,
  darkMode,
  onToggleDark,
  onQuickImport,
  onQuickExport,
}: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-800 bg-slate-950/95 px-6 py-3 backdrop-blur">
      <div className="relative w-full max-w-lg">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
        <Input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search global..." className="pl-9" />
      </div>

      <Button variant="secondary" onClick={onQuickImport} className="gap-2">
        <FileUp className="h-4 w-4" />
        Import
      </Button>
      <Button variant="secondary" onClick={onQuickExport} className="gap-2">
        <Download className="h-4 w-4" />
        Export
      </Button>
      <Button variant="ghost" onClick={onToggleDark} className="h-10 w-10 p-0">
        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </header>
  );
}
