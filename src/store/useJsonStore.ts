import { create } from "zustand";
import { createHashKey, mergeDuplicateData } from "../algorithms/duplicate";
import { deepClone } from "../lib/utils";
import type { DataRecord, DuplicateModes } from "../types/json";

const MAX_HISTORY = 50;
const STORAGE_KEY = "json-data-manager-storage";

interface DataSnapshot {
  records: DataRecord[];
}

interface JsonStoreState {
  records: DataRecord[];
  selectedFields: string[];
  duplicateModes: DuplicateModes;
  globalSearch: string;
  darkMode: boolean;
  past: DataSnapshot[];
  future: DataSnapshot[];
  hasSavedSession: boolean;
  setRecords: (records: DataRecord[]) => void;
  updateCell: (rowIndex: number, field: string, value: string) => void;
  addRecord: (record: DataRecord) => void;
  deleteRecord: (rowIndex: number) => void;
  setSelectedFields: (fields: string[]) => void;
  setDuplicateModes: (modes: DuplicateModes) => void;
  removeDuplicatesByIndexes: (indexes: number[]) => void;
  mergeRecordInto: (targetIndex: number, sourceIndex: number) => void;
  setGlobalSearch: (value: string) => void;
  setDarkMode: (enabled: boolean) => void;
  undo: () => void;
  redo: () => void;
  resetData: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  clearSavedSession: () => void;
}

function pickSnapshot(records: DataRecord[]): DataSnapshot {
  return { records: deepClone(records) };
}

function withHistoryUpdate(
  state: JsonStoreState,
  nextRecords: DataRecord[],
): Pick<JsonStoreState, "records" | "past" | "future"> {
  const nextPast = [...state.past, pickSnapshot(state.records)].slice(-MAX_HISTORY);
  return {
    records: nextRecords,
    past: nextPast,
    future: [],
  };
}

export const useJsonStore = create<JsonStoreState>((set, get) => ({
  records: [],
  selectedFields: [],
  duplicateModes: {
    caseInsensitive: false,
    ignoreSpaces: false,
    ignoreSpecialChars: false,
  },
  globalSearch: "",
  darkMode: false,
  past: [],
  future: [],
  hasSavedSession: false,
  setRecords: (records) => {
    set((state) => ({ ...withHistoryUpdate(state, deepClone(records)) }));
  },
  updateCell: (rowIndex, field, value) => {
    set((state) => {
      const next = deepClone(state.records);
      if (!next[rowIndex]) {
        return state;
      }
      next[rowIndex][field] = value;
      return { ...withHistoryUpdate(state, next) };
    });
  },
  addRecord: (record) => {
    set((state) => ({ ...withHistoryUpdate(state, [...state.records, deepClone(record)]) }));
  },
  deleteRecord: (rowIndex) => {
    set((state) => {
      const next = state.records.filter((_, index) => index !== rowIndex);
      return { ...withHistoryUpdate(state, next) };
    });
  },
  setSelectedFields: (fields) => set({ selectedFields: fields }),
  setDuplicateModes: (modes) => set({ duplicateModes: modes }),
  removeDuplicatesByIndexes: (indexes) => {
    const removeSet = new Set(indexes);
    set((state) => {
      const next = state.records.filter((_, index) => !removeSet.has(index));
      return { ...withHistoryUpdate(state, next) };
    });
  },
  mergeRecordInto: (targetIndex, sourceIndex) => {
    set((state) => {
      if (!state.records[targetIndex] || !state.records[sourceIndex] || targetIndex === sourceIndex) {
        return state;
      }

      const next = deepClone(state.records);
      next[targetIndex] = mergeDuplicateData(next[targetIndex], next[sourceIndex]);
      next.splice(sourceIndex, 1);

      return { ...withHistoryUpdate(state, next) };
    });
  },
  setGlobalSearch: (value) => set({ globalSearch: value }),
  setDarkMode: (enabled) => {
    document.documentElement.classList.toggle("dark", enabled);
    set({ darkMode: enabled });
  },
  undo: () => {
    set((state) => {
      if (!state.past.length) {
        return state;
      }

      const previous = state.past[state.past.length - 1];
      const nextPast = state.past.slice(0, -1);
      const nextFuture = [pickSnapshot(state.records), ...state.future].slice(0, MAX_HISTORY);

      return {
        records: deepClone(previous.records),
        past: nextPast,
        future: nextFuture,
      };
    });
  },
  redo: () => {
    set((state) => {
      if (!state.future.length) {
        return state;
      }

      const nextSnapshot = state.future[0];
      const nextFuture = state.future.slice(1);
      const nextPast = [...state.past, pickSnapshot(state.records)].slice(-MAX_HISTORY);

      return {
        records: deepClone(nextSnapshot.records),
        past: nextPast,
        future: nextFuture,
      };
    });
  },
  resetData: () => {
    set((state) => ({ ...withHistoryUpdate(state, []) }));
  },
  saveToLocalStorage: () => {
    const { records, selectedFields, duplicateModes, darkMode } = get();
    const payload = {
      records,
      selectedFields,
      duplicateModes,
      darkMode,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  },
  loadFromLocalStorage: () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return false;
    }

    try {
      const parsed = JSON.parse(raw) as {
        records?: DataRecord[];
        selectedFields?: string[];
        duplicateModes?: DuplicateModes;
        darkMode?: boolean;
      };
      set({
        records: Array.isArray(parsed.records) ? parsed.records : [],
        selectedFields: Array.isArray(parsed.selectedFields) ? parsed.selectedFields : [],
        duplicateModes: parsed.duplicateModes ?? {
          caseInsensitive: false,
          ignoreSpaces: false,
          ignoreSpecialChars: false,
        },
        darkMode: Boolean(parsed.darkMode),
        hasSavedSession: true,
        past: [],
        future: [],
      });
      document.documentElement.classList.toggle("dark", Boolean(parsed.darkMode));
      return true;
    } catch {
      return false;
    }
  },
  clearSavedSession: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ hasSavedSession: false });
  },
}));

export function recordExists(records: DataRecord[], candidate: DataRecord, fields: string[], modes: DuplicateModes): boolean {
  const candidateKey = createHashKey(candidate, fields, modes);
  return records.some((record) => createHashKey(record, fields, modes) === candidateKey);
}
