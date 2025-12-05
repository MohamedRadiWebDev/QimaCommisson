"use client";

import { useCallback, useState } from "react";
import type { ProcessedData, Company } from "@/lib/types";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { generateSVHeadDetailedSummary } from "@/lib/grouping";

interface ExportButtonsProps {
  data: ProcessedData;
  company: Company;
}

export default function ExportButtons({ data, company }: ExportButtonsProps) {
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);

  const exportToExcel = useCallback(() => {
    setExporting("excel");
    
    setTimeout(() => {
      const workbook = XLSX.utils.book_new();
      const svHeadSummary = generateSVHeadDetailedSummary(data, company);
      
      const mainData: (string | number)[][] = [];
      
      mainData.push([
        "Head",
        "S.V",
        "Type",
        "Collector",
        "Sum of Payment",
        "Rate",
        "Commission"
      ]);
      
      data.headGroups.forEach((headGroup) => {
        headGroup.svGroups.forEach((svGroup) => {
          svGroup.types.forEach((typeGroup) => {
            typeGroup.collectors.forEach((collector) => {
              mainData.push([
                headGroup.head,
                svGroup.sv,
                typeGroup.type,
                collector.collector,
                collector.totalPayment.toFixed(2),
                collector.rate.toFixed(2) + "%",
                collector.commission.toFixed(2)
              ]);
            });
            
            mainData.push([
              "",
              "",
              `مجموع ${typeGroup.type}`,
              "",
              typeGroup.totalPayment.toFixed(2),
              "",
              ""
            ]);
          });
          
          mainData.push([
            "",
            `مجموع ${svGroup.sv}`,
            "",
            "",
            svGroup.totalPayment.toFixed(2),
            "",
            ""
          ]);
        });
        
        mainData.push([
          `مجموع ${headGroup.head}`,
          "",
          "",
          "",
          headGroup.totalPayment.toFixed(2),
          "",
          ""
        ]);
        
        mainData.push([]);
      });
      
      mainData.push([
        "المجموع الإجمالي (Grand Total)",
        "",
        "",
        "",
        data.grandTotalPayment.toFixed(2),
        "",
        ""
      ]);
      
      const mainSheet = XLSX.utils.aoa_to_sheet(mainData);
      mainSheet["!cols"] = [
        { wch: 25 },
        { wch: 25 },
        { wch: 15 },
        { wch: 30 },
        { wch: 18 },
        { wch: 10 },
        { wch: 18 }
      ];
      XLSX.utils.book_append_sheet(workbook, mainSheet, "Main Report");
      
      const svData: (string | number)[][] = [];
      svData.push(["S.V Name", "Type", "Payment", "Rate", "Commission"]);
      
      svHeadSummary.svDetails.forEach((sv) => {
        sv.typeBreakdown.forEach((typeData) => {
          svData.push([
            sv.name,
            typeData.type,
            typeData.payment.toFixed(2),
            typeData.rate.toFixed(2) + "%",
            typeData.commission.toFixed(2)
          ]);
        });
        
        svData.push([
          `مجموع ${sv.name}`,
          "",
          sv.totalPayment.toFixed(2),
          "",
          sv.totalCommission.toFixed(2)
        ]);
        svData.push([]);
      });
      
      svData.push([
        "المجموع الإجمالي S.V",
        "",
        svHeadSummary.totalPayment.toFixed(2),
        "",
        svHeadSummary.totalSVCommission.toFixed(2)
      ]);
      
      const svSheet = XLSX.utils.aoa_to_sheet(svData);
      svSheet["!cols"] = [
        { wch: 25 },
        { wch: 15 },
        { wch: 18 },
        { wch: 10 },
        { wch: 18 }
      ];
      XLSX.utils.book_append_sheet(workbook, svSheet, "S.V Commissions");
      
      const headData: (string | number)[][] = [];
      headData.push(["Head Name", "Type", "Payment", "Rate", "Commission"]);
      
      svHeadSummary.headDetails.forEach((head) => {
        head.typeBreakdown.forEach((typeData) => {
          headData.push([
            head.name,
            typeData.type,
            typeData.payment.toFixed(2),
            typeData.rate.toFixed(2) + "%",
            typeData.commission.toFixed(2)
          ]);
        });
        
        headData.push([
          `مجموع ${head.name}`,
          "",
          head.totalPayment.toFixed(2),
          "",
          head.totalCommission.toFixed(2)
        ]);
        headData.push([]);
      });
      
      headData.push([
        "المجموع الإجمالي Head",
        "",
        svHeadSummary.totalPayment.toFixed(2),
        "",
        svHeadSummary.totalHeadCommission.toFixed(2)
      ]);
      
      const headSheet = XLSX.utils.aoa_to_sheet(headData);
      headSheet["!cols"] = [
        { wch: 25 },
        { wch: 15 },
        { wch: 18 },
        { wch: 10 },
        { wch: 18 }
      ];
      XLSX.utils.book_append_sheet(workbook, headSheet, "Head Commissions");
      
      const date = new Date().toISOString().split("T")[0];
      const fileName = `Commission_Report_${company}_${date}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
      setExporting(null);
    }, 100);
  }, [data, company]);

  const exportToPDF = useCallback(() => {
    setExporting("pdf");
    
    setTimeout(() => {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });
      
      const svHeadSummary = generateSVHeadDetailedSummary(data, company);
      
      doc.setFontSize(18);
      doc.text(`Commission Report - ${company}`, 14, 15);
      
      doc.setFontSize(10);
      const date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      doc.text(`Generated: ${date}`, 14, 22);
      
      const mainTableData: (string | { content: string; styles: Record<string, unknown> })[][] = [];
      
      data.headGroups.forEach((headGroup) => {
        headGroup.svGroups.forEach((svGroup) => {
          svGroup.types.forEach((typeGroup) => {
            typeGroup.collectors.forEach((collector) => {
              mainTableData.push([
                headGroup.head,
                svGroup.sv,
                typeGroup.type,
                collector.collector,
                collector.totalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 }),
                collector.rate.toFixed(2) + "%",
                collector.commission.toLocaleString("en-US", { minimumFractionDigits: 2 })
              ]);
            });
            
            mainTableData.push([
              "",
              "",
              { content: `مجموع ${typeGroup.type}`, styles: { fontStyle: "bold" } },
              "",
              { content: typeGroup.totalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold" } },
              "",
              ""
            ]);
          });
          
          mainTableData.push([
            "",
            { content: `مجموع ${svGroup.sv}`, styles: { fontStyle: "bold", fillColor: [241, 245, 249] } },
            "",
            "",
            { content: svGroup.totalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [241, 245, 249] } },
            "",
            ""
          ]);
        });
        
        mainTableData.push([
          { content: `مجموع ${headGroup.head}`, styles: { fontStyle: "bold", fillColor: [226, 232, 240] } },
          "",
          "",
          "",
          { content: headGroup.totalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [226, 232, 240] } },
          "",
          ""
        ]);
      });
      
      mainTableData.push([
        { content: "المجموع الإجمالي (Grand Total)", styles: { fontStyle: "bold", fillColor: [51, 65, 85], textColor: [255, 255, 255] } },
        "",
        "",
        "",
        { content: data.grandTotalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [51, 65, 85], textColor: [255, 255, 255] } },
        "",
        ""
      ]);
      
      autoTable(doc, {
        head: [["Head", "S.V", "Type", "Collector", "Sum of Payment", "Rate", "Commission"]],
        body: mainTableData,
        startY: 28,
        styles: {
          fontSize: 9,
          cellPadding: 2,
          font: "helvetica",
          halign: "left"
        },
        headStyles: {
          fillColor: [51, 65, 85],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center"
        },
        columnStyles: {
          4: { halign: "right" },
          5: { halign: "center" },
          6: { halign: "right" }
        },
        didParseCell: function(cellData) {
          const text = cellData.cell.text.join("");
          if (/[\u0600-\u06FF]/.test(text)) {
            cellData.cell.styles.halign = "right";
          }
        }
      });
      
      doc.addPage();
      doc.setFontSize(16);
      doc.text("S.V Commissions", 14, 15);
      
      const svTableData: (string | { content: string; styles: Record<string, unknown> })[][] = [];
      svHeadSummary.svDetails.forEach((sv) => {
        sv.typeBreakdown.forEach((typeData, idx) => {
          svTableData.push([
            idx === 0 ? sv.name : "",
            typeData.type,
            typeData.payment.toLocaleString("en-US", { minimumFractionDigits: 2 }),
            typeData.rate.toFixed(2) + "%",
            typeData.commission.toLocaleString("en-US", { minimumFractionDigits: 2 })
          ]);
        });
        
        svTableData.push([
          { content: `مجموع ${sv.name}`, styles: { fontStyle: "bold", fillColor: [199, 210, 254] } },
          "",
          { content: sv.totalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [199, 210, 254] } },
          "",
          { content: sv.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [199, 210, 254] } }
        ]);
      });
      
      svTableData.push([
        { content: "المجموع الإجمالي S.V", styles: { fontStyle: "bold", fillColor: [99, 102, 241], textColor: [255, 255, 255] } },
        "",
        { content: svHeadSummary.totalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [99, 102, 241], textColor: [255, 255, 255] } },
        "",
        { content: svHeadSummary.totalSVCommission.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [99, 102, 241], textColor: [255, 255, 255] } }
      ]);
      
      autoTable(doc, {
        head: [["S.V Name", "Type", "Payment", "Rate", "Commission"]],
        body: svTableData,
        startY: 25,
        styles: {
          fontSize: 9,
          cellPadding: 2,
          font: "helvetica",
          halign: "left"
        },
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center"
        },
        columnStyles: {
          2: { halign: "right" },
          3: { halign: "center" },
          4: { halign: "right" }
        },
        didParseCell: function(cellData) {
          const text = cellData.cell.text.join("");
          if (/[\u0600-\u06FF]/.test(text)) {
            cellData.cell.styles.halign = "right";
          }
        }
      });
      
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Head Commissions", 14, 15);
      
      const headTableData: (string | { content: string; styles: Record<string, unknown> })[][] = [];
      svHeadSummary.headDetails.forEach((head) => {
        head.typeBreakdown.forEach((typeData, idx) => {
          headTableData.push([
            idx === 0 ? head.name : "",
            typeData.type,
            typeData.payment.toLocaleString("en-US", { minimumFractionDigits: 2 }),
            typeData.rate.toFixed(2) + "%",
            typeData.commission.toLocaleString("en-US", { minimumFractionDigits: 2 })
          ]);
        });
        
        headTableData.push([
          { content: `مجموع ${head.name}`, styles: { fontStyle: "bold", fillColor: [233, 213, 255] } },
          "",
          { content: head.totalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [233, 213, 255] } },
          "",
          { content: head.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [233, 213, 255] } }
        ]);
      });
      
      headTableData.push([
        { content: "المجموع الإجمالي Head", styles: { fontStyle: "bold", fillColor: [168, 85, 247], textColor: [255, 255, 255] } },
        "",
        { content: svHeadSummary.totalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [168, 85, 247], textColor: [255, 255, 255] } },
        "",
        { content: svHeadSummary.totalHeadCommission.toLocaleString("en-US", { minimumFractionDigits: 2 }), styles: { fontStyle: "bold", fillColor: [168, 85, 247], textColor: [255, 255, 255] } }
      ]);
      
      autoTable(doc, {
        head: [["Head Name", "Type", "Payment", "Rate", "Commission"]],
        body: headTableData,
        startY: 25,
        styles: {
          fontSize: 9,
          cellPadding: 2,
          font: "helvetica",
          halign: "left"
        },
        headStyles: {
          fillColor: [168, 85, 247],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center"
        },
        columnStyles: {
          2: { halign: "right" },
          3: { halign: "center" },
          4: { halign: "right" }
        },
        didParseCell: function(cellData) {
          const text = cellData.cell.text.join("");
          if (/[\u0600-\u06FF]/.test(text)) {
            cellData.cell.styles.halign = "right";
          }
        }
      });
      
      const dateStr = new Date().toISOString().split("T")[0];
      const fileName = `Commission_Report_${company}_${dateStr}.pdf`;
      
      doc.save(fileName);
      setExporting(null);
    }, 100);
  }, [data, company]);

  return (
    <div className="flex gap-3">
      <button
        onClick={exportToExcel}
        disabled={exporting !== null}
        className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg shadow-green-500/30 btn-animated disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting === "excel" ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        تصدير Excel
      </button>
      <button
        onClick={exportToPDF}
        disabled={exporting !== null}
        className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg shadow-red-500/30 btn-animated disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting === "pdf" ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
        تصدير PDF
      </button>
    </div>
  );
}
