"use client";

import type { Company } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CompanySelectorProps {
  selectedCompany: Company;
  onCompanyChange: (company: Company) => void;
}

const COMPANIES: { id: Company; name: string; description: string }[] = [
  {
    id: "Waseela",
    name: "Waseela",
    description: "وسيلة - Active & W.O rates",
  },
];

export default function CompanySelector({
  selectedCompany,
  onCompanyChange,
}: CompanySelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Company</h3>
      <div className="grid gap-2">
        {COMPANIES.map((company) => (
          <button
            key={company.id}
            onClick={() => onCompanyChange(company.id)}
            className={cn(
              "p-4 rounded-lg border-2 text-left transition-all",
              selectedCompany === company.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{company.name}</h4>
                <p className="text-sm text-gray-500">{company.description}</p>
              </div>
              {selectedCompany === company.id && (
                <div className="bg-blue-500 text-white p-1 rounded-full">
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
