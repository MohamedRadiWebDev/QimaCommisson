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
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-500 text-lg">No data available. Please upload a file and map the columns.</p>
      </div>
    );
  }

  const svHeadDetailedSummary = generateSVHeadDetailedSummary(data, company);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">Head</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">S.V</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">Type</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">Collector</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">Sum of Payment</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">Rate</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">Commission</th>
              </tr>
            </thead>
            <tbody>
              {data.headGroups.map((headGroup, headIdx) => (
                <React.Fragment key={`head-${headIdx}`}>
                  {headGroup.svGroups.map((svGroup, svIdx) => (
                    <React.Fragment key={`sv-${headIdx}-${svIdx}`}>
                      {svGroup.types.map((typeGroup, typeIdx) => (
                        <React.Fragment key={`type-${headIdx}-${svIdx}-${typeIdx}`}>
                          {typeGroup.collectors.map((collector, collectorIdx) => (
                            <tr
                              key={`${headIdx}-${svIdx}-${typeIdx}-${collectorIdx}`}
                              className="border-b border-slate-100 hover:bg-slate-50"
                            >
                              <td className="px-4 py-2 text-sm text-slate-800">
                                {svIdx === 0 && typeIdx === 0 && collectorIdx === 0 ? headGroup.head : ""}
                              </td>
                              <td className="px-4 py-2 text-sm text-slate-800">
                                {typeIdx === 0 && collectorIdx === 0 ? svGroup.sv : ""}
                              </td>
                              <td className="px-4 py-2 text-sm text-slate-700">
                                {collectorIdx === 0 ? typeGroup.type : ""}
                              </td>
                              <td className="px-4 py-2 text-sm text-slate-600">{collector.collector}</td>
                              <td className="px-4 py-2 text-sm text-slate-800 font-medium">
                                {formatCurrency(collector.totalPayment)}
                              </td>
                              <td className="px-4 py-2 text-sm text-slate-600">
                                {formatPercent(collector.rate)}
                              </td>
                              <td className="px-4 py-2 text-sm text-emerald-600 font-semibold">
                                {formatCurrency(collector.commission)}
                              </td>
                            </tr>
                          ))}

                          <tr className="bg-blue-50 border-b border-blue-200">
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2 text-sm font-bold text-blue-800">
                              مجموع {typeGroup.type}
                            </td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2 text-sm font-bold text-blue-800">
                              {formatCurrency(typeGroup.totalPayment)}
                            </td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2"></td>
                          </tr>
                        </React.Fragment>
                      ))}

                      <tr className="bg-indigo-50 border-b border-indigo-200">
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-sm font-bold text-indigo-800">
                          مجموع {svGroup.sv}
                        </td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2 text-sm font-bold text-indigo-800">
                          {formatCurrency(svGroup.totalPayment)}
                        </td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2"></td>
                      </tr>
                    </React.Fragment>
                  ))}

                  <tr className="bg-purple-50 border-b-2 border-purple-300">
                    <td className="px-4 py-3 text-sm font-bold text-purple-800">
                      مجموع النادي {headGroup.head}
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-sm font-bold text-purple-800">
                      {formatCurrency(headGroup.totalPayment)}
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                  </tr>

                  {headIdx < data.headGroups.length - 1 && (
                    <tr className="bg-slate-100">
                      <td colSpan={7} className="px-4 py-1"></td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              <tr className="bg-emerald-100 border-t-4 border-emerald-600">
                <td colSpan={4} className="px-4 py-4 text-base font-bold text-emerald-900">
                  المجموع الإجمالي (Grand Total)
                </td>
                <td className="px-4 py-4 text-base font-bold text-emerald-900">
                  {formatCurrency(data.grandTotalPayment)}
                </td>
                <td className="px-4 py-4"></td>
                <td className="px-4 py-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-4 rounded-t-xl">
          <h3 className="text-lg font-bold text-white">عمولات S.V</h3>
          <p className="text-indigo-100 text-sm">ملخص عمولات كل S.V حسب النوع</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full w-full table-auto">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                <th className="px-3 py-3 text-right text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">S.V Name</th>
                <th className="px-3 py-3 text-right text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">Type</th>
                <th className="px-3 py-3 text-right text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">Payment</th>
                <th className="px-3 py-3 text-right text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">Rate</th>
                <th className="px-3 py-3 text-right text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">Commission</th>
              </tr>
            </thead>
            <tbody>
              {svHeadDetailedSummary.svDetails.map((sv, idx) => (
                <React.Fragment key={idx}>
                  {sv.typeBreakdown.map((typeData, typeIdx) => (
                    <tr key={`${idx}-${typeIdx}`} className="border-b border-slate-100 hover:bg-indigo-50">
                      <td className="px-3 py-2 text-xs sm:text-sm font-medium text-slate-800">
                        {typeIdx === 0 ? sv.name : ""}
                      </td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-slate-700">{typeData.type}</td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-slate-800">{formatCurrency(typeData.payment)}</td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-slate-600">{formatPercent(typeData.rate)}</td>
                      <td className="px-3 py-2 text-xs sm:text-sm font-semibold text-indigo-600">{formatCurrency(typeData.commission)}</td>
                    </tr>
                  ))}
                  <tr className="bg-indigo-50 border-b border-indigo-200">
                    <td className="px-3 py-2 text-xs sm:text-sm font-bold text-indigo-800">مجموع {sv.name}</td>
                    <td className="px-3 py-2"></td>
                    <td className="px-3 py-2 text-xs sm:text-sm font-bold text-indigo-800">{formatCurrency(sv.totalPayment)}</td>
                    <td className="px-3 py-2"></td>
                    <td className="px-3 py-2 text-xs sm:text-sm font-bold text-indigo-700">{formatCurrency(sv.totalCommission)}</td>
                  </tr>
                </React.Fragment>
              ))}

              <tr className="bg-indigo-100 border-t-2 border-indigo-400">
                <td className="px-3 py-4 text-xs sm:text-sm font-bold text-indigo-900">المجموع الإجمالي S.V</td>
                <td className="px-3 py-4"></td>
                <td className="px-3 py-4 text-xs sm:text-sm font-bold text-indigo-900">{formatCurrency(svHeadDetailedSummary.totalPayment)}</td>
                <td className="px-3 py-4"></td>
                <td className="px-3 py-4 text-xs sm:text-sm font-bold text-indigo-700">{formatCurrency(svHeadDetailedSummary.totalSVCommission)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 rounded-t-xl">
          <h3 className="text-lg font-bold text-white">عمولات Head</h3>
          <p className="text-purple-100 text-sm">ملخص عمولات كل Head حسب النوع</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full w-full table-auto">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                <th className="px-3 py-3 text-right text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">Head Name</th>
                <th className="px-3 py-3 text-right text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">Type</th>
                <th className="px-3 py-3 text-right text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">Payment</th>
                <th className="px-3 py-3 text-right text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">Rate</th>
                <th className="px-3 py-3 text-right text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">Commission</th>
              </tr>
            </thead>
            <tbody>
              {svHeadDetailedSummary.headDetails.map((head, idx) => (
                <React.Fragment key={idx}>
                  {head.typeBreakdown.map((typeData, typeIdx) => (
                    <tr key={`${idx}-${typeIdx}`} className="border-b border-slate-100 hover:bg-purple-50">
                      <td className="px-3 py-2 text-xs sm:text-sm font-medium text-slate-800">
                        {typeIdx === 0 ? head.name : ""}
                      </td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-slate-700">{typeData.type}</td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-slate-800">{formatCurrency(typeData.payment)}</td>
                      <td className="px-3 py-2 text-xs sm:text-sm text-slate-600">{formatPercent(typeData.rate)}</td>
                      <td className="px-3 py-2 text-xs sm:text-sm font-semibold text-purple-600">{formatCurrency(typeData.commission)}</td>
                    </tr>
                  ))}
                  <tr className="bg-purple-50 border-b border-purple-200">
                    <td className="px-3 py-2 text-xs sm:text-sm font-bold text-purple-800">مجموع {head.name}</td>
                    <td className="px-3 py-2"></td>
                    <td className="px-3 py-2 text-xs sm:text-sm font-bold text-purple-800">{formatCurrency(head.totalPayment)}</td>
                    <td className="px-3 py-2"></td>
                    <td className="px-3 py-2 text-xs sm:text-sm font-bold text-purple-700">{formatCurrency(head.totalCommission)}</td>
                  </tr>
                </React.Fragment>
              ))}

              <tr className="bg-purple-100 border-t-2 border-purple-400">
                <td className="px-3 py-4 text-xs sm:text-sm font-bold text-purple-900">المجموع الإجمالي Head</td>
                <td className="px-3 py-4"></td>
                <td className="px-3 py-4 text-xs sm:text-sm font-bold text-purple-900">{formatCurrency(svHeadDetailedSummary.totalPayment)}</td>
                <td className="px-3 py-4"></td>
                <td className="px-3 py-4 text-xs sm:text-sm font-bold text-purple-700">{formatCurrency(svHeadDetailedSummary.totalHeadCommission)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
