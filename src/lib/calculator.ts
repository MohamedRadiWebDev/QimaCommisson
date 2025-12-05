import type { Company, CompanyRates, EmployeeRolesMapping } from "./types";

const WASEELA_RATES: CompanyRates = {
  Active: {
    defaultRates: {
      "سلمي يونس محمد": 1.0,
      "كريمه هانى": 1.5,
      "مريم جابر إسماعيل": 1.0,
      "ياسمين محمد رشاد الشحات": 1.0,
    },
    totalRate: 0.5,
  },
  "W.O": {
    defaultRates: {
      "سلمي يونس محمد": 1.5,
      "كريمه هانى": 2.0,
      "مريم جابر إسماعيل": 1.5,
      "ياسمين محمد رشاد الشحات": 1.5,
    },
    totalRate: 0.75,
  },
};

export function getCompanyRates(company: Company): CompanyRates {
  switch (company) {
    case "Waseela":
      return WASEELA_RATES;
    default:
      return WASEELA_RATES;
  }
}

export function getCollectorRate(
  company: Company,
  type: string,
  collectorName: string,
  employeeRoles: EmployeeRolesMapping
): number {
  const employeeRole = employeeRoles[collectorName];
  
  if (employeeRole?.customRate !== undefined && employeeRole.customRate > 0) {
    return employeeRole.customRate;
  }

  if (employeeRole?.role === "Telesales" || employeeRole?.role === "Production") {
    return 0;
  }

  const companyRates = getCompanyRates(company);
  const typeRates = companyRates[type];

  if (typeRates?.defaultRates[collectorName] !== undefined) {
    return typeRates.defaultRates[collectorName];
  }

  if (type === "Active") {
    return 1.0;
  } else if (type === "W.O") {
    return 1.5;
  }

  return 1.0;
}

export function getTypeTotalRate(company: Company, type: string): number {
  const companyRates = getCompanyRates(company);
  return companyRates[type]?.totalRate || 0.5;
}

export function calculateCommission(payment: number, rate: number): number {
  return (payment * rate) / 100;
}
