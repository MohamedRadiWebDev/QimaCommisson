
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Employee } from "./types";

interface EmployeeState {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (name: string, type: Employee["type"], productionSubType?: "collector" | "tele") => void;
  deleteEmployee: (name: string) => void;
  loadEmployees: (employees: Employee[]) => void;
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set) => ({
      employees: [],

      addEmployee: (employee) =>
        set((state) => {
          const exists = state.employees.find((emp) => emp.name === employee.name);
          if (exists) {
            return state;
          }
          return {
            employees: [...state.employees, employee],
          };
        }),

      updateEmployee: (name, type, productionSubType) =>
        set((state) => ({
          employees: state.employees.map((emp) =>
            emp.name === name 
              ? { 
                  ...emp, 
                  type, 
                  productionSubType: type === "production" ? productionSubType : undefined 
                } 
              : emp
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
