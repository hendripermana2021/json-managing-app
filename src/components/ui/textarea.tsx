import { cn } from "../../lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-950/70 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-500",
        className,
      )}
      {...props}
    />
  );
}
