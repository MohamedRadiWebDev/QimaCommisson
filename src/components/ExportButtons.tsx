
"use client";

import { useCallback } from "react";
import type { ProcessedData } from "@/lib/types";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonsProps {
  data: ProcessedData;
  company: string;
}

export default function ExportButtons({ data, company }: ExportButtonsProps) {
  const exportToExcel = useCallback(() => {
    const workbook = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const excelData: any[] = [];
    
    // Add header
    excelData.push([
      "Head",
      "S.V",
      "Type",
      "Collector",
      "Sum of Payment",
      "Rate",
      "Commission"
    ]);
    
    // Add data rows
    data.headGroups.forEach((headGroup) => {
      headGroup.svGroups.forEach((svGroup) => {
        svGroup.types.forEach((typeGroup) => {
          typeGroup.collectors.forEach((collector) => {
            excelData.push([
              headGroup.head,
              svGroup.sv,
              typeGroup.type,
              collector.collector,
              collector.totalPayment.toFixed(2),
              (collector.rate * 100).toFixed(2) + "%",
              collector.commission.toFixed(2)
            ]);
          });
          
          // Add type total
          excelData.push([
            "",
            "",
            `${typeGroup.type} Total`,
            "",
            typeGroup.totalPayment.toFixed(2),
            (typeGroup.totalRate * 100).toFixed(2) + "%",
            typeGroup.totalCommission.toFixed(2)
          ]);
        });
        
        // Add SV total
        excelData.push([
          "",
          `Total ${svGroup.sv}`,
          "",
          "",
          svGroup.totalPayment.toFixed(2),
          "",
          svGroup.totalCommission.toFixed(2)
        ]);
      });
      
      // Add Head total
      excelData.push([
        `Total ${headGroup.head}`,
        "",
        "",
        "",
        headGroup.totalPayment.toFixed(2),
        "",
        headGroup.totalCommission.toFixed(2)
      ]);
      
      // Add empty row for separation
      excelData.push([]);
    });
    
    // Add Grand Total
    excelData.push([
      "Grand Total",
      "",
      "",
      "",
      data.grandTotalPayment.toFixed(2),
      "",
      data.grandTotalCommission.toFixed(2)
    ]);
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    
    // Set column widths
    worksheet["!cols"] = [
      { wch: 20 }, // Head
      { wch: 20 }, // S.V
      { wch: 15 }, // Type
      { wch: 25 }, // Collector
      { wch: 18 }, // Sum of Payment
      { wch: 10 }, // Rate
      { wch: 18 }  // Commission
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Commission Report");
    
    // Generate file name with date and company
    const date = new Date().toISOString().split("T")[0];
    const fileName = `Commission_Report_${company}_${date}.xlsx`;
    
    // Save file
    XLSX.writeFile(workbook, fileName);
  }, [data, company]);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF("landscape");
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Commission Report - ${company}`, 14, 15);
    
    // Add date
    doc.setFontSize(10);
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    doc.text(`Generated: ${date}`, 14, 22);
    
    // Prepare table data
    const tableData: any[] = [];
    
    data.headGroups.forEach((headGroup) => {
      headGroup.svGroups.forEach((svGroup) => {
        svGroup.types.forEach((typeGroup) => {
          typeGroup.collectors.forEach((collector) => {
            tableData.push([
              headGroup.head,
              svGroup.sv,
              typeGroup.type,
              collector.collector,
              collector.totalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 }),
              (collector.rate * 100).toFixed(2) + "%",
              collector.commission.toLocaleString("en-US", { minimumFractionDigits: 2 })
            ]);
          });
          
          // Add type total
          tableData.push([
            "",
            "",
            { content: `${typeGroup.type} Total`, styles: { fontStyle: "bold" } },
            "",
            { content: typeGroup.totalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold" } },
            { content: (typeGroup.totalRate * 100).toFixed(2) + "%", styles: { fontStyle: "bold" } },
            { content: typeGroup.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold" } }
          ]);
        });
        
        // Add SV total
        tableData.push([
          "",
          { content: `Total ${svGroup.sv}`, styles: { fontStyle: "bold", fillColor: [241, 245, 249] } },
          "",
          "",
          { content: svGroup.totalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [241, 245, 249] } },
          "",
          { content: svGroup.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [241, 245, 249] } }
        ]);
      });
      
      // Add Head total
      tableData.push([
        { content: `Total ${headGroup.head}`, styles: { fontStyle: "bold", fillColor: [226, 232, 240] } },
        "",
        "",
        "",
        { content: headGroup.totalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [226, 232, 240] } },
        "",
        { content: headGroup.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [226, 232, 240] } }
      ]);
    });
    
    // Add Grand Total
    tableData.push([
      { content: "Grand Total", styles: { fontStyle: "bold", fillColor: [51, 65, 85], textColor: [255, 255, 255] } },
      "",
      "",
      "",
      { content: data.grandTotalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [51, 65, 85], textColor: [255, 255, 255] } },
      "",
      { content: data.grandTotalCommission.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [16, 185, 129], textColor: [255, 255, 255] } }
    ]);
    
    // Generate table
    autoTable(doc, {
      head: [["Head", "S.V", "Type", "Collector", "Sum of Payment", "Rate", "Commission"]],
      body: tableData,
      startY: 28,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      columnStyles: {
        4: { halign: "right" },
        5: { halign: "center" },
        6: { halign: "right" }
      }
    });
    
    // Generate file name
    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = `Commission_Report_${company}_${dateStr}.pdf`;
    
    // Save PDF
    doc.save(fileName);
  }, [data, company]);

  return (
    <div className="flex gap-3">
      <button
        onClick={exportToExcel}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold shadow-md"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export to Excel
      </button>
      <button
        onClick={exportToPDF}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-semibold shadow-md"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Export to PDF
      </button>
    </div>
  );
}
