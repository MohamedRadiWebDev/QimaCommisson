"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import type { Domain } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface AllDomainsDashboardProps {
  domains: Domain[];
}

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

export default function AllDomainsDashboard({ domains }: AllDomainsDashboardProps) {
  const aggregatedStats = React.useMemo(() => {
    let totalPayment = 0;
    let totalCommission = 0;
    let totalCollectors = 0;
    let totalSVs = new Set<string>();
    let totalHeads = new Set<string>();

    domains.forEach((domain) => {
      totalPayment += domain.processedData.grandTotalPayment;
      totalCommission += domain.processedData.grandTotalCommission;

      domain.processedData.headGroups.forEach((headGroup) => {
        totalHeads.add(headGroup.head);
        headGroup.svGroups.forEach((svGroup) => {
          totalSVs.add(svGroup.sv);
          svGroup.types.forEach((typeGroup) => {
            totalCollectors += typeGroup.collectors.length;
          });
        });
      });
    });

    return {
      totalPayment,
      totalCommission,
      totalCollectors,
      totalSVs: totalSVs.size,
      totalHeads: totalHeads.size,
      totalDomains: domains.length,
    };
  }, [domains]);

  const domainComparisonData = React.useMemo(() => {
    return domains.map((domain, index) => ({
      name: domain.name.length > 12 ? domain.name.substring(0, 12) + "..." : domain.name,
      fullName: domain.name,
      payment: Math.round(domain.processedData.grandTotalPayment),
      commission: Math.round(domain.processedData.grandTotalCommission),
      color: COLORS[index % COLORS.length],
    }));
  }, [domains]);

  const paymentDistribution = React.useMemo(() => {
    return domains.map((domain, index) => ({
      name: domain.name,
      value: Math.round(domain.processedData.grandTotalPayment),
      color: COLORS[index % COLORS.length],
    }));
  }, [domains]);

  const topPerformers = React.useMemo(() => {
    const allCollectors: { name: string; domain: string; payment: number; commission: number }[] = [];

    domains.forEach((domain) => {
      domain.processedData.headGroups.forEach((headGroup) => {
        headGroup.svGroups.forEach((svGroup) => {
          svGroup.types.forEach((typeGroup) => {
            typeGroup.collectors.forEach((collector) => {
              allCollectors.push({
                name: collector.collector,
                domain: domain.name,
                payment: collector.totalPayment,
                commission: collector.commission,
              });
            });
          });
        });
      });
    });

    return allCollectors
      .sort((a, b) => b.payment - a.payment)
      .slice(0, 5);
  }, [domains]);

  const domainPerformanceRadar = React.useMemo(() => {
    const maxPayment = Math.max(...domains.map(d => d.processedData.grandTotalPayment));
    const maxCommission = Math.max(...domains.map(d => d.processedData.grandTotalCommission));
    
    return domains.map((domain) => {
      const collectorsCount = domain.processedData.headGroups.reduce((acc, hg) => 
        acc + hg.svGroups.reduce((svAcc, svg) => 
          svAcc + svg.types.reduce((tAcc, t) => tAcc + t.collectors.length, 0), 0), 0);
      
      return {
        domain: domain.name.length > 10 ? domain.name.substring(0, 10) + "..." : domain.name,
        fullName: domain.name,
        payment: maxPayment > 0 ? (domain.processedData.grandTotalPayment / maxPayment) * 100 : 0,
        commission: maxCommission > 0 ? (domain.processedData.grandTotalCommission / maxCommission) * 100 : 0,
        collectors: collectorsCount * 10,
      };
    });
  }, [domains]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-800">{payload[0]?.payload?.fullName || label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.dataKey === "payment" || entry.dataKey === "commission" || entry.dataKey === "value" 
                ? formatCurrency(entry.value) 
                : entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (domains.length === 0) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-8 border border-emerald-200 text-center">
        <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-xl font-bold text-slate-700 mb-2">لا توجد بيانات بعد</h3>
        <p className="text-slate-500">ارفع ملفات Excel لعرض الإحصائيات الشاملة لجميع النطاقات</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">نظرة عامة على جميع النطاقات</h2>
          <p className="text-slate-600">إحصائيات شاملة ومقارنات بين جميع الشركات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="stat-card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700 mb-1">إجمالي المدفوعات</p>
              <p className="text-xl font-bold text-emerald-800">
                {formatCurrency(aggregatedStats.totalPayment)}
              </p>
            </div>
            <div className="bg-emerald-200 p-2 rounded-xl">
              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 mb-1">إجمالي العمولات</p>
              <p className="text-xl font-bold text-blue-800">
                {formatCurrency(aggregatedStats.totalCommission)}
              </p>
            </div>
            <div className="bg-blue-200 p-2 rounded-xl">
              <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 mb-1">عدد النطاقات</p>
              <p className="text-xl font-bold text-purple-800">
                {aggregatedStats.totalDomains}
              </p>
            </div>
            <div className="bg-purple-200 p-2 rounded-xl">
              <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 mb-1">المحصلين</p>
              <p className="text-xl font-bold text-amber-800">
                {aggregatedStats.totalCollectors}
              </p>
            </div>
            <div className="bg-amber-200 p-2 rounded-xl">
              <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-700 mb-1">المشرفين S.V</p>
              <p className="text-xl font-bold text-indigo-800">
                {aggregatedStats.totalSVs}
              </p>
            </div>
            <div className="bg-indigo-200 p-2 rounded-xl">
              <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-rose-700 mb-1">الرؤساء Head</p>
              <p className="text-xl font-bold text-rose-800">
                {aggregatedStats.totalHeads}
              </p>
            </div>
            <div className="bg-rose-200 p-2 rounded-xl">
              <svg className="w-5 h-5 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <h3 className="text-lg font-bold text-slate-800 mb-4">مقارنة المدفوعات والعمولات</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="payment"
                  fill="#10b981"
                  name="المدفوعات"
                  radius={[4, 4, 0, 0]}
                  animationBegin={0}
                  animationDuration={800}
                />
                <Bar
                  dataKey="commission"
                  fill="#3b82f6"
                  name="العمولات"
                  radius={[4, 4, 0, 0]}
                  animationBegin={200}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <h3 className="text-lg font-bold text-slate-800 mb-4">توزيع المدفوعات</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    const displayName = String(name || "");
                    return `${displayName.length > 8 ? displayName.substring(0, 8) + "..." : displayName} (${((percent || 0) * 100).toFixed(0)}%)`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {paymentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {domains.length >= 2 && (
        <div className="chart-container">
          <h3 className="text-lg font-bold text-slate-800 mb-4">مقارنة أداء النطاقات</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={domainPerformanceRadar}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="domain" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="المدفوعات"
                  dataKey="payment"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
                <Radar
                  name="العمولات"
                  dataKey="commission"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Legend />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {topPerformers.length > 0 && (
        <div className="chart-container">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            أفضل المحصلين
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-right px-4 py-3 text-slate-600 font-semibold">#</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-semibold">الاسم</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-semibold">النطاق</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-semibold">المدفوعات</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-semibold">العمولة</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((performer, index) => (
                  <tr
                    key={`${performer.name}-${performer.domain}`}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        index === 0 ? "bg-amber-100 text-amber-700" :
                        index === 1 ? "bg-slate-100 text-slate-600" :
                        index === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-slate-50 text-slate-500"
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{performer.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        {performer.domain}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold">{formatCurrency(performer.payment)}</td>
                    <td className="px-4 py-3 text-blue-600 font-semibold">{formatCurrency(performer.commission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map((domain, index) => (
          <div
            key={domain.id}
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <h4 className="font-bold text-slate-800">{domain.name}</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">المدفوعات:</span>
                <span className="font-semibold text-slate-700">
                  {formatCurrency(domain.processedData.grandTotalPayment)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">العمولات:</span>
                <span className="font-semibold text-slate-700">
                  {formatCurrency(domain.processedData.grandTotalCommission)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>آخر تحديث:</span>
                  <span>{new Date(domain.updatedAt).toLocaleDateString("ar-EG")}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
