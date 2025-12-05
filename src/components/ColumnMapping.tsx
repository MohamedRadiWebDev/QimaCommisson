"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { ColumnMapping as ColumnMappingType } from "@/lib/types";

interface ColumnMappingProps {
  columns: string[];
  onConfirm: (mapping: ColumnMappingType) => void;
  initialMapping?: ColumnMappingType | null;
}

const MAPPING_FIELDS = [
  { key: "payment", label: "Payment Column", description: "Column containing payment amounts", required: true },
  { key: "type", label: "Type Column", description: "Column containing type (Active, W.O, etc.)", required: true },
  { key: "collector", label: "Collector Column", description: "Column containing collector names", required: true },
  { key: "sv", label: "S.V Column", description: "Column containing S.V (supervisor) names", required: true },
  { key: "head", label: "Head Column", description: "Column containing head/manager names", required: true },
  { key: "employeeType", label: "Employee Type Column", description: "Column containing employee type (Tele, Collector, etc.)", required: true },
] as const;

export default function ColumnMapping({
  columns,
  onConfirm,
  initialMapping,
}: ColumnMappingProps) {
  const [mapping, setMapping] = useState<Partial<ColumnMappingType>>({
    payment: initialMapping?.payment || "",
    type: initialMapping?.type || "",
    collector: initialMapping?.collector || "",
    sv: initialMapping?.sv || "",
    head: initialMapping?.head || "",
    employeeType: initialMapping?.employeeType || "",
  });

  useEffect(() => {
    if (columns.length > 0 && !initialMapping) {
      const autoMapping: Partial<ColumnMappingType> = {};
      
      columns.forEach((col) => {
        const lowerCol = col.toLowerCase();
        if (lowerCol.includes("payment") || lowerCol.includes("agency")) {
          if (!autoMapping.payment) autoMapping.payment = col;
        }
        if (lowerCol === "type" || lowerCol.includes("bucket")) {
          if (!autoMapping.type) autoMapping.type = col;
        }
        if (lowerCol.includes("collector") && !lowerCol.includes("type")) {
          if (!autoMapping.collector) autoMapping.collector = col;
        }
        if (lowerCol === "s.v" || lowerCol === "sv" || lowerCol.includes("supervisor")) {
          if (!autoMapping.sv) autoMapping.sv = col;
        }
        if (lowerCol === "head" || lowerCol.includes("manager")) {
          if (!autoMapping.head) autoMapping.head = col;
        }
        if (lowerCol.includes("employee") && lowerCol.includes("type")) {
          if (!autoMapping.employeeType) autoMapping.employeeType = col;
        }
        if (lowerCol === "emp type" || lowerCol === "emptype" || lowerCol === "emp_type") {
          if (!autoMapping.employeeType) autoMapping.employeeType = col;
        }
        if (lowerCol === "tele" || lowerCol === "collector type") {
          if (!autoMapping.employeeType) autoMapping.employeeType = col;
        }
      });

      if (Object.keys(autoMapping).length > 0) {
        setMapping((prev) => ({ ...prev, ...autoMapping }));
      }
    }
  }, [columns, initialMapping]);

  const handleChange = (field: keyof ColumnMappingType, value: string) => {
    setMapping((prev) => ({ ...prev, [field]: value }));
  };

  const isComplete = MAPPING_FIELDS.filter(f => f.required).every((field) => mapping[field.key]);

  const handleConfirm = () => {
    if (isComplete) {
      onConfirm(mapping as ColumnMappingType);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-2">Column Mapping</h2>
      <p className="text-slate-600 mb-6">
        Select which Excel column corresponds to each required field
      </p>

      <div className="space-y-4">
        {MAPPING_FIELDS.map((field) => (
          <div key={field.key} className="grid md:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <p className="text-xs text-slate-500">{field.description}</p>
            </div>
            <div className="md:col-span-2">
              <select
                value={mapping[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className={cn(
                  "w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-800 font-medium",
                  mapping[field.key]
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-slate-300 bg-white"
                )}
              >
                <option value="">-- Select Column --</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm">
          {isComplete ? (
            <span className="text-emerald-700 flex items-center font-semibold">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              All columns mapped
            </span>
          ) : (
            <span className="text-amber-700 flex items-center font-semibold">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Please map all required columns
            </span>
          )}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!isComplete}
          className={cn(
            "px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-md",
            isComplete
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
        >
          Confirm Mapping & Process Data
        </button>
      </div>
    </div>
  );
}
