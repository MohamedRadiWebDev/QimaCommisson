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
  TargetStatus,
  Domain,
} from "./types";

interface AppState {
  columns: string[];
  rawData: RawDataRow[];
  columnMapping: ColumnMapping | null;
  processedData: ProcessedData | null;
  selectedCompany: Company;
  selectedTargetStatus: TargetStatus;
  isProcessing: boolean;
  error: string | null;

  setColumns: (columns: string[]) => void;
  setRawData: (data: RawDataRow[]) => void;
  setColumnMapping: (mapping: ColumnMapping | null) => void;
  setProcessedData: (data: ProcessedData | null) => void;
  setSelectedCompany: (company: Company) => void;
  setSelectedTargetStatus: (status: TargetStatus) => void;
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
  selectedTargetStatus: "No Target",
  isProcessing: false,
  error: null,

  setColumns: (columns) => set({ columns }),
  setRawData: (rawData) => set({ rawData }),
  setColumnMapping: (columnMapping) => set({ columnMapping }),
  setProcessedData: (processedData) => set({ processedData }),
  setSelectedCompany: (selectedCompany) => set({ selectedCompany }),
  setSelectedTargetStatus: (selectedTargetStatus) => set({ selectedTargetStatus }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      columns: [],
      rawData: [],
      columnMapping: null,
      processedData: null,
      selectedCompany: "Waseela",
      selectedTargetStatus: "No Target",
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

interface DomainsState {
  domains: Domain[];
  activeDomainId: string | null;
  addDomain: (domain: Omit<Domain, "id" | "createdAt" | "updatedAt">) => string;
  updateDomain: (id: string, updates: Partial<Omit<Domain, "id" | "createdAt">>) => void;
  removeDomain: (id: string) => void;
  setActiveDomain: (id: string | null) => void;
  getDomain: (id: string) => Domain | undefined;
  clearAllDomains: () => void;
}

export const useDomainsStore = create<DomainsState>()(
  persist(
    (set, get) => ({
      domains: [],
      activeDomainId: null,

      addDomain: (domainData) => {
        const id = `domain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = Date.now();
        const newDomain: Domain = {
          ...domainData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          domains: [...state.domains, newDomain],
          activeDomainId: id,
        }));
        return id;
      },

      updateDomain: (id, updates) =>
        set((state) => ({
          domains: state.domains.map((domain) =>
            domain.id === id
              ? { ...domain, ...updates, updatedAt: Date.now() }
              : domain
          ),
        })),

      removeDomain: (id) =>
        set((state) => {
          const newDomains = state.domains.filter((d) => d.id !== id);
          const newActiveId =
            state.activeDomainId === id
              ? newDomains.length > 0
                ? newDomains[0].id
                : null
              : state.activeDomainId;
          return {
            domains: newDomains,
            activeDomainId: newActiveId,
          };
        }),

      setActiveDomain: (id) => set({ activeDomainId: id }),

      getDomain: (id) => get().domains.find((d) => d.id === id),

      clearAllDomains: () => set({ domains: [], activeDomainId: null }),
    }),
    {
      name: "domains-storage",
    }
  )
);