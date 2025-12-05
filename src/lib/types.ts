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

export interface ProcessedData {
  types: TypeData[];
  targetStatus: TargetStatus;
}

export type Company = "Waseela" | "Ghazala" | "Marsa";
export type TargetStatus = "No Target" | "Target" | "Over Target";

export interface Employee {
  name: string;
  type: "collector" | "tele" | "production" | "S.V" | "Head";
}