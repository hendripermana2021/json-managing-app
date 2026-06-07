import { useEffect } from "react";
import { useJsonStore } from "../store/useJsonStore";

export function useAutoSave(intervalMs = 30000): void {
  const saveToLocalStorage = useJsonStore((state) => state.saveToLocalStorage);

  useEffect(() => {
    const timer = window.setInterval(() => {
      saveToLocalStorage();
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [intervalMs, saveToLocalStorage]);
}
