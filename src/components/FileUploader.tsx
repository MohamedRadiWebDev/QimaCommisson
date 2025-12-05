"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export default function FileUploader({ onFileSelect, isLoading }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && isValidExcelFile(file)) {
        setFileName(file.name);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && isValidExcelFile(file)) {
        setFileName(file.name);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const isValidExcelFile = (file: File): boolean => {
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    return validExtensions.includes(extension);
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-xl p-12 text-center transition-all bg-white",
        isDragging
          ? "border-emerald-500 bg-emerald-50"
          : "border-slate-300 hover:border-slate-400 hover:bg-slate-50",
        isLoading && "opacity-50 pointer-events-none"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center">
        {isLoading ? (
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-200 border-t-emerald-600 mb-4" />
        ) : (
          <div className="bg-slate-100 p-5 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
        )}

        <p className="text-xl font-semibold text-slate-800 mb-2">
          {isLoading
            ? "Processing file..."
            : fileName
            ? `Selected: ${fileName}`
            : "Drag & drop your Excel file here"}
        </p>

        <p className="text-sm text-slate-500 mb-6">
          Supports .xlsx, .xls, and .csv files
        </p>

        <label
          className={cn(
            "inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-emerald-700 transition-colors shadow-md",
            isLoading && "cursor-not-allowed"
          )}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Browse Files
          <input
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileInput}
            disabled={isLoading}
          />
        </label>
      </div>
    </div>
  );
}
