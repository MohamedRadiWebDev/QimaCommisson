"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ColumnMapping,
  RawDataRow,
  ProcessedData,
  Company,
  EmployeeRolesMapping,
  EmployeeRole,
} from "./types";

interface AppState {
  columns: string[];
  rawData: RawDataRow[];
  columnMapping: ColumnMapping | null;
  processedData: ProcessedData | null;
  selectedCompany: Company;
  isProcessing: boolean;
  error: string | null;
  
  setColumns: (columns: string[]) => void;
  setRawData: (data: RawDataRow[]) => void;
  setColumnMapping: (mapping: ColumnMapping | null) => void;
  setProcessedData: (data: ProcessedData | null) => void;
  setSelectedCompany: (company: Company) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

interface RolesState {
  employeeRoles: EmployeeRolesMapping;
  setEmployeeRole: (name: string, role: EmployeeRole) => void;
  removeEmployeeRole: (name: string) => void;
  clearAllRoles: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  columns: [],
  rawData: [],
  columnMapping: null,
  processedData: null,
  selectedCompany: "Waseela",
  isProcessing: false,
  error: null,

  setColumns: (columns) => set({ columns }),
  setRawData: (rawData) => set({ rawData }),
  setColumnMapping: (columnMapping) => set({ columnMapping }),
  setProcessedData: (processedData) => set({ processedData }),
  setSelectedCompany: (selectedCompany) => set({ selectedCompany }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      columns: [],
      rawData: [],
      columnMapping: null,
      processedData: null,
      selectedCompany: "Waseela",
      isProcessing: false,
      error: null,
    }),
}));

export const useRolesStore = create<RolesState>()(
  persist(
    (set) => ({
      employeeRoles: {},

      setEmployeeRole: (name, role) =>
        set((state) => ({
          employeeRoles: {
            ...state.employeeRoles,
            [name]: role,
          },
        })),

      removeEmployeeRole: (name) =>
        set((state) => {
          const newRoles = { ...state.employeeRoles };
          delete newRoles[name];
          return { employeeRoles: newRoles };
        }),

      clearAllRoles: () => set({ employeeRoles: {} }),
    }),
    {
      name: "employee-roles-storage",
    }
  )
);
