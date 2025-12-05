"use client";

import { useEffect, useState } from "react";
import RoleManager from "@/components/RoleManager";
import { useRolesStore } from "@/lib/store";
import Link from "next/link";

export default function RolesPage() {
  const [collectors, setCollectors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { employeeRoles } = useRolesStore();

  useEffect(() => {
    const storedCollectors = localStorage.getItem("lastCollectors");
    if (storedCollectors) {
      try {
        setCollectors(JSON.parse(storedCollectors));
      } catch {
        setCollectors([]);
      }
    }
    setIsLoading(false);
  }, []);

  const stats = {
    total: collectors.length,
    withCustomSettings: Object.keys(employeeRoles).filter((name) =>
      collectors.includes(name)
    ).length,
    collectors: collectors.filter(
      (c) => !employeeRoles[c] || employeeRoles[c].role === "Collector"
    ).length,
    telesales: collectors.filter((c) => employeeRoles[c]?.role === "Telesales")
      .length,
    production: collectors.filter((c) => employeeRoles[c]?.role === "Production")
      .length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-200 border-t-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manage Employee Roles</h1>
          <p className="text-slate-600 mt-1">
            Assign roles and custom commission rates to employees
          </p>
        </div>
        <Link
          href="/upload"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 font-semibold shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload New File
        </Link>
      </div>

      {collectors.length > 0 && (
        <div className="grid md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-500 font-medium">Total Employees</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-500 font-medium">Custom Settings</p>
            <p className="text-2xl font-bold text-violet-600">{stats.withCustomSettings}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl shadow-lg border border-emerald-200 p-4">
            <p className="text-sm text-emerald-700 font-medium">Collectors</p>
            <p className="text-2xl font-bold text-emerald-800">{stats.collectors}</p>
          </div>
          <div className="bg-violet-50 rounded-xl shadow-lg border border-violet-200 p-4">
            <p className="text-sm text-violet-700 font-medium">Telesales</p>
            <p className="text-2xl font-bold text-violet-800">{stats.telesales}</p>
          </div>
          <div className="bg-amber-50 rounded-xl shadow-lg border border-amber-200 p-4">
            <p className="text-sm text-amber-700 font-medium">Production</p>
            <p className="text-2xl font-bold text-amber-800">{stats.production}</p>
          </div>
        </div>
      )}

      <RoleManager collectors={collectors} />

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-3">How Roles Work</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-emerald-700 mb-1">Collector</h4>
            <p className="text-slate-600">
              Default role. Uses company-specific commission rates based on Type (Active/W.O).
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-violet-700 mb-1">Telesales</h4>
            <p className="text-slate-600">
              Commission is set to 0% unless a custom rate is specified.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-amber-700 mb-1">Production</h4>
            <p className="text-slate-600">
              Commission is set to 0% unless a custom rate is specified.
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            <strong className="text-slate-800">Custom Rate:</strong> When you set a custom rate for any employee, it will
            override the company&apos;s default rate regardless of their role or type.
          </p>
        </div>
      </div>
    </div>
  );
}
