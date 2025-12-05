"use client";

import { useCallback, useEffect, useState } from "react";
import FileUploader from "@/components/FileUploader";
import ColumnMapping from "@/components/ColumnMapping";
import CompanySelector from "@/components/CompanySelector";
import DataTable from "@/components/DataTable";
import { useAppStore, useRolesStore } from "@/lib/store";
import { parseExcelFile, normalizeData, getUniqueCollectors } from "@/lib/parseExcel";
import { groupAndCalculate } from "@/lib/grouping";
import type { ColumnMapping as ColumnMappingType, Company } from "@/lib/types";

export default function UploadPage() {
  const {
    columns,
    rawData,
    columnMapping,
    processedData,
    selectedCompany,
    isProcessing,
    error,
    setColumns,
    setRawData,
    setColumnMapping,
    setProcessedData,
    setSelectedCompany,
    setIsProcessing,
    setError,
    reset,
  } = useAppStore();

  const { employeeRoles } = useRolesStore();
  const [step, setStep] = useState<"upload" | "mapping" | "results">("upload");

  const handleFileSelect = useCallback(
    async (file: File) => {
      reset();
      setStep("upload");
      setIsProcessing(true);

      try {
        const parsed = await parseExcelFile(file);
        setColumns(parsed.columns);
        setRawData(parsed.rows);
        setStep("mapping");
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsProcessing(false);
      }
    },
    [reset, setColumns, setRawData, setIsProcessing, setError]
  );

  const handleMappingConfirm = useCallback(
    (mapping: ColumnMappingType) => {
      setColumnMapping(mapping);
      setIsProcessing(true);

      try {
        const normalized = normalizeData(rawData, mapping);
        const result = groupAndCalculate(normalized, selectedCompany, employeeRoles);
        setProcessedData(result);
        setStep("results");
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsProcessing(false);
      }
    },
    [rawData, selectedCompany, employeeRoles, setColumnMapping, setProcessedData, setIsProcessing, setError]
  );

  const handleCompanyChange = useCallback(
    (company: Company) => {
      setSelectedCompany(company);
      
      if (columnMapping && rawData.length > 0) {
        try {
          const normalized = normalizeData(rawData, columnMapping);
          const result = groupAndCalculate(normalized, company, employeeRoles);
          setProcessedData(result);
        } catch (err) {
          setError((err as Error).message);
        }
      }
    },
    [columnMapping, rawData, employeeRoles, setSelectedCompany, setProcessedData, setError]
  );

  const handleReset = useCallback(() => {
    reset();
    setStep("upload");
  }, [reset]);

  useEffect(() => {
    if (columnMapping && rawData.length > 0 && step === "results") {
      try {
        const normalized = normalizeData(rawData, columnMapping);
        const result = groupAndCalculate(normalized, selectedCompany, employeeRoles);
        setProcessedData(result);
      } catch (err) {
        setError((err as Error).message);
      }
    }
  }, [employeeRoles]);

  const uniqueCollectors = columnMapping
    ? getUniqueCollectors(rawData, columnMapping.collector)
    : [];

  useEffect(() => {
    if (uniqueCollectors.length > 0) {
      localStorage.setItem("lastCollectors", JSON.stringify(uniqueCollectors));
    }
  }, [uniqueCollectors]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Upload Excel File</h1>
          <p className="text-slate-600 mt-1">
            Upload your data file and map columns to calculate commissions
          </p>
        </div>
        {step !== "upload" && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 font-semibold shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Start Over
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <div className={`flex items-center ${step === "upload" ? "text-emerald-600" : "text-slate-400"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === "upload" ? "bg-emerald-600 text-white" : columns.length > 0 ? "bg-emerald-500 text-white" : "bg-slate-300 text-slate-600"}`}>
            {columns.length > 0 ? "✓" : "1"}
          </div>
          <span className="ml-2 text-sm font-semibold">Upload</span>
        </div>
        <div className="flex-1 flex items-center">
          <div className="h-1 w-full bg-slate-200 rounded"></div>
        </div>
        <div className={`flex items-center ${step === "mapping" ? "text-emerald-600" : "text-slate-400"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === "mapping" ? "bg-emerald-600 text-white" : columnMapping ? "bg-emerald-500 text-white" : "bg-slate-300 text-slate-600"}`}>
            {columnMapping ? "✓" : "2"}
          </div>
          <span className="ml-2 text-sm font-semibold">Map Columns</span>
        </div>
        <div className="flex-1 flex items-center">
          <div className="h-1 w-full bg-slate-200 rounded"></div>
        </div>
        <div className={`flex items-center ${step === "results" ? "text-emerald-600" : "text-slate-400"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === "results" ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-600"}`}>
            3
          </div>
          <span className="ml-2 text-sm font-semibold">Results</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-center font-medium">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {step === "upload" && (
        <FileUploader onFileSelect={handleFileSelect} isLoading={isProcessing} />
      )}

      {step === "mapping" && columns.length > 0 && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ColumnMapping
                columns={columns}
                onConfirm={handleMappingConfirm}
                initialMapping={columnMapping}
              />
            </div>
            <div>
              <CompanySelector
                selectedCompany={selectedCompany}
                onCompanyChange={handleCompanyChange}
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 mb-2">File Preview</h3>
            <p className="text-sm text-slate-600">
              Found {columns.length} columns and {rawData.length} rows
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {columns.slice(0, 10).map((col) => (
                <span key={col} className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-700 font-medium">
                  {col}
                </span>
              ))}
              {columns.length > 10 && (
                <span className="px-2 py-1 bg-slate-200 rounded text-xs text-slate-600 font-medium">
                  +{columns.length - 10} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {step === "results" && processedData && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500 font-medium">Total Heads</p>
              <p className="text-2xl font-bold text-slate-800">{processedData.headGroups.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500 font-medium">Total S.V</p>
              <p className="text-2xl font-bold text-slate-800">
                {processedData.headGroups.reduce((acc, h) => acc + h.svGroups.length, 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500 font-medium">Grand Total Payment</p>
              <p className="text-2xl font-bold text-slate-800">
                {processedData.grandTotalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500 font-medium">Grand Total Commission</p>
              <p className="text-2xl font-bold text-emerald-600">
                {processedData.grandTotalCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <CompanySelector
              selectedCompany={selectedCompany}
              onCompanyChange={handleCompanyChange}
            />
          </div>

          <DataTable data={processedData} company={selectedCompany} />
        </div>
      )}
    </div>
  );
}
