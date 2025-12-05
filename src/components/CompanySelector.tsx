"use client";

import type { Company } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CompanySelectorProps {
  selectedCompany: Company;
  onCompanyChange: (company: Company) => void;
}

const COMPANIES: { id: Company; name: string; description: string }[] = [
  {
    id: "Raya",
    name: "Raya",
    description: "Raya - Rates",
  },
  {
    id: "VALU",
    name: "VALU",
    description: "VALU - Installments",
  },
  {
    id: "بنك الإسكندرية",
    name: "بنك الإسكندرية",
    description: "Bank of Alexandria - Loans",
  },
  {
    id: "بنك كريدي أجريكول",
    name: "بنك كريدي أجريكول",
    description: "Crédit Agricole Egypt - Loans",
  },
  {
    id: "Money_Fellows",
    name: "Money Fellows",
    description: "Money Fellows - Microfinance",
  },
  {
    id: "Midtakseet",
    name: "Midtakseet",
    description: "Midtakseet - Installments",
  },
  {
    id: "Souhoola",
    name: "Souhoola",
    description: "Souhoola - Installments",
  },
  {
    id: "Tanmeyah",
    name: "Tanmeyah",
    description: "Tanmeyah - SME Loans",
  },
  {
    id: "Waseela",
    name: "Waseela",
    description: "Waseela - Active & W.O rates",
  },
  {
    id: "Seven",
    name: "Seven",
    description: "Seven - Loans",
  },
  {
    id: "Erada",
    name: "Erada",
    description: "Erada - SME Loans",
  },
  {
    id: "Midbank",
    name: "Midbank",
    description: "Midbank - Loans",
  },
];

export default function CompanySelector({
  selectedCompany,
  onCompanyChange,
}: CompanySelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
      <h3 className="text-lg font-bold text-slate-800 mb-3">Select Company</h3>
      <div className="grid gap-2">
        {COMPANIES.map((company) => (
          <button
            key={company.id}
            onClick={() => onCompanyChange(company.id)}
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