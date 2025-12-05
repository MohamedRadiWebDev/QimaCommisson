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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Employee Roles</h1>
          <p className="text-gray-600 mt-1">
            Assign roles and custom commission rates to employees
          </p>
        </div>
        <Link
          href="/upload"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload New File
        </Link>
      </div>

      {collectors.length > 0 && (
        <div className="grid md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Employees</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Custom Settings</p>
            <p className="text-2xl font-bold text-purple-600">{stats.withCustomSettings}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-blue-200 p-4 bg-blue-50">
            <p className="text-sm text-blue-600">Collectors</p>
            <p className="text-2xl font-bold text-blue-700">{stats.collectors}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-purple-200 p-4 bg-purple-50">
            <p className="text-sm text-purple-600">Telesales</p>
            <p className="text-2xl font-bold text-purple-700">{stats.telesales}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-orange-200 p-4 bg-orange-50">
            <p className="text-sm text-orange-600">Production</p>
            <p className="text-2xl font-bold text-orange-700">{stats.production}</p>
          </div>
        </div>
      )}

      <RoleManager collectors={collectors} />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How Roles Work</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Collector</h4>
            <p className="text-blue-700">
              Default role. Uses company-specific commission rates based on Type (Active/W.O).
            </p>
          </div>
          <div>
            <h4 className="font-medium text-purple-800 mb-1">Telesales</h4>
            <p className="text-purple-700">
              Commission is set to 0% unless a custom rate is specified.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-orange-800 mb-1">Production</h4>
            <p className="text-orange-700">
              Commission is set to 0% unless a custom rate is specified.
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Custom Rate:</strong> When you set a custom rate for any employee, it will
            override the company&apos;s default rate regardless of their role or type.
          </p>
        </div>
      </div>
    </div>
  );
}
