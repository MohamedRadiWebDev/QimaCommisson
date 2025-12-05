import type {
  NormalizedRow,
  ProcessedData,
  Company,
  EmployeeRolesMapping,
  HeadGroup,
  SVGroup,
  TypeGroup,
  CollectorData,
  SVHeadSummary,
  SVHeadSummaryRow,
  TargetStatus,
} from "./types";
import { getCommissionRateFromJson, calculateSVCommission, calculateHeadCommission } from "./calculator";

export function groupAndCalculate(
  data: NormalizedRow[],
  company: Company,
  employeeRoles: EmployeeRolesMapping,
  targetStatus: TargetStatus = "No Target"
): ProcessedData {
  const headGroups: HeadGroup[] = [];

  const headMap = new Map<string, NormalizedRow[]>();
  data.forEach((row) => {
    const head = row.head || "Unknown";
    if (!headMap.has(head)) {
      headMap.set(head, []);
    }
    headMap.get(head)!.push(row);
  });

  headMap.forEach((headRows, headName) => {
    const svGroups: SVGroup[] = [];

    const svMap = new Map<string, NormalizedRow[]>();
    headRows.forEach((row) => {
      const sv = row.sv || "Unknown";
      if (!svMap.has(sv)) {
        svMap.set(sv, []);
      }
      svMap.get(sv)!.push(row);
    });

    svMap.forEach((svRows, svName) => {
      const typeGroups: TypeGroup[] = [];

      const typeMap = new Map<string, NormalizedRow[]>();
      svRows.forEach((row) => {
        const type = row.type || "Unknown";
        if (!typeMap.has(type)) {
          typeMap.set(type, []);
        }
        typeMap.get(type)!.push(row);
      });

      typeMap.forEach((typeRows, typeName) => {
        const collectors: CollectorData[] = [];

        const collectorMap = new Map<string, { payment: number }>();
        typeRows.forEach((row) => {
          const collector = row.collector || "Unknown";
          const current = collectorMap.get(collector);
          if (current) {
            current.payment += row.payment;
          } else {
            collectorMap.set(collector, { 
              payment: row.payment
            });
          }
        });

        collectorMap.forEach((data, collectorName) => {
          const employeeRole = employeeRoles[collectorName];
          
          // Get employee type from role, default to collector
          let employeeType = "collector";
          if (employeeRole?.role === "Telesales") {
            employeeType = "Tele";
          } else if (employeeRole?.role === "Production") {
            employeeType = "production";
          } else if (employeeRole?.role === "Collector") {
            employeeType = "collector";
          }
          
          let rate: number;
          if (employeeRole?.customRate !== undefined && employeeRole.customRate > 0) {
            rate = employeeRole.customRate;
          } else {
            rate = getCommissionRateFromJson(company, typeName, employeeType, targetStatus);
          }
          
          const commission = (data.payment * rate) / 100;

          collectors.push({
            collector: collectorName,
            totalPayment: data.payment,
            rate,
            commission,
          });
        });

        collectors.sort((a, b) => a.collector.localeCompare(b.collector));

        const totalPayment = collectors.reduce((sum, c) => sum + c.totalPayment, 0);
        const collectorsCommission = collectors.reduce((sum, c) => sum + c.commission, 0);
        
        const svResult = calculateSVCommission(company, typeName, totalPayment, targetStatus);
        const headResult = calculateHeadCommission(company, typeName, totalPayment, targetStatus);
        
        const totalCommission = collectorsCommission;

        typeGroups.push({
          type: typeName,
          collectors,
          totalPayment,
          totalRate: collectors.length > 0 && totalPayment > 0 ? (totalCommission / totalPayment) * 100 : 0,
          totalCommission,
          typeTotalCommission: collectorsCommission,
          svRate: svResult.rate,
          svCommission: svResult.commission,
          headRate: headResult.rate,
          headCommission: headResult.commission,
        });
      });

      typeGroups.sort((a, b) => a.type.localeCompare(b.type));

      const totalPayment = typeGroups.reduce((sum, t) => sum + t.totalPayment, 0);
      const totalCommission = typeGroups.reduce((sum, t) => sum + t.totalCommission, 0);

      svGroups.push({
        sv: svName,
        types: typeGroups,
        totalPayment,
        totalCommission,
      });
    });

    svGroups.sort((a, b) => a.sv.localeCompare(b.sv));

    const totalPayment = svGroups.reduce((sum, sv) => sum + sv.totalPayment, 0);
    const totalCommission = svGroups.reduce((sum, sv) => sum + sv.totalCommission, 0);

    headGroups.push({
      head: headName,
      svGroups,
      totalPayment,
      totalCommission,
    });
  });

  headGroups.sort((a, b) => a.head.localeCompare(b.head));

  const grandTotalPayment = headGroups.reduce((sum, h) => sum + h.totalPayment, 0);
  const grandTotalCommission = headGroups.reduce((sum, h) => sum + h.totalCommission, 0);

  return {
    headGroups,
    grandTotalPayment,
    grandTotalCommission,
  };
}

export function generateSVHeadSummary(
  data: ProcessedData,
  company: Company
): SVHeadSummary {
  const typeSummaryMap = new Map<string, { totalPayment: number; svRate: number; svCommission: number; headRate: number; headCommission: number }>();

  data.headGroups.forEach((headGroup) => {
    headGroup.svGroups.forEach((svGroup) => {
      svGroup.types.forEach((typeGroup) => {
        const existing = typeSummaryMap.get(typeGroup.type);
        if (existing) {
          existing.totalPayment += typeGroup.totalPayment;
          existing.svCommission += typeGroup.svCommission;
          existing.headCommission += typeGroup.headCommission;
        } else {
          typeSummaryMap.set(typeGroup.type, {
            totalPayment: typeGroup.totalPayment,
            svRate: typeGroup.svRate,
            svCommission: typeGroup.svCommission,
            headRate: typeGroup.headRate,
            headCommission: typeGroup.headCommission,
          });
        }
      });
    });
  });

  const rows: SVHeadSummaryRow[] = [];
  typeSummaryMap.forEach((summary, typeName) => {
    rows.push({
      type: typeName,
      totalPayment: summary.totalPayment,
      svRate: summary.svRate,
      svCommission: summary.svCommission,
      headRate: summary.headRate,
      headCommission: summary.headCommission,
    });
  });

  rows.sort((a, b) => a.type.localeCompare(b.type));

  const totalPayment = rows.reduce((sum, r) => sum + r.totalPayment, 0);
  const totalSVCommission = rows.reduce((sum, r) => sum + r.svCommission, 0);
  const totalHeadCommission = rows.reduce((sum, r) => sum + r.headCommission, 0);

  return {
    rows,
    totalPayment,
    totalSVCommission,
    totalHeadCommission,
  };
}
