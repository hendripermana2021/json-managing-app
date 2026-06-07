import { cn } from "../../lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-4 shadow-[0_12px_40px_rgba(3,7,18,0.35)] backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
