"use client";

import type { Company } from "@/lib/types";
import { cn } from "@/lib/utils";
import { loadCompanyRates } from "@/lib/companyRatesLoader";
import { useMemo } from "react";

interface CompanySelectorProps {
  selectedCompany: Company;
  onChange: (company: Company) => void;
}

const COMPANY_DESCRIPTIONS: Record<string, string> = {
  "Raya": "Raya - Rates",
  "VALU": "VALU - Installments",
  "بنك الإسكندرية": "Bank of Alexandria - Loans",
  "بنك كريدي أجريكول": "Crédit Agricole Egypt - Loans",
  "Money_Fellows": "Money Fellows - Microfinance",
  "Midtakseet": "Midtakseet - Installments",
  "Souhoola": "Souhoola - Installments",
  "Tanmeyah": "Tanmeyah - SME Loans",
  "Waseela": "Waseela - Active & W.O rates",
  "Seven": "Seven - Loans",
  "Erada": "Erada - SME Loans",
  "Midbank": "Midbank - Loans",
};

export default function CompanySelector({
  selectedCompany,
  onChange,
}: CompanySelectorProps) {
  const companyRates = loadCompanyRates();
  const COMPANIES = Object.keys(companyRates).map((companyId) => ({
    id: companyId as Company,
    name: companyId,
    description: COMPANY_DESCRIPTIONS[companyId] || `${companyId} - Commission Rates`,
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
      <h3 className="text-lg font-bold text-slate-800 mb-3">Select Company</h3>
      <div className="grid gap-2">
        {COMPANIES.map((company) => (
          <button
            key={company.id}
            onClick={() => onChange(company.id)}
            className={cn(
              "p-4 rounded-lg border-2 text-left transition-all",
              selectedCompany === company.id
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 hover:border-slate-300"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800">{company.name}</h4>
                <p className="text-sm text-slate-600">{company.description}</p>
              </div>
              {selectedCompany === company.id && (
                <div className="bg-emerald-500 text-white p-1 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}