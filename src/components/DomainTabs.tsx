"use client";

import React from "react";
import { useDomainsStore } from "@/lib/store";
import type { Domain } from "@/lib/types";

interface DomainTabsProps {
  onSelectAll: () => void;
  onSelectDomain: (id: string) => void;
  isAllSelected: boolean;
}

export default function DomainTabs({ onSelectAll, onSelectDomain, isAllSelected }: DomainTabsProps) {
  const { domains, activeDomainId, setActiveDomain, removeDomain } = useDomainsStore();

  const handleRemoveDomain = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("هل أنت متأكد من حذف هذا النطاق؟")) {
      removeDomain(id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-6">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
        <button
          onClick={onSelectAll}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
            isAllSelected
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          الكل
          {domains.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              isAllSelected ? "bg-white/20" : "bg-slate-200"
            }`}>
              {domains.length}
            </span>
          )}
        </button>

        {domains.map((domain) => (
          <div
            key={domain.id}
            className={`group px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              activeDomainId === domain.id && !isAllSelected
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <div onClick={() => {
              setActiveDomain(domain.id);
              onSelectDomain(domain.id);
            }} className="flex items-center gap-2 flex-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {domain.name}
            </div>
            <button
              onClick={(e) => handleRemoveDomain(e, domain.id)}
              className={`ml-1 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                activeDomainId === domain.id && !isAllSelected
                  ? "hover:bg-white/20"
                  : "hover:bg-red-100 text-red-500"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {domains.length === 0 && (
          <div className="text-slate-400 text-sm py-2 px-4">
            لا توجد نطاقات بعد - ارفع ملف Excel لإنشاء نطاق جديد
          </div>
        )}
      </div>
    </div>
  );
}