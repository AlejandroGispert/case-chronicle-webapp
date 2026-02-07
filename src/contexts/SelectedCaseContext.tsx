import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

const STORAGE_KEY = "selected-case";

/** Minimal case info for app-wide selection. Persisted in sessionStorage. */
export interface SelectedCaseInfo {
  id: string;
  title: string;
}

type SelectedCaseContextType = {
  selectedCase: SelectedCaseInfo | null;
  setSelectedCase: (caseInfo: SelectedCaseInfo | null) => void;
  selectedCaseId: string | null;
};

const SelectedCaseContext = createContext<SelectedCaseContextType | undefined>(
  undefined,
);

function loadStored(): SelectedCaseInfo | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SelectedCaseInfo;
    if (parsed?.id && parsed?.title) return parsed;
  } catch {
    // ignore
  }
  return null;
}

function saveStored(info: SelectedCaseInfo | null) {
  try {
    if (info) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const SelectedCaseProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCase, setSelectedCaseState] =
    useState<SelectedCaseInfo | null>(loadStored);

  useEffect(() => {
    saveStored(selectedCase);
  }, [selectedCase]);

  const setSelectedCase = useCallback((caseInfo: SelectedCaseInfo | null) => {
    setSelectedCaseState(caseInfo);
  }, []);

  const value: SelectedCaseContextType = {
    selectedCase,
    setSelectedCase,
    selectedCaseId: selectedCase?.id ?? null,
  };

  return (
    <SelectedCaseContext.Provider value={value}>
      {children}
    </SelectedCaseContext.Provider>
  );
};

export function useSelectedCase(): SelectedCaseContextType {
  const context = useContext(SelectedCaseContext);
  if (context === undefined) {
    throw new Error("useSelectedCase must be used within SelectedCaseProvider");
  }
  return context;
}
