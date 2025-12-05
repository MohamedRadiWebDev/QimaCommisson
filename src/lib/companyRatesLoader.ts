
import companyRatesData from "./companyRates.json";

export type CompanyRatesData = typeof companyRatesData;

export function loadCompanyRates(): CompanyRatesData {
  return companyRatesData;
}

export function getAvailableCompanies(): string[] {
  return Object.keys(companyRatesData);
}
