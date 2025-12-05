export interface ColumnMapping {
  payment: string;
  type: string;
  collector: string;
  sv: string;
  head: string;
}

export interface RawDataRow {
  [key: string]: string | number | undefined;
}

export interface NormalizedRow {
  payment: number;
  type: string;
  collector: string;
  sv: string;
  head: string;
}

export interface Employee {
  name: string;
  type: "collector" | "tele" | "production" | "S.V" | "Head";
}

export interface EmployeeRole {
  name: string;
  role: "Collector" | "Telesales" | "Production";
  customRate?: number;
}

export interface EmployeeRolesMapping {
  [employeeName: string]: EmployeeRole;
}

export interface CollectorData {
  collector: string;
  totalPayment: number;
  rate: number;
  commission: number;
}

export interface TypeGroup {
  type: string;
  collectors: CollectorData[];
  totalPayment: number;
  totalRate: number;
  totalCommission: number;
}

export interface SVGroup {
  sv: string;
  types: TypeGroup[];
  totalPayment: number;
  totalCommission: number;
}

export interface HeadGroup {
  head: string;
  svGroups: SVGroup[];
  totalPayment: number;
  totalCommission: number;
}

export interface ProcessedData {
  headGroups: HeadGroup[];
  grandTotalPayment: number;
  grandTotalCommission: number;
}

export type Company = 
  | "Raya" 
  | "VALU" 
  | "بنك الإسكندرية" 
  | "بنك كريدي أجريكول" 
  | "Money_Fellows" 
  | "Midtakseet" 
  | "Souhoola" 
  | "Tanmeyah" 
  | "Waseela" 
  | "Seven" 
  | "Erada" 
  | "Midbank";

export interface CompanyRates {
  [type: string]: {
    defaultRates: { [collectorName: string]: number };
    totalRate: number;
  };
}
