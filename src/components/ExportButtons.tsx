
"use client";

import { useCallback } from "react";
import type { ProcessedData } from "@/lib/types";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { generateSVHeadDetailedSummary } from "@/lib/grouping";
import type { Company } from "@/lib/types";

interface ExportButtonsProps {
  data: ProcessedData;
  company: Company;
}

export default function ExportButtons({ data, company }: ExportButtonsProps) {
  const exportToExcel = useCallback(() => {
    const workbook = XLSX.utils.book_new();
    const svHeadSummary = generateSVHeadDetailedSummary(data, company);
    
    // Sheet 1: Main Data
    const mainData: any[] = [];
    
    // Add header
    mainData.push([
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
          
          // Add type total
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
        
        // Add SV total
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
      
      // Add Head total
      mainData.push([
        `مجموع النادي ${headGroup.head}`,
        "",
        "",
        "",
        headGroup.totalPayment.toFixed(2),
        "",
        ""
      ]);
      
      // Add empty row for separation
      mainData.push([]);
    });
    
    // Add Grand Total
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
    
    // Sheet 2: S.V Commissions
    const svData: any[] = [];
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
    
    // Sheet 3: Head Commissions
    const headData: any[] = [];
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
    
    // Generate file name with date and company
    const date = new Date().toISOString().split("T")[0];
    const fileName = `Commission_Report_${company}_${date}.xlsx`;
    
    // Save file
    XLSX.writeFile(workbook, fileName);
  }, [data, company]);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });
    
    const svHeadSummary = generateSVHeadDetailedSummary(data, company);
    
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
    
    // Table 1: Main Report
    const mainTableData: any[] = [];
    
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
        { content: `مجموع النادي ${headGroup.head}`, styles: { fontStyle: "bold", fillColor: [226, 232, 240] } },
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
      didParseCell: function(data) {
        // Check if the text contains Arabic characters
        const text = data.cell.text.join("");
        if (/[\u0600-\u06FF]/.test(text)) {
          data.cell.styles.halign = "right";
        }
      }
    });
    
    // Add new page for S.V Commissions
    doc.addPage();
    doc.setFontSize(16);
    doc.text("S.V Commissions", 14, 15);
    
    const svTableData: any[] = [];
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
      didParseCell: function(data) {
        const text = data.cell.text.join("");
        if (/[\u0600-\u06FF]/.test(text)) {
          data.cell.styles.halign = "right";
        }
      }
    });
    
    // Add new page for Head Commissions
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Head Commissions", 14, 15);
    
    const headTableData: any[] = [];
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
      didParseCell: function(data) {
        const text = data.cell.text.join("");
        if (/[\u0600-\u06FF]/.test(text)) {
          data.cell.styles.halign = "right";
        }
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
