
"use client";

import { useState, useMemo } from "react";
import { useEmployeeStore } from "@/lib/employeeStore";
import type { Employee } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

const EMPLOYEE_TYPES = ["collector", "tele", "production", "S.V", "Head"] as const;

export default function EmployeesPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployeeStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeType, setNewEmployeeType] = useState<Employee["type"]>("collector");
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [tempType, setTempType] = useState<Employee["type"]>("collector");

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    return employees.filter((emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const handleAddEmployee = () => {
    if (!newEmployeeName.trim()) return;
    
    const exists = employees.find((emp) => emp.name === newEmployeeName.trim());
    if (exists) {
      alert("الموظف موجود بالفعل!");
      return;
    }

    addEmployee({
      name: newEmployeeName.trim(),
      type: newEmployeeType,
    });

    setNewEmployeeName("");
    setNewEmployeeType("collector");
    setShowAddForm(false);
  };

  const startEditing = (employee: Employee) => {
    setEditingEmployee(employee.name);
    setTempType(employee.type);
  };

  const saveEdit = (name: string) => {
    updateEmployee(name, tempType);
    setEditingEmployee(null);
  };

  const stats = {
    total: employees.length,
    collectors: employees.filter((e) => e.type === "collector").length,
    tele: employees.filter((e) => e.type === "tele").length,
    production: employees.filter((e) => e.type === "production").length,
    sv: employees.filter((e) => e.type === "S.V").length,
    heads: employees.filter((e) => e.type === "Head").length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">إدارة الموظفين</h1>
          <p className="text-slate-600 mt-1">
            إضافة وتعديل وحذف الموظفين ونوع وظيفتهم
          </p>
        </div>
        <Link
          href="/upload"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 font-semibold shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          رفع بيانات
        </Link>
      </div>

      <div className="grid md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500 font-medium">إجمالي الموظفين</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl shadow-lg border border-emerald-200 p-4">
          <p className="text-sm text-emerald-700 font-medium">Collectors</p>
          <p className="text-2xl font-bold text-emerald-800">{stats.collectors}</p>
        </div>
        <div className="bg-violet-50 rounded-xl shadow-lg border border-violet-200 p-4">
          <p className="text-sm text-violet-700 font-medium">Tele</p>
          <p className="text-2xl font-bold text-violet-800">{stats.tele}</p>
        </div>
        <div className="bg-amber-50 rounded-xl shadow-lg border border-amber-200 p-4">
          <p className="text-sm text-amber-700 font-medium">Production</p>
          <p className="text-2xl font-bold text-amber-800">{stats.production}</p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-lg border border-blue-200 p-4">
          <p className="text-sm text-blue-700 font-medium">S.V</p>
          <p className="text-2xl font-bold text-blue-800">{stats.sv}</p>
        </div>
        <div className="bg-indigo-50 rounded-xl shadow-lg border border-indigo-200 p-4">
          <p className="text-sm text-indigo-700 font-medium">Heads</p>
          <p className="text-2xl font-bold text-indigo-800">{stats.heads}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <input
              type="text"
              placeholder="بحث عن موظف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800"
            />
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              إضافة موظف جديد
            </button>
          </div>

          {showAddForm && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h3 className="font-bold text-slate-800 mb-3">إضافة موظف جديد</h3>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="اسم الموظف"
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  className="flex-1 px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
                <select
                  value={newEmployeeType}
                  onChange={(e) => setNewEmployeeType(e.target.value as Employee["type"])}
                  className="px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
                >
                  {EMPLOYEE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddEmployee}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold"
                >
                  حفظ
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewEmployeeName("");
                    setNewEmployeeType("collector");
                  }}
                  className="px-6 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 font-bold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-right font-bold text-slate-700">اسم الموظف</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700">النوع</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                    لا يوجد موظفين
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => {
                  const isEditing = editingEmployee === employee.name;

                  return (
                    <tr key={employee.name} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">
                        {employee.name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          {isEditing ? (
                            <select
                              value={tempType}
                              onChange={(e) => setTempType(e.target.value as Employee["type"])}
                              className="px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
                            >
                              {EMPLOYEE_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={cn(
                                "px-4 py-1.5 rounded-lg font-semibold",
                                employee.type === "collector"
                                  ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-300"
                                  : employee.type === "tele"
                                  ? "bg-violet-100 text-violet-800 border-2 border-violet-300"
                                  : employee.type === "production"
                                  ? "bg-amber-100 text-amber-800 border-2 border-amber-300"
                                  : employee.type === "S.V"
                                  ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                                  : "bg-indigo-100 text-indigo-800 border-2 border-indigo-300"
                              )}
                            >
                              {employee.type}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(employee.name)}
                                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold"
                              >
                                حفظ
                              </button>
                              <button
                                onClick={() => setEditingEmployee(null)}
                                className="px-4 py-1.5 bg-slate-500 text-white rounded-lg hover:bg-slate-600 font-bold"
                              >
                                إلغاء
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(employee)}
                                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                              >
                                تعديل
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`هل تريد حذف ${employee.name}؟`)) {
                                    deleteEmployee(employee.name);
                                  }
                                }}
                                className="px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                              >
                                حذف
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-600 font-medium">
            عرض {filteredEmployees.length} من {employees.length} موظف
          </p>
        </div>
      </div>
    </div>
  );
}
