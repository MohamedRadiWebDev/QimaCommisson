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
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
        <div className="text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">No Employees Found</h3>
          <p className="text-sm">
            Upload an Excel file first to see employees from the collector column.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Employee Roles</h2>
            <p className="text-sm text-gray-600">
              Assign roles and custom rates to override company defaults
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={clearAllRoles}
              className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right font-medium text-gray-700">Employee Name</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Role</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Custom Rate (%)</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCollectors.map((collector) => {
              const role = getEmployeeRole(collector);
              const isEditing = editingEmployee === collector;

              return (
                <tr key={collector} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-right font-medium">{collector}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      {ROLES.map((r) => (
                        <button
                          key={r}
                          onClick={() => handleRoleChange(collector, r)}
                          className={cn(
                            "px-3 py-1 text-sm rounded-lg transition-colors",
                            role.role === r
                              ? r === "Collector"
                                ? "bg-blue-600 text-white"
                                : r === "Telesales"
                                ? "bg-purple-600 text-white"
                                : "bg-orange-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 1.50"
                            autoFocus
                          />
                          <button
                            onClick={() => handleCustomRateChange(collector)}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setEditingEmployee(null);
                              setTempRate("");
                            }}
                            className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(collector)}
                          className={cn(
                            "px-3 py-1 rounded-lg transition-colors",
                            role.customRate !== undefined
                              ? "bg-green-100 text-green-800 font-medium"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
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
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
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
