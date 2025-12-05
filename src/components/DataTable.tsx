"use client";

import React from "react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { ProcessedData, Company } from "@/lib/types";
import { generateSVHeadDetailedSummary } from "@/lib/grouping";

interface DataTableProps {
  data: ProcessedData;
  company: Company;
}

export default function DataTable({ data, company }: DataTableProps) {
  if (!data || !data.headGroups || data.headGroups.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center fade-in">
        <p className="text-slate-500 text-lg">لا توجد بيانات متاحة. يرجى رفع ملف وتحديد الأعمدة.</p>
      </div>
    );
  }

  const svHeadDetailedSummary = generateSVHeadDetailedSummary(data, company);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden fade-in">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
          <h3 className="text-lg font-bold text-white">تقرير العمولات التفصيلي</h3>
          <p className="text-slate-300 text-sm">جميع المحصلين مع العمولات</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300">
                <th className="px-4 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">Head</th>
                <th className="px-4 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">S.V</th>
                <th className="px-4 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">Type</th>
                <th className="px-4 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">Collector</th>
                <th className="px-4 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">المدفوعات</th>
                <th className="px-4 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">النسبة</th>
                <th className="px-4 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">العمولة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.headGroups.map((headGroup, headIdx) => (
                <React.Fragment key={`head-${headIdx}`}>
                  {headGroup.svGroups.map((svGroup, svIdx) => (
                    <React.Fragment key={`sv-${headIdx}-${svIdx}`}>
                      {svGroup.types.map((typeGroup, typeIdx) => (
                        <React.Fragment key={`type-${headIdx}-${svIdx}-${typeIdx}`}>
                          {typeGroup.collectors.map((collector, collectorIdx) => (
                            <tr
                              key={`${headIdx}-${svIdx}-${typeIdx}-${collectorIdx}`}
                              className="table-row-hover group"
                            >
                              <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                                {svIdx === 0 && typeIdx === 0 && collectorIdx === 0 ? (
                                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg">{headGroup.head}</span>
                                ) : ""}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-800">
                                {typeIdx === 0 && collectorIdx === 0 ? (
                                  <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg">{svGroup.sv}</span>
                                ) : ""}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-700">
                                {collectorIdx === 0 ? (
                                  <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">{typeGroup.type}</span>
                                ) : ""}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{collector.collector}</td>
                              <td className="px-4 py-3 text-sm text-slate-800 font-semibold tabular-nums">
                                {formatCurrency(collector.totalPayment)}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-500 tabular-nums">
                                {formatPercent(collector.rate)}
                              </td>
                              <td className="px-4 py-3 text-sm font-bold tabular-nums">
                                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                  {formatCurrency(collector.commission)}
                                </span>
                              </td>
                            </tr>
                          ))}

                          <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-y border-blue-200">
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2 text-sm font-bold text-blue-800">
                              مجموع {typeGroup.type}
                            </td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2 text-sm font-bold text-blue-800 tabular-nums">
                              {formatCurrency(typeGroup.totalPayment)}
                            </td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2"></td>
                          </tr>
                        </React.Fragment>
                      ))}

                      <tr className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-y border-indigo-200">
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-sm font-bold text-indigo-800">
                          مجموع {svGroup.sv}
                        </td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-sm font-bold text-indigo-800 tabular-nums">
                          {formatCurrency(svGroup.totalPayment)}
                        </td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2"></td>
                      </tr>
                    </React.Fragment>
                  ))}

                  <tr className="bg-gradient-to-r from-purple-100 to-purple-200 border-y-2 border-purple-300">
                    <td className="px-4 py-3 text-sm font-bold text-purple-800">
                      مجموع {headGroup.head}
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-sm font-bold text-purple-800 tabular-nums">
                      {formatCurrency(headGroup.totalPayment)}
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                  </tr>

                  {headIdx < data.headGroups.length - 1 && (
                    <tr className="bg-slate-50">
                      <td colSpan={7} className="px-4 py-2"></td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              <tr className="bg-gradient-to-r from-emerald-500 to-emerald-600">
                <td colSpan={4} className="px-4 py-4 text-base font-bold text-white">
                  المجموع الإجمالي (Grand Total)
                </td>
                <td className="px-4 py-4 text-base font-bold text-white tabular-nums">
                  {formatCurrency(data.grandTotalPayment)}
                </td>
                <td className="px-4 py-4"></td>
                <td className="px-4 py-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden fade-in">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-4">
          <h3 className="text-lg font-bold text-white">عمولات S.V</h3>
          <p className="text-indigo-100 text-sm">ملخص عمولات كل S.V حسب النوع</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full w-full table-auto">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300">
                <th className="px-4 py-4 text-right text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">S.V Name</th>
                <th className="px-4 py-4 text-right text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">Type</th>
                <th className="px-4 py-4 text-right text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">المدفوعات</th>
                <th className="px-4 py-4 text-right text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">النسبة</th>
                <th className="px-4 py-4 text-right text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">العمولة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {svHeadDetailedSummary.svDetails.map((sv, idx) => (
                <React.Fragment key={idx}>
                  {sv.typeBreakdown.map((typeData, typeIdx) => (
                    <tr key={`${idx}-${typeIdx}`} className="table-row-hover group">
                      <td className="px-4 py-3 text-xs sm:text-sm font-medium text-slate-800">
                        {typeIdx === 0 ? (
                          <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg">{sv.name}</span>
                        ) : ""}
                      </td>
                      <td className="px-4 py-3 text-xs sm:text-sm text-slate-700">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">{typeData.type}</span>
                      </td>
                      <td className="px-4 py-3 text-xs sm:text-sm text-slate-800 font-semibold tabular-nums">{formatCurrency(typeData.payment)}</td>
                      <td className="px-4 py-3 text-xs sm:text-sm text-slate-500 tabular-nums">{formatPercent(typeData.rate)}</td>
                      <td className="px-4 py-3 text-xs sm:text-sm font-bold tabular-nums">
                        <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{formatCurrency(typeData.commission)}</span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-y border-indigo-200">
                    <td className="px-4 py-2 text-xs sm:text-sm font-bold text-indigo-800">مجموع {sv.name}</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2 text-xs sm:text-sm font-bold text-indigo-800 tabular-nums">{formatCurrency(sv.totalPayment)}</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2 text-xs sm:text-sm font-bold text-indigo-700 tabular-nums">{formatCurrency(sv.totalCommission)}</td>
                  </tr>
                </React.Fragment>
              ))}

              <tr className="bg-gradient-to-r from-indigo-500 to-indigo-600">
                <td className="px-4 py-4 text-xs sm:text-sm font-bold text-white">المجموع الإجمالي S.V</td>
                <td className="px-4 py-4"></td>
                <td className="px-4 py-4 text-xs sm:text-sm font-bold text-white tabular-nums">{formatCurrency(svHeadDetailedSummary.totalPayment)}</td>
                <td className="px-4 py-4"></td>
                <td className="px-4 py-4 text-xs sm:text-sm font-bold text-white tabular-nums">{formatCurrency(svHeadDetailedSummary.totalSVCommission)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden fade-in">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
          <h3 className="text-lg font-bold text-white">عمولات Head</h3>
          <p className="text-purple-100 text-sm">ملخص عمولات كل Head حسب النوع</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full w-full table-auto">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300">
                <th className="px-4 py-4 text-right text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">Head Name</th>
                <th className="px-4 py-4 text-right text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">Type</th>
                <th className="px-4 py-4 text-right text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">المدفوعات</th>
                <th className="px-4 py-4 text-right text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">النسبة</th>
                <th className="px-4 py-4 text-right text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">العمولة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {svHeadDetailedSummary.headDetails.map((head, idx) => (
                <React.Fragment key={idx}>
                  {head.typeBreakdown.map((typeData, typeIdx) => (
                    <tr key={`${idx}-${typeIdx}`} className="table-row-hover group">
                      <td className="px-4 py-3 text-xs sm:text-sm font-medium text-slate-800">
                        {typeIdx === 0 ? (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg">{head.name}</span>
                        ) : ""}
                      </td>
                      <td className="px-4 py-3 text-xs sm:text-sm text-slate-700">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">{typeData.type}</span>
                      </td>
                      <td className="px-4 py-3 text-xs sm:text-sm text-slate-800 font-semibold tabular-nums">{formatCurrency(typeData.payment)}</td>
                      <td className="px-4 py-3 text-xs sm:text-sm text-slate-500 tabular-nums">{formatPercent(typeData.rate)}</td>
                      <td className="px-4 py-3 text-xs sm:text-sm font-bold tabular-nums">
                        <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded">{formatCurrency(typeData.commission)}</span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gradient-to-r from-purple-50 to-purple-100 border-y border-purple-200">
                    <td className="px-4 py-2 text-xs sm:text-sm font-bold text-purple-800">مجموع {head.name}</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2 text-xs sm:text-sm font-bold text-purple-800 tabular-nums">{formatCurrency(head.totalPayment)}</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2 text-xs sm:text-sm font-bold text-purple-700 tabular-nums">{formatCurrency(head.totalCommission)}</td>
                  </tr>
                </React.Fragment>
              ))}

              <tr className="bg-gradient-to-r from-purple-500 to-purple-600">
                <td className="px-4 py-4 text-xs sm:text-sm font-bold text-white">المجموع الإجمالي Head</td>
                <td className="px-4 py-4"></td>
                <td className="px-4 py-4 text-xs sm:text-sm font-bold text-white tabular-nums">{formatCurrency(svHeadDetailedSummary.totalPayment)}</td>
                <td className="px-4 py-4"></td>
                <td className="px-4 py-4 text-xs sm:text-sm font-bold text-white tabular-nums">{formatCurrency(svHeadDetailedSummary.totalHeadCommission)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}