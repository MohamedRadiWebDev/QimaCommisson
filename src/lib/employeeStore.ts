
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Employee } from "./types";

interface EmployeeState {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (name: string, type: Employee["type"]) => void;
  deleteEmployee: (name: string) => void;
  loadEmployees: (employees: Employee[]) => void;
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set) => ({
      employees: [],

      addEmployee: (employee) =>
        set((state) => ({
          employees: [...state.employees, employee],
        })),

      updateEmployee: (name, type) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.name === name ? { ...emp, type } : emp
          ),
        })),

      deleteEmployee: (name) =>
        set((state) => ({
          employees: state.employees.filter((emp) => emp.name !== name),
        })),

      loadEmployees: (employees) => set({ employees }),
    }),
    {
      name: "employee-storage",
    }
  )
);
