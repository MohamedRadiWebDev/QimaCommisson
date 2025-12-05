export interface ColumnMapping {
  payment: string;
  type: string;
  collector: string;
  sv: string;
  head: string;
  employeeType?: string;
}

export interface RawDataRow {
  payment: number;
  type: string;
  collector: string;
  sv: string;
  head: string;
  employeeType: string;
}

export interface CollectorData {
  name: string;
  payment: number;
  employeeType: string;
}

export interface SVData {
  name: string;
  payment: number;
}

export interface HeadData {
  name: string;
  payment: number;
}

export interface TypeData {
  typeName: string;
  collectors: CollectorData[];
  svs: SVData[];
  heads: HeadData[];
  totalPayment: number;
}

export interface CollectorGroup {
  collector: string;
  totalPayment: number;
  rate: number;
  commission: number;
}

export interface TypeGroup {
  type: string;
  collectors: CollectorGroup[];
  totalPayment: number;
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

export interface SVHeadSummaryRow {
  type: string;
  totalPayment: number;
  svRate: number;
  svCommission: number;
  headRate: number;
  headCommission: number;
}

export interface SVHeadSummary {
  rows: SVHeadSummaryRow[];
  totalPayment: number;
  totalSVCommission: number;
  totalHeadCommission: number;
}

export type Company = "Waseela" | "Ghazala" | "Marsa";
export type TargetStatus = "No Target" | "Target" | "Over Target";

export type EmployeeRole = "collector" | "tele" | "production" | "S.V" | "Head";

export interface Employee {
  name: string;
  type: EmployeeRole;
}

export interface EmployeeRolesMapping {
  [name: string]: EmployeeRole;
}
