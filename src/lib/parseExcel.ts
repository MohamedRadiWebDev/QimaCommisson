import * as XLSX from "xlsx";
import type { RawDataRow } from "./types";

export interface ParsedExcel {
  columns: string[];
  rows: RawDataRow[];
}

export function parseExcelFile(file: File): Promise<ParsedExcel> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json<RawDataRow>(worksheet, {
          defval: "",
          raw: false,
        });

        if (jsonData.length === 0) {
          reject(new Error("Excel file is empty or has no data"));
          return;
        }

        const columns = Object.keys(jsonData[0]);
        
        resolve({
          columns,
          rows: jsonData,
        });
      } catch (error) {
        reject(new Error("Failed to parse Excel file: " + (error as Error).message));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsBinaryString(file);
  });
}

export function normalizeData(
  rows: RawDataRow[],
  mapping: {
    payment: string;
    type: string;
    collector: string;
    sv: string;
    head: string;
    employeeType: string;
  }
) {
  return rows
    .map((row) => {
      const paymentValue = row[mapping.payment];
      const payment = typeof paymentValue === "number" 
        ? paymentValue 
        : parseFloat(String(paymentValue).replace(/,/g, "")) || 0;

      return {
        payment,
        type: String(row[mapping.type] || "").trim(),
        collector: String(row[mapping.collector] || "").trim(),
        sv: String(row[mapping.sv] || "").trim(),
        head: String(row[mapping.head] || "").trim(),
        employeeType: String(row[mapping.employeeType] || "collector").trim(),
      };
    })
    .filter((row) => row.payment > 0 && row.collector);
}

export function getUniqueCollectors(rows: RawDataRow[], collectorColumn: string): string[] {
  const collectors = new Set<string>();
  
  rows.forEach((row) => {
    const collector = String(row[collectorColumn] || "").trim();
    if (collector) {
      collectors.add(collector);
    }
  });

  return Array.from(collectors).sort();
}
