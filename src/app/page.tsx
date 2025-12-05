"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Commission Calculator
        </h1>
        <p className="text-xl text-slate-600">
          Calculate collectors&apos; commissions from Excel files with dynamic column mapping
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
              <h2 className="text-2xl font-bold text-slate-800 ml-4">Upload Excel</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Upload your Excel file, map columns dynamically, and calculate commissions based on company rules.
            </p>
            <div className="mt-4 text-emerald-600 font-semibold flex items-center">
              Get Started
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        <Link href="/roles" className="block">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-slate-200 hover:border-violet-300">
            <div className="flex items-center mb-4">
              <div className="bg-violet-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 ml-4">Manage Roles</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Assign employee roles (Collector, Telesales, Production) and set custom rate overrides.
            </p>
            <div className="mt-4 text-violet-600 font-semibold flex items-center">
              Manage Employees
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-12 bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6">How It Works</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-slate-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-white">1</span>
            </div>
            <p className="text-sm text-slate-700 font-medium">Upload your Excel file</p>
          </div>
          <div className="text-center">
            <div className="bg-slate-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-white">2</span>
            </div>
            <p className="text-sm text-slate-700 font-medium">Map columns dynamically</p>
          </div>
          <div className="text-center">
            <div className="bg-slate-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-white">3</span>
            </div>
            <p className="text-sm text-slate-700 font-medium">Select company rules</p>
          </div>
          <div className="text-center">
            <div className="bg-emerald-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-white">4</span>
            </div>
            <p className="text-sm text-slate-700 font-medium">View calculated commissions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
