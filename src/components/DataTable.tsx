"use client";

import { useState, Fragment, useEffect, useMemo } from "react";
import type { ProcessedData } from "@/lib/types";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";

interface DataTableProps {
  data: ProcessedData;
  company: string;
}

export default function DataTable({ data, company }: DataTableProps) {
  const dataKey = useMemo(() => 
    data.headGroups.map(h => h.head).join(',') + '-' + data.grandTotalPayment,
    [data]
  );
  
  const [expandedHeads, setExpandedHeads] = useState<Set<string>>(new Set(data.headGroups.map(h => h.head)));
  const [expandedSVs, setExpandedSVs] = useState<Set<string>>(new Set());

  useEffect(() => {
    setExpandedHeads(new Set(data.headGroups.map(h => h.head)));
    setExpandedSVs(new Set());
  }, [dataKey]);

  const toggleHead = (head: string) => {
    const newSet = new Set(expandedHeads);
    if (newSet.has(head)) {
      newSet.delete(head);
    } else {
      newSet.add(head);
    }
    setExpandedHeads(newSet);
  };

  const toggleSV = (sv: string) => {
    const newSet = new Set(expandedSVs);
    if (newSet.has(sv)) {
      newSet.delete(sv);
    } else {
      newSet.add(sv);
    }
    setExpandedSVs(newSet);
  };

  const expandAll = () => {
    setExpandedHeads(new Set(data.headGroups.map(h => h.head)));
    const allSVs = new Set<string>();
    data.headGroups.forEach(h => {
      h.svGroups.forEach(sv => {
        allSVs.add(`${h.head}-${sv.sv}`);
      });
    });
    setExpandedSVs(allSVs);
  };

  const collapseAll = () => {
    setExpandedHeads(new Set());
    setExpandedSVs(new Set());
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Commission Results</h2>
          <p className="text-sm text-slate-600">Company: {company}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 text-sm bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-right text-white font-semibold w-48">Head</th>
              <th className="px-4 py-3 text-right text-white font-semibold w-48">S.V</th>
              <th className="px-4 py-3 text-right text-white font-semibold w-32">Type</th>
              <th className="px-4 py-3 text-right text-white font-semibold w-48">Collector</th>
              <th className="px-4 py-3 text-right text-white font-semibold w-40">Sum of Payment</th>
              <th className="px-4 py-3 text-right text-white font-semibold w-24">Rate</th>
              <th className="px-4 py-3 text-right text-white font-semibold w-32">Commission</th>
            </tr>
          </thead>
          <tbody>
            {data.headGroups.map((headGroup, hIdx) => {
              const headKey = headGroup.head;
              const isHeadExpanded = expandedHeads.has(headKey);

              return (
                <Fragment key={hIdx}>
                  <tr
                    className="bg-slate-100 cursor-pointer hover:bg-slate-200 transition-colors border-b border-slate-200"
                    onClick={() => toggleHead(headKey)}
                  >
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      <span className="flex items-center justify-end gap-2">
                        <span className="text-xs text-slate-500">{isHeadExpanded ? "▼" : "▶"}</span>
                        {headGroup.head}
                      </span>
                    </td>
                    <td colSpan={4}></td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(headGroup.totalPayment)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatCurrency(headGroup.totalCommission)}</td>
                  </tr>

                  {isHeadExpanded && headGroup.svGroups.map((svGroup, sIdx) => {
                    const svKey = `${headKey}-${svGroup.sv}`;
                    const isSVExpanded = expandedSVs.has(svKey);

                    return (
                      <Fragment key={sIdx}>
                        <tr
                          className="bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors border-b border-slate-100"
                          onClick={() => toggleSV(svKey)}
                        >
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2 text-right font-semibold text-slate-700">
                            <span className="flex items-center justify-end gap-2">
                              <span className="text-xs text-slate-400">{isSVExpanded ? "▼" : "▶"}</span>
                              {svGroup.sv}
                            </span>
                          </td>
                          <td colSpan={3}></td>
                          <td className="px-4 py-2 text-right font-medium text-slate-700">{formatCurrency(svGroup.totalPayment)}</td>
                          <td className="px-4 py-2 text-right font-medium text-emerald-600">{formatCurrency(svGroup.totalCommission)}</td>
                        </tr>

                        {isSVExpanded && svGroup.types.map((typeGroup, tIdx) => (
                          <Fragment key={tIdx}>
                            {typeGroup.collectors.map((collector, cIdx) => (
                              <tr
                                key={cIdx}
                                className={cn(
                                  "hover:bg-white transition-colors bg-white",
                                  cIdx === 0 && "border-t border-slate-100"
                                )}
                              >
                                <td className="px-4 py-2"></td>
                                <td className="px-4 py-2"></td>
                                <td className="px-4 py-2 text-right text-slate-600 font-medium">
                                  {cIdx === 0 && typeGroup.type}
                                </td>
                                <td className="px-4 py-2 text-right text-slate-700">{collector.collector}</td>
                                <td className="px-4 py-2 text-right text-slate-700">{formatCurrency(collector.totalPayment)}</td>
                                <td className="px-4 py-2 text-right">
                                  <span className={cn(
                                    "px-2 py-1 rounded text-sm font-semibold",
                                    collector.rate >= 2 ? "bg-amber-100 text-amber-800 border border-amber-300" :
                                    collector.rate >= 1.5 ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                                    "bg-slate-100 text-slate-700 border border-slate-300"
                                  )}>
                                    {formatPercent(collector.rate)}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-right text-slate-700">{formatCurrency(collector.commission)}</td>
                              </tr>
                            ))}
                            
                            <tr className={cn(
                              "font-semibold border-t",
                              typeGroup.type === "Active" 
                                ? "bg-emerald-50 border-emerald-200" 
                                : "bg-amber-50 border-amber-200"
                            )}>
                              <td colSpan={3}></td>
                              <td className={cn(
                                "px-4 py-2 text-right font-bold",
                                typeGroup.type === "Active" ? "text-emerald-800" : "text-amber-800"
                              )}>
                                {typeGroup.type} Total
                              </td>
                              <td className={cn(
                                "px-4 py-2 text-right font-bold",
                                typeGroup.type === "Active" ? "text-emerald-800" : "text-amber-800"
                              )}>{formatCurrency(typeGroup.totalPayment)}</td>
                              <td className="px-4 py-2 text-right">
                                <span className={cn(
                                  "px-2 py-1 rounded text-sm font-bold",
                                  typeGroup.type === "Active" 
                                    ? "bg-emerald-200 text-emerald-900 border border-emerald-400" 
                                    : "bg-amber-200 text-amber-900 border border-amber-400"
                                )}>
                                  {formatPercent(typeGroup.totalRate)}
                                </span>
                              </td>
                              <td className={cn(
                                "px-4 py-2 text-right font-bold",
                                typeGroup.type === "Active" ? "text-emerald-800" : "text-amber-800"
                              )}>{formatCurrency(typeGroup.totalCommission)}</td>
                            </tr>
                          </Fragment>
                        ))}

                        <tr className="bg-slate-100 font-semibold border-t border-slate-200">
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2 text-right text-slate-700" colSpan={3}>
                            Total {svGroup.sv}
                          </td>
                          <td className="px-4 py-2 text-right text-slate-800">{formatCurrency(svGroup.totalPayment)}</td>
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2 text-right text-emerald-700">{formatCurrency(svGroup.totalCommission)}</td>
                        </tr>
                      </Fragment>
                    );
                  })}

                  <tr className="bg-slate-200 font-bold border-t-2 border-slate-300">
                    <td className="px-4 py-3 text-right text-slate-800" colSpan={4}>
                      Total {headGroup.head}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(headGroup.totalPayment)}</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(headGroup.totalCommission)}</td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-800">
              <td className="px-4 py-4 text-right text-white font-bold text-lg" colSpan={4}>
                Grand Total
              </td>
              <td className="px-4 py-4 text-right text-white font-bold text-lg">{formatCurrency(data.grandTotalPayment)}</td>
              <td className="px-4 py-4"></td>
              <td className="px-4 py-4 text-right text-emerald-400 font-bold text-lg">{formatCurrency(data.grandTotalCommission)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
