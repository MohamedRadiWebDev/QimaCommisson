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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Commission Results</h2>
          <p className="text-sm text-gray-600">Company: {company}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="px-4 py-3 text-right w-48">head</th>
              <th className="px-4 py-3 text-right w-48">s.v</th>
              <th className="px-4 py-3 text-right w-32">Type</th>
              <th className="px-4 py-3 text-right w-48">collector</th>
              <th className="px-4 py-3 text-right w-40">Sum of Payment</th>
              <th className="px-4 py-3 text-right w-24">Rate</th>
              <th className="px-4 py-3 text-right w-32">Commission</th>
            </tr>
          </thead>
          <tbody>
            {data.headGroups.map((headGroup, hIdx) => {
              const headKey = headGroup.head;
              const isHeadExpanded = expandedHeads.has(headKey);

              return (
                <Fragment key={hIdx}>
                  <tr
                    className="bg-blue-100 cursor-pointer hover:bg-blue-200 transition-colors"
                    onClick={() => toggleHead(headKey)}
                  >
                    <td className="px-4 py-2 text-right font-medium text-blue-900">
                      <span className="flex items-center justify-end gap-2">
                        <span className="text-xs">{isHeadExpanded ? "▼" : "▶"}</span>
                        {headGroup.head}
                      </span>
                    </td>
                    <td colSpan={4}></td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(headGroup.totalPayment)}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(headGroup.totalCommission)}</td>
                  </tr>

                  {isHeadExpanded && headGroup.svGroups.map((svGroup, sIdx) => {
                    const svKey = `${headKey}-${svGroup.sv}`;
                    const isSVExpanded = expandedSVs.has(svKey);

                    return (
                      <Fragment key={sIdx}>
                        <tr
                          className="bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => toggleSV(svKey)}
                        >
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2 text-right font-medium text-blue-800">
                            <span className="flex items-center justify-end gap-2">
                              <span className="text-xs">{isSVExpanded ? "▼" : "▶"}</span>
                              {svGroup.sv}
                            </span>
                          </td>
                          <td colSpan={3}></td>
                          <td className="px-4 py-2 text-right">{formatCurrency(svGroup.totalPayment)}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(svGroup.totalCommission)}</td>
                        </tr>

                        {isSVExpanded && svGroup.types.map((typeGroup, tIdx) => (
                          <Fragment key={tIdx}>
                            {typeGroup.collectors.map((collector, cIdx) => (
                              <tr
                                key={cIdx}
                                className={cn(
                                  "hover:bg-gray-50 transition-colors",
                                  cIdx === 0 && "border-t border-gray-200"
                                )}
                              >
                                <td className="px-4 py-2"></td>
                                <td className="px-4 py-2"></td>
                                <td className="px-4 py-2 text-right">
                                  {cIdx === 0 && typeGroup.type}
                                </td>
                                <td className="px-4 py-2 text-right">{collector.collector}</td>
                                <td className="px-4 py-2 text-right">{formatCurrency(collector.totalPayment)}</td>
                                <td className="px-4 py-2 text-right">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-sm font-medium",
                                    collector.rate >= 2 ? "bg-yellow-100 text-yellow-800" :
                                    collector.rate >= 1.5 ? "bg-green-100 text-green-800" :
                                    "bg-gray-100 text-gray-800"
                                  )}>
                                    {formatPercent(collector.rate)}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-right">{formatCurrency(collector.commission)}</td>
                              </tr>
                            ))}
                            
                            <tr className={cn(
                              "font-medium",
                              typeGroup.type === "Active" ? "bg-green-100" : "bg-yellow-100"
                            )}>
                              <td colSpan={3}></td>
                              <td className="px-4 py-2 text-right font-semibold">
                                {typeGroup.type} Total
                              </td>
                              <td className="px-4 py-2 text-right">{formatCurrency(typeGroup.totalPayment)}</td>
                              <td className="px-4 py-2 text-right">
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-sm font-medium",
                                  typeGroup.type === "Active" ? "bg-green-200" : "bg-yellow-200"
                                )}>
                                  {formatPercent(typeGroup.totalRate)}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-right">{formatCurrency(typeGroup.totalCommission)}</td>
                            </tr>
                          </Fragment>
                        ))}

                        <tr className="bg-gray-100 font-medium">
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2 text-right" colSpan={3}>
                            Total {svGroup.sv}
                          </td>
                          <td className="px-4 py-2 text-right">{formatCurrency(svGroup.totalPayment)}</td>
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2 text-right">{formatCurrency(svGroup.totalCommission)}</td>
                        </tr>
                      </Fragment>
                    );
                  })}

                  <tr className="bg-blue-200 font-semibold">
                    <td className="px-4 py-2 text-right" colSpan={4}>
                      Total {headGroup.head}
                    </td>
                    <td className="px-4 py-2 text-right">{formatCurrency(headGroup.totalPayment)}</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2 text-right">{formatCurrency(headGroup.totalCommission)}</td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-800 text-white font-bold">
              <td className="px-4 py-3 text-right" colSpan={4}>
                Grand Total
              </td>
              <td className="px-4 py-3 text-right">{formatCurrency(data.grandTotalPayment)}</td>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3 text-right">{formatCurrency(data.grandTotalCommission)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
