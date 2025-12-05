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
} from "recharts";
import type { ProcessedData, Company } from "@/lib/types";
import { generateSVHeadDetailedSummary } from "@/lib/grouping";
import { formatCurrency } from "@/lib/utils";
import ExportButtons from "./ExportButtons";

interface DashboardProps {
  data: ProcessedData;
  company: Company;
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

export default function Dashboard({ data, company }: DashboardProps) {
  const svHeadSummary = generateSVHeadDetailedSummary(data, company);

  const typePaymentData = React.useMemo(() => {
    const typeMap = new Map<string, number>();
    data.headGroups.forEach((headGroup) => {
      headGroup.svGroups.forEach((svGroup) => {
        svGroup.types.forEach((typeGroup) => {
          const current = typeMap.get(typeGroup.type) || 0;
          typeMap.set(typeGroup.type, current + typeGroup.totalPayment);
        });
      });
    });

    return Array.from(typeMap.entries()).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));
  }, [data]);

  const svCommissionData = React.useMemo(() => {
    return svHeadSummary.svDetails.map((sv) => ({
      name: sv.name.length > 10 ? sv.name.substring(0, 10) + "..." : sv.name,
      fullName: sv.name,
      payment: Math.round(sv.totalPayment),
      commission: Math.round(sv.totalCommission),
    }));
  }, [svHeadSummary]);

  const headCommissionData = React.useMemo(() => {
    return svHeadSummary.headDetails.map((head) => ({
      name: head.name.length > 10 ? head.name.substring(0, 10) + "..." : head.name,
      fullName: head.name,
      payment: Math.round(head.totalPayment),
      commission: Math.round(head.totalCommission),
    }));
  }, [svHeadSummary]);

  const totalCollectors = React.useMemo(() => {
    const collectors = new Set<string>();
    data.headGroups.forEach((headGroup) => {
      headGroup.svGroups.forEach((svGroup) => {
        svGroup.types.forEach((typeGroup) => {
          typeGroup.collectors.forEach((collector) => {
            collectors.add(collector.collector);
          });
        });
      });
    });
    return collectors.size;
  }, [data]);

  const totalSVs = svHeadSummary.svDetails.length;
  const totalHeads = svHeadSummary.headDetails.length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-800">{payload[0]?.payload?.fullName || label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">لوحة التحكم</h2>
          <p className="text-slate-600">ملخص العمولات والإحصائيات</p>
        </div>
        <ExportButtons data={data} company={company} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card slide-up stagger-1" style={{ opacity: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">إجمالي المدفوعات</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatCurrency(data.grandTotalPayment)}
              </p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card slide-up stagger-2" style={{ opacity: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">عمولات S.V</p>
              <p className="text-2xl font-bold text-indigo-600">
                {formatCurrency(svHeadSummary.totalSVCommission)}
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-xl">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card slide-up stagger-3" style={{ opacity: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">عمولات Head</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(svHeadSummary.totalHeadCommission)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card slide-up stagger-4" style={{ opacity: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">عدد الموظفين</p>
              <p className="text-2xl font-bold text-amber-600">
                {totalCollectors + totalSVs + totalHeads}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {totalCollectors} Collectors • {totalSVs} SVs • {totalHeads} Heads
              </p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {data.grandTotalAllCommissions !== undefined && (
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 border-2 border-amber-300 slide-up" style={{ opacity: 0, animationDelay: "0.5s", animationFillMode: "forwards" }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-lg text-white/90 mb-2 font-semibold">Grand Total Commission (إجمالي العمولات الكلي)</p>
              <p className="text-5xl font-bold text-white mb-4">
                {formatCurrency(data.grandTotalAllCommissions)}
              </p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-white/25 rounded-lg p-3 backdrop-blur-sm border border-white/30">
                  <p className="text-white/90 text-xs mb-1 font-medium">Collectors + Tele + Production</p>
                  <p className="text-white font-bold text-lg">{formatCurrency(data.grandTotalCommission)}</p>
                </div>
                <div className="bg-white/25 rounded-lg p-3 backdrop-blur-sm border border-white/30">
                  <p className="text-white/90 text-xs mb-1 font-medium">S.V</p>
                  <p className="text-white font-bold text-lg">{formatCurrency(data.grandTotalSVCommission || 0)}</p>
                </div>
                <div className="bg-white/25 rounded-lg p-3 backdrop-blur-sm border border-white/30">
                  <p className="text-white/90 text-xs mb-1 font-medium">Head</p>
                  <p className="text-white font-bold text-lg">{formatCurrency(data.grandTotalHeadCommission || 0)}</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-white/80 bg-white/10 rounded px-3 py-2 backdrop-blur-sm">
                💡 هذا المجموع يشمل عمولات جميع الموظفين: Collectors, Telesales, Production, S.V, و Head
              </div>
            </div>
            <div className="bg-white/30 p-4 rounded-xl backdrop-blur-sm ml-4">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="chart-container">
          <h3 className="text-lg font-bold text-slate-800 mb-4">المدفوعات حسب النوع</h3>
          <div className="h-[300px] sm:h-[350px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typePaymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                  outerRadius="70%"
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {typePaymentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <h3 className="text-lg font-bold text-slate-800 mb-4">عمولات S.V</h3>
          <div className="h-[300px] sm:h-[350px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={svCommissionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => formatCurrency(value)} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Bar
                  dataKey="commission"
                  fill="#6366f1"
                  name="العمولة"
                  radius={[0, 4, 4, 0]}
                  animationBegin={0}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container xl:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4">مقارنة عمولات Head</h3>
          <div className="h-[300px] sm:h-[350px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={headCommissionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
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
                  fill="#8b5cf6"
                  name="العمولة"
                  radius={[4, 4, 0, 0]}
                  animationBegin={200}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
