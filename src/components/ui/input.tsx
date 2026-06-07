import { cn } from "../../lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-950/70 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-500",
        className,
      )}
      {...props}
    />
  );
}
