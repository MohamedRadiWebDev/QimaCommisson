"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-3">Commission Calculator</h1>
        <p className="text-lg text-slate-600">
          Upload Excel files, map columns, and calculate commissions automatically.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/upload" className="block">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-slate-200 hover:border-emerald-300">
            <div className="flex items-center mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 ml-4">Upload Data</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Upload your Excel file with payment data. Map columns to calculate commissions based on company rates.
            </p>
            <div className="mt-4 text-emerald-600 font-semibold flex items-center">
              Start Processing
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        <Link href="/employees" className="block">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-slate-200 hover:border-blue-300">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 ml-4">إدارة الموظفين</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              إضافة وتعديل وحذف الموظفين وتحديد نوع وظيفتهم (Collector, Tele, Production, S.V, Head).
            </p>
            <div className="mt-4 text-blue-600 font-semibold flex items-center">
              إدارة الموظفين
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-12 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
        <h2 className="text-xl font-bold text-slate-800 mb-3">كيفية الاستخدام</h2>
        <ol className="space-y-2 text-slate-700">
          <li className="flex items-start">
            <span className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 mt-0.5">1</span>
            <span><strong>أضف الموظفين:</strong> اذهب إلى صفحة "إدارة الموظفين" وأضف جميع الموظفين مع تحديد نوع وظيفتهم</span>
          </li>
          <li className="flex items-start">
            <span className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 mt-0.5">2</span>
            <span><strong>ارفع ملف Excel:</strong> اذهب إلى "Upload Data" وارفع ملف البيانات</span>
          </li>
          <li className="flex items-start">
            <span className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 mt-0.5">3</span>
            <span><strong>طابق الأعمدة:</strong> حدد الأعمدة المطلوبة (Payment, Type, Collector, S.V, Head)</span>
          </li>
          <li className="flex items-start">
            <span className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 mt-0.5">4</span>
            <span><strong>احسب العمولات:</strong> سيتم حساب العمولات تلقائياً حسب نوع كل موظف من قاعدة البيانات</span>
          </li>
        </ol>
      </div>
    </div>
  );
}