"use client";

import { useCallback, useEffect, useState } from "react";
import FileUploader from "@/components/FileUploader";
import ColumnMapping from "@/components/ColumnMapping";
import CompanySelector from "@/components/CompanySelector";
import DataTable from "@/components/DataTable";
import ExportButtons from "@/components/ExportButtons";
import { useAppStore, useRolesStore, useDomainsStore } from "@/lib/store";
import { parseExcelFile, normalizeData, getUniqueCollectors } from "@/lib/parseExcel";
import { groupAndCalculate } from "@/lib/grouping";
import type { ColumnMapping as ColumnMappingType, Company, TargetStatus } from "@/lib/types";

export default function UploadPage() {
  const {
    columns,
    rawData,
    columnMapping,
    processedData,
    selectedCompany,
    selectedTargetStatus,
    isProcessing,
    error,
    setColumns,
    setRawData,
    setColumnMapping,
    setProcessedData,
    setSelectedCompany,
    setSelectedTargetStatus,
    setIsProcessing,
    setError,
    reset,
  } = useAppStore();

  const { employeeRoles } = useRolesStore();
  const { addDomain } = useDomainsStore();
  const [step, setStep] = useState<"upload" | "mapping" | "results">("upload");
  const [domainName, setDomainName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
        const result = groupAndCalculate(normalized, selectedCompany, employeeRoles, selectedTargetStatus);
        setProcessedData(result);
        setStep("results");
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsProcessing(false);
      }
    },
    [rawData, selectedCompany, employeeRoles, selectedTargetStatus, setColumnMapping, setProcessedData, setIsProcessing, setError]
  );

  const handleCompanyChange = useCallback(
    (company: Company) => {
      setSelectedCompany(company);

      if (columnMapping && rawData.length > 0) {
        try {
          const normalized = normalizeData(rawData, columnMapping);
          const result = groupAndCalculate(normalized, company, employeeRoles, selectedTargetStatus);
          setProcessedData(result);
        } catch (err) {
          setError((err as Error).message);
        }
      }
    },
    [columnMapping, rawData, employeeRoles, selectedTargetStatus, setSelectedCompany, setProcessedData, setError]
  );

  const handleTargetStatusChange = useCallback(
    (status: TargetStatus) => {
      setSelectedTargetStatus(status);

      if (columnMapping && rawData.length > 0) {
        try {
          const normalized = normalizeData(rawData, columnMapping);
          const result = groupAndCalculate(normalized, selectedCompany, employeeRoles, status);
          setProcessedData(result);
        } catch (err) {
          setError((err as Error).message);
        }
      }
    },
    [columnMapping, rawData, employeeRoles, selectedCompany, setSelectedTargetStatus, setProcessedData, setError]
  );

  const handleReset = useCallback(() => {
    reset();
    setStep("upload");
    setDomainName("");
    setShowSaveModal(false);
    setIsSaved(false);
  }, [reset]);

  const handleSaveDomain = useCallback(() => {
    if (!processedData || !domainName.trim()) return;

    addDomain({
      name: domainName.trim(),
      company: selectedCompany,
      targetStatus: selectedTargetStatus,
      processedData: processedData,
    });

    setShowSaveModal(false);
    setIsSaved(true);
    setDomainName("");
  }, [processedData, domainName, selectedCompany, selectedTargetStatus, addDomain]);

  useEffect(() => {
    if (columnMapping && rawData.length > 0 && step === "results") {
      try {
        const normalized = normalizeData(rawData, columnMapping);
        const result = groupAndCalculate(normalized, selectedCompany, employeeRoles, selectedTargetStatus);
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
            <div className="space-y-4">
              <CompanySelector
                selectedCompany={selectedCompany}
                onChange={handleCompanyChange}
                companies={["Waseela", "Ghazala", "Marsa"]}
              />
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  حالة التارجت
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  اختر نوع معدل العمولة
                </p>
                <select
                  value={selectedTargetStatus}
                  onChange={(e) => handleTargetStatusChange(e.target.value as TargetStatus)}
                  className="w-full px-4 py-2.5 border-2 border-amber-400 bg-amber-50 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-slate-800 font-medium"
                >
                  <option value="No Target">No Target</option>
                  <option value="Target">Target</option>
                  <option value="Over Target">Over Target</option>
                </select>
              </div>
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

          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  حالة التارجت
                </label>
                <select
                  value={selectedTargetStatus}
                  onChange={(e) => handleTargetStatusChange(e.target.value as TargetStatus)}
                  className="px-3 py-1.5 border-2 border-amber-400 bg-amber-50 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-slate-800 font-medium text-sm"
                >
                  <option value="No Target">No Target</option>
                  <option value="Target">Target</option>
                  <option value="Over Target">Over Target</option>
                </select>
              </div>
              {!isSaved ? (
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center gap-2 font-semibold shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  حفظ كنطاق
                </button>
              ) : (
                <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg flex items-center gap-2 font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  تم الحفظ!
                </div>
              )}
            </div>
            <ExportButtons data={processedData} company={selectedCompany} />
          </div>

          <DataTable data={processedData} company={selectedCompany} />
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">حفظ كنطاق جديد</h3>
                <p className="text-sm text-slate-500">أدخل اسم النطاق للحفظ في الصفحة الرئيسية</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                اسم النطاق
              </label>
              <input
                type="text"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                placeholder="مثال: شركة Waseela - ديسمبر 2025"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-800 placeholder:text-slate-400"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setDomainName("");
                }}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveDomain}
                disabled={!domainName.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                حفظ النطاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}