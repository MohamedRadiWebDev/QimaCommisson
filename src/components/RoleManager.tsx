"use client";

import { useState, useMemo } from "react";
import { useRolesStore } from "@/lib/store";
import type { EmployeeRole } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RoleManagerProps {
  collectors: string[];
}

const ROLES = ["Collector", "Telesales", "Production"] as const;

export default function RoleManager({ collectors }: RoleManagerProps) {
  const { employeeRoles, setEmployeeRole, removeEmployeeRole, clearAllRoles } = useRolesStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<string>("");

  const filteredCollectors = useMemo(() => {
    if (!searchTerm) return collectors;
    return collectors.filter((c) =>
      c.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [collectors, searchTerm]);

  const handleRoleChange = (name: string, role: "Collector" | "Telesales" | "Production") => {
    const existingRole = employeeRoles[name];
    setEmployeeRole(name, {
      name,
      role,
      customRate: existingRole?.customRate,
    });
  };

  const handleCustomRateChange = (name: string) => {
    const rate = parseFloat(tempRate);
    const existingRole = employeeRoles[name] || { name, role: "Collector" as const };
    
    if (!isNaN(rate) && rate >= 0) {
      setEmployeeRole(name, {
        ...existingRole,
        customRate: rate,
      });
    } else if (tempRate === "") {
      setEmployeeRole(name, {
        ...existingRole,
        customRate: undefined,
      });
    }
    setEditingEmployee(null);
    setTempRate("");
  };

  const startEditing = (name: string) => {
    setEditingEmployee(name);
    setTempRate(employeeRoles[name]?.customRate?.toString() || "");
  };

  const getEmployeeRole = (name: string): EmployeeRole => {
    return employeeRoles[name] || { name, role: "Collector" };
  };

  if (collectors.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
        <div className="text-slate-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-bold text-slate-700 mb-2">No Employees Found</h3>
          <p className="text-sm text-slate-500">
            Upload an Excel file first to see employees from the collector column.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Employee Roles</h2>
            <p className="text-sm text-slate-600">
              Assign roles and custom rates to override company defaults
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
            />
            <button
              onClick={clearAllRoles}
              className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors font-semibold"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-right font-bold text-slate-700">Employee Name</th>
              <th className="px-4 py-3 text-center font-bold text-slate-700">Role</th>
              <th className="px-4 py-3 text-center font-bold text-slate-700">Custom Rate (%)</th>
              <th className="px-4 py-3 text-center font-bold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCollectors.map((collector) => {
              const role = getEmployeeRole(collector);
              const isEditing = editingEmployee === collector;

              return (
                <tr key={collector} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{collector}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      {ROLES.map((r) => (
                        <button
                          key={r}
                          onClick={() => handleRoleChange(collector, r)}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-lg transition-colors font-semibold",
                            role.role === r
                              ? r === "Collector"
                                ? "bg-emerald-600 text-white"
                                : r === "Telesales"
                                ? "bg-violet-600 text-white"
                                : "bg-amber-500 text-white"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={tempRate}
                            onChange={(e) => setTempRate(e.target.value)}
                            className="w-24 px-2 py-1.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
                            placeholder="e.g. 1.50"
                            autoFocus
                          />
                          <button
                            onClick={() => handleCustomRateChange(collector)}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold"
                          >
                            OK
                          </button>
                          <button
                            onClick={() => {
                              setEditingEmployee(null);
                              setTempRate("");
                            }}
                            className="px-3 py-1.5 bg-slate-500 text-white rounded-lg hover:bg-slate-600 font-bold"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(collector)}
                          className={cn(
                            "px-4 py-1.5 rounded-lg transition-colors font-semibold",
                            role.customRate !== undefined
                              ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-300"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-slate-300"
                          )}
                        >
                          {role.customRate !== undefined
                            ? `${role.customRate.toFixed(2)}%`
                            : "Set Rate"}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      {employeeRoles[collector] && (
                        <button
                          onClick={() => removeEmployeeRole(collector)}
                          className="px-4 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-semibold border border-red-200"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between text-sm text-slate-600 font-medium">
          <span>
            Showing {filteredCollectors.length} of {collectors.length} employees
          </span>
          <span>
            {Object.keys(employeeRoles).length} employees with custom settings
          </span>
        </div>
      </div>
    </div>
  );
}
