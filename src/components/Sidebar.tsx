import { LayoutDashboard, FileUp, TableProperties, ScanSearch, ShieldCheck, WandSparkles, ChartNoAxesCombined, Download } from "lucide-react";
import { cn, toTitleCase } from "../lib/utils";

export type AppSection =
  | "dashboard"
  | "import"
  | "editor"
  | "duplicate"
  | "validator"
  | "formatter"
  | "statistics"
  | "export";

const items: Array<{ id: AppSection; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "import", label: "Import", icon: FileUp },
  { id: "editor", label: "JSON Editor", icon: TableProperties },
  { id: "duplicate", label: "Duplicate Checker", icon: ScanSearch },
  { id: "validator", label: "Validator", icon: ShieldCheck },
  { id: "formatter", label: "Formatter", icon: WandSparkles },
  { id: "statistics", label: "Statistics", icon: ChartNoAxesCombined },
  { id: "export", label: "Export", icon: Download },
];

interface SidebarProps {
  active: AppSection;
  onChange: (section: AppSection) => void;
}

export function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 p-4">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">JSON Data Manager</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Large Dataset Toolkit</h1>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition",
                active === item.id
                  ? "bg-cyan-500/20 text-black-800 dark:text-white dark:text-white bold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{toTitleCase(item.label)}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
