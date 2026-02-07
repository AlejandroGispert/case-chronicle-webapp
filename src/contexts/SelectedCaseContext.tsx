import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

/** Minimal case info for app-wide selection. In-memory only (no URL, no storage). */
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

export const SelectedCaseProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCase, setSelectedCaseState] =
    useState<SelectedCaseInfo | null>(null);

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
