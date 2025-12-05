"use client";

import React from "react";
import Link from "next/link";
import { useDomainsStore } from "@/lib/store";
import Dashboard from "@/components/Dashboard";
import DomainTabs from "@/components/DomainTabs";
import AllDomainsDashboard from "@/components/AllDomainsDashboard";

export default function Home() {
  const { domains, activeDomainId, getDomain } = useDomainsStore();
  const [showAll, setShowAll] = React.useState(true);
  
  const activeDomain = activeDomainId ? getDomain(activeDomainId) : null;
  const hasAnyData = domains.length > 0;

  const handleSelectAll = () => {
    setShowAll(true);
  };

  const handleSelectDomain = (id: string) => {
    setShowAll(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 slide-up" style={{ opacity: 0, animationDelay: "0s", animationFillMode: "forwards" }}>
        <h1 className="text-4xl font-bold text-slate-800 mb-3">حساب عمولات بدون عناء المحاسبين</h1>
        <p className="text-lg text-slate-600">
          ارفع ملفات Excel، حدد الأعمدة، واحسب العمولات تلقائياً
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Link href="/upload" className="block">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 card-hover hover:border-emerald-300">
            <div className="flex items-center mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mr-4">رفع البيانات</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              ارفع ملف Excel الخاص بك وحدد الأعمدة لحساب العمولات حسب نسب الشركة
            </p>
            <div className="mt-4 text-emerald-600 font-semibold flex items-center btn-animated inline-flex">
              ابدأ المعالجة
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </div>
        </Link>

        <Link href="/employees" className="block">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 card-hover hover:border-blue-300">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mr-4">إدارة الموظفين</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              أضف وعدّل وأحذف الموظفين وحدد نوع وظيفتهم (Collector, Tele, Production, S.V, Head)
            </p>
            <div className="mt-4 text-blue-600 font-semibold flex items-center btn-animated inline-flex">
              إدارة الموظفين
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {hasAnyData && (
        <DomainTabs onSelectAll={handleSelectAll} onSelectDomain={handleSelectDomain} isAllSelected={showAll} />
      )}

      {hasAnyData ? (
        showAll ? (
          <AllDomainsDashboard domains={domains} />
        ) : (
          activeDomain && (
            <Dashboard data={activeDomain.processedData} company={activeDomain.company} />
          )
        )
      ) : (
        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-8 border border-emerald-200 slide-up" style={{ opacity: 0, animationDelay: "0.2s", animationFillMode: "forwards" }}>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <svg className="w-6 h-6 text-emerald-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            كيفية استخدام البرنامج
          </h2>
          <div className="space-y-4">
            <div className="flex items-start bg-white/60 rounded-lg p-4 slide-in-right stagger-1" style={{ opacity: 0 }}>
              <span className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm ml-4 flex-shrink-0">1</span>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">أضف الموظفين أولاً</h3>
                <p className="text-slate-600 text-sm">
                  اذهب إلى صفحة "إدارة الموظفين" وأدخل أسماء جميع الموظفين مع تحديد نوع كل واحد 
                  (هل هو Collector عادي، أم Tele، أم Production، أم S.V، أم Head)
                </p>
              </div>
            </div>
            
            <div className="flex items-start bg-white/60 rounded-lg p-4 slide-in-right stagger-2" style={{ opacity: 0 }}>
              <span className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm ml-4 flex-shrink-0">2</span>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">ارفع ملف البيانات</h3>
                <p className="text-slate-600 text-sm">
                  اذهب إلى "رفع البيانات" واختر ملف Excel الذي يحتوي على بيانات المدفوعات
                </p>
              </div>
            </div>
            
            <div className="flex items-start bg-white/60 rounded-lg p-4 slide-in-right stagger-3" style={{ opacity: 0 }}>
              <span className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm ml-4 flex-shrink-0">3</span>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">طابق أعمدة الملف</h3>
                <p className="text-slate-600 text-sm">
                  حدد أي عمود في ملفك يمثل المدفوعات (Payment)، والنوع (Type)، 
                  واسم المحصّل (Collector)، والمشرف (S.V)، والرئيس (Head)
                </p>
              </div>
            </div>
            
            <div className="flex items-start bg-white/60 rounded-lg p-4 slide-in-right stagger-4" style={{ opacity: 0 }}>
              <span className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm ml-4 flex-shrink-0">4</span>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">احصل على النتائج</h3>
                <p className="text-slate-600 text-sm">
                  سيحسب البرنامج العمولات تلقائياً لكل موظف حسب نوعه ونسب الشركة، 
                  وستظهر النتائج هنا مع الرسوم البيانية وإمكانية التصدير
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-amber-800 text-sm flex items-center">
              <svg className="w-5 h-5 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                <strong>ملاحظة مهمة:</strong> تأكد من إضافة الموظفين قبل رفع الملف حتى يتم حساب العمولات بشكل صحيح
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
