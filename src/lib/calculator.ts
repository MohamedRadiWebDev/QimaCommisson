
import type { Company, EmployeeRolesMapping } from "./types";
import { loadCompanyRates } from "./companyRatesLoader";

// Helper to get custom rate if available (to be called from client components)
export function getCustomRateIfExists(collectorName: string, employees: Array<{name: string; customRate?: number}>): number | null {
  const employee = employees.find(emp => emp.name === collectorName);
  if (employee?.customRate !== undefined && employee.customRate > 0) {
    return employee.customRate;
  }
  return null;
}

import type { Company, EmployeeRolesMapping } from "./types";
import { loadCompanyRates } from "./companyRatesLoader";

const companyRatesData = loadCompanyRates();

function parsePercentage(value: string | undefined): number {
  if (!value || value === "") return 0;
  const numStr = value.replace("%", "").trim();
  return parseFloat(numStr) || 0;
}

function normalizeType(type: string): string {
  const lower = type.toLowerCase().trim();
  if (lower === "w/o" || lower === "wo" || lower === "w.o" || lower.includes("w/o")) return "w/O";
  if (lower === "active" || lower.includes("active")) return "Active";
  return type;
}

function normalizeEmployeeType(empType: string): string {
  const lower = empType.toLowerCase().trim();
  if (lower === "tele" || lower === "telesales") return "Tele";
  if (lower === "collector") return "collector";
  if (lower === "production") return "production";
  if (lower === "s.v" || lower === "sv" || lower === "supervisor") return "S.V";
  if (lower === "head") return "Head";
  return empType;
}

interface RateEntry {
  Employee_Type: string;
  Type?: string;
  Segment?: string;
  Sub_Segment?: string;
  "No Target"?: string;
  Target?: string;
  "Over Target"?: string;
  no?: string;
  T?: string;
  over?: string;
  [key: string]: string | undefined;
}

interface CompanyData {
  Description?: string;
  Data?: RateEntry[];
  Active_Segments?: RateEntry[];
  wO_Segments?: RateEntry[];
  Ticket_Size_Segments?: RateEntry[];
  Revolving_Segments?: RateEntry[];
  CL_Segments?: RateEntry[];
  [key: string]: unknown;
}

function getRateFromEntry(entry: RateEntry, targetStatus: "No Target" | "Target" | "Over Target"): number {
  if (targetStatus === "Target") {
    const rate = entry["Target"] || entry["T"];
    if (rate && rate !== "") return parsePercentage(rate);
  }
  
  if (targetStatus === "Over Target") {
    const rate = entry["Over Target"] || entry["over"];
    if (rate && rate !== "") return parsePercentage(rate);
    const targetRate = entry["Target"] || entry["T"];
    if (targetRate && targetRate !== "") return parsePercentage(targetRate);
  }
  
  const noTargetRate = entry["No Target"] || entry["no"];
  if (noTargetRate && noTargetRate !== "") return parsePercentage(noTargetRate);
  
  const targetRate = entry["Target"] || entry["T"];
  if (targetRate && targetRate !== "") return parsePercentage(targetRate);
  
  return 0;
}

export function getCommissionRateFromJson(
  company: Company,
  type: string,
  employeeType: string,
  targetStatus: "No Target" | "Target" | "Over Target" = "No Target"
): number {
  const companyData = companyRatesData[company as keyof typeof companyRatesData] as CompanyData | undefined;
  if (!companyData) {
    return getDefaultRate(employeeType, type);
  }

  const normalizedType = normalizeType(type);
  const normalizedEmpType = normalizeEmployeeType(employeeType);
  const isWO = normalizedType === "w/O" || type.toLowerCase().includes("w/o") || type.toLowerCase().includes("wo");
  const isActive = normalizedType === "Active" || type.toLowerCase().includes("active");

  if (companyData.Data) {
    const rateEntry = companyData.Data.find((entry: RateEntry) => {
      const entryEmpType = normalizeEmployeeType(entry.Employee_Type);
      const entryType = entry.Type ? normalizeType(entry.Type) : (entry.Segment ? normalizeType(entry.Segment) : null);
      
      if (entryEmpType !== normalizedEmpType) return false;
      
      if (entryType === normalizedType) return true;
      if (isWO && (entryType === "w/O" || entry.Type?.toLowerCase().includes("w/o"))) return true;
      if (isActive && (entryType === "Active" || entry.Type?.toLowerCase().includes("active"))) return true;
      
      return false;
    });

    if (rateEntry) {
      const rate = getRateFromEntry(rateEntry, targetStatus);
      if (rate > 0) return rate;
    }
    
    const fallbackEntry = companyData.Data.find((entry: RateEntry) => {
      const entryEmpType = normalizeEmployeeType(entry.Employee_Type);
      return entryEmpType === normalizedEmpType;
    });
    
    if (fallbackEntry) {
      const rate = getRateFromEntry(fallbackEntry, targetStatus);
      if (rate > 0) return rate;
    }
  }

  if (isWO && companyData.wO_Segments) {
    const rateEntry = companyData.wO_Segments.find((entry: RateEntry) => {
      const entryEmpType = normalizeEmployeeType(entry.Employee_Type);
      return entryEmpType === normalizedEmpType || 
             entry.Employee_Type.toLowerCase() === normalizedEmpType.toLowerCase();
    });

    if (rateEntry) {
      if (targetStatus === "Over Target") {
        const overRate = rateEntry["over"] || rateEntry[">141%"] || rateEntry[">121%"];
        if (overRate && overRate !== "") return parsePercentage(overRate);
      }
      if (targetStatus === "Target") {
        const targetRate = rateEntry["T"] || rateEntry[">101%"] || rateEntry[">100%"];
        if (targetRate && targetRate !== "") return parsePercentage(targetRate);
      }
      const noTargetRate = rateEntry["no"] || rateEntry[">100%"];
      if (noTargetRate && noTargetRate !== "") return parsePercentage(noTargetRate);
    }
  }

  if (isActive && companyData.Active_Segments) {
    const rateEntry = companyData.Active_Segments.find((entry: RateEntry) => {
      const entryEmpType = normalizeEmployeeType(entry.Employee_Type);
      return entryEmpType === normalizedEmpType;
    });

    if (rateEntry) {
      const rate = getRateFromEntry(rateEntry, targetStatus);
      if (rate > 0) return rate;
    }
  }

  return getDefaultRate(normalizedEmpType, normalizedType);
}

function getDefaultRate(employeeType: string, type: string): number {
  const normalizedEmpType = normalizeEmployeeType(employeeType);
  const isWO = type.toLowerCase().includes("w/o") || type.toLowerCase().includes("wo");
  
  if (normalizedEmpType === "collector") return isWO ? 2.0 : 1.5;
  if (normalizedEmpType === "Tele") return isWO ? 1.5 : 1.0;
  if (normalizedEmpType === "S.V") return isWO ? 0.75 : 0.5;
  if (normalizedEmpType === "Head") return isWO ? 0.25 : 0.25;
  if (normalizedEmpType === "production") return 2.0;
  
  return 1.5;
}

export function getSVRate(
  company: Company,
  type: string,
  targetStatus: "No Target" | "Target" | "Over Target" = "No Target"
): number {
  return getCommissionRateFromJson(company, type, "S.V", targetStatus);
}

export function getHeadRate(
  company: Company,
  type: string,
  targetStatus: "No Target" | "Target" | "Over Target" = "No Target"
): number {
  return getCommissionRateFromJson(company, type, "Head", targetStatus);
}

export function getCollectorRate(
  company: Company,
  type: string,
  collectorName: string,
  employeeRoles: EmployeeRolesMapping,
  targetStatus: "No Target" | "Target" | "Over Target" = "No Target"
): number {
  // Default employee type is collector
  let employeeType = "collector";
  
  // Check if employee has a role defined in employeeRoles
  const employeeRole = employeeRoles[collectorName];
  if (employeeRole?.role === "S.V") {
    employeeType = "S.V";
  } else if (employeeRole?.role === "Head") {
    employeeType = "Head";
  } else if (employeeRole?.role === "Collector") {
    employeeType = "collector";
  }

  return getCommissionRateFromJson(company, type, employeeType, targetStatus);
}

export function getTypeTotalRate(company: Company, type: string): number {
  return getSVRate(company, type, "No Target");
}

export function calculateCommission(payment: number, rate: number): number {
  return (payment * rate) / 100;
}

export function calculateTypeTotalCommission(
  company: Company,
  type: string,
  totalPayment: number
): number {
  const rate = getTypeTotalRate(company, type);
  return (totalPayment * rate) / 100;
}

export function calculateSVCommission(
  company: Company,
  type: string,
  totalPayment: number,
  targetStatus: "No Target" | "Target" | "Over Target" = "No Target"
): { rate: number; commission: number } {
  const rate = getSVRate(company, type, targetStatus);
  const commission = (totalPayment * rate) / 100;
  return { rate, commission };
}

export function calculateHeadCommission(
  company: Company,
  type: string,
  totalPayment: number,
  targetStatus: "No Target" | "Target" | "Over Target" = "No Target"
): { rate: number; commission: number } {
  const rate = getHeadRate(company, type, targetStatus);
  const commission = (totalPayment * rate) / 100;
  return { rate, commission };
}
