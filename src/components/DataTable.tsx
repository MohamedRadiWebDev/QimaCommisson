"use client";

import React from "react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { ProcessedData, Company } from "@/lib/types";

interface DataTableProps {
  data: ProcessedData;
  company: Company;
}

export default function DataTable({ data }: DataTableProps) {
  if (!data || !data.headGroups || data.headGroups.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-500 text-lg">No data available. Please upload a file and map the columns.</p>
      </div>
    );
  }

  return (
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

                        {/* Type Total Row */}
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
                          <td className="px-4 py-2 text-sm font-bold text-blue-800">
                            {formatPercent(typeGroup.totalRate)}
                          </td>
                          <td className="px-4 py-2 text-sm font-bold text-blue-600">
                            {formatCurrency(typeGroup.totalCommission)}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}

                    {/* S.V Total Row */}
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
                      <td className="px-4 py-2 text-sm font-bold text-indigo-600">
                        {formatCurrency(svGroup.totalCommission)}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}

                {/* Head Total Row */}
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
                  <td className="px-4 py-3 text-sm font-bold text-purple-800">
                    {formatPercent((headGroup.totalCommission / headGroup.totalPayment) * 100)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-purple-600">
                    {formatCurrency(headGroup.totalCommission)}
                  </td>
                </tr>

                {/* Empty row for spacing */}
                {headIdx < data.headGroups.length - 1 && (
                  <tr className="bg-slate-100">
                    <td colSpan={7} className="px-4 py-1"></td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {/* Grand Total Row */}
            <tr className="bg-emerald-100 border-t-4 border-emerald-600">
              <td colSpan={4} className="px-4 py-4 text-base font-bold text-emerald-900">
                المجموع الإجمالي (Grand Total)
              </td>
              <td className="px-4 py-4 text-base font-bold text-emerald-900">
                {formatCurrency(data.grandTotalPayment)}
              </td>
              <td className="px-4 py-4 text-base font-bold text-emerald-900">
                {formatPercent((data.grandTotalCommission / data.grandTotalPayment) * 100)}
              </td>
              <td className="px-4 py-4 text-base font-bold text-emerald-700">
                {formatCurrency(data.grandTotalCommission)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}