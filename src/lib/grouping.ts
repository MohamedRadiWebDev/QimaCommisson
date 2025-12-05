import type {
  NormalizedRow,
  ProcessedData,
  Company,
  EmployeeRolesMapping,
  HeadGroup,
  SVGroup,
  TypeGroup,
  CollectorData,
} from "./types";
import { getCollectorRate, calculateTypeTotalCommission } from "./calculator";

export function groupAndCalculate(
  data: NormalizedRow[],
  company: Company,
  employeeRoles: EmployeeRolesMapping
): ProcessedData {
  const headGroups: HeadGroup[] = [];

  // Group by Head
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

    // Group by S.V within this Head
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

      // Group by Type within this S.V
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

        // Group by Collector within this Type
        const collectorMap = new Map<string, number>();
        typeRows.forEach((row) => {
          const collector = row.collector || "Unknown";
          const current = collectorMap.get(collector) || 0;
          collectorMap.set(collector, current + row.payment);
        });

        collectorMap.forEach((payment, collectorName) => {
          const rate = getCollectorRate(company, typeName, collectorName, employeeRoles);
          const commission = (payment * rate) / 100;

          collectors.push({
            collector: collectorName,
            totalPayment: payment,
            rate,
            commission,
          });
        });

        // Sort collectors by name
        collectors.sort((a, b) => a.collector.localeCompare(b.collector));

        const totalPayment = collectors.reduce((sum, c) => sum + c.totalPayment, 0);
        const collectorsCommission = collectors.reduce((sum, c) => sum + c.commission, 0);
        
        // Calculate the type total commission (additional commission on the total)
        const typeTotalCommission = calculateTypeTotalCommission(company, typeName, totalPayment);
        
        // Total commission = individual collectors commission + type total commission
        const totalCommission = collectorsCommission + typeTotalCommission;

        typeGroups.push({
          type: typeName,
          collectors,
          totalPayment,
          totalRate: collectors.length > 0 ? (totalCommission / totalPayment) * 100 : 0,
          totalCommission,
          typeTotalCommission, // Store this separately for display
        });
      });

      // Sort types
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

    // Sort SVs
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

  // Sort heads
  headGroups.sort((a, b) => a.head.localeCompare(b.head));

  const grandTotalPayment = headGroups.reduce((sum, h) => sum + h.totalPayment, 0);
  const grandTotalCommission = headGroups.reduce((sum, h) => sum + h.totalCommission, 0);

  return {
    headGroups,
    grandTotalPayment,
    grandTotalCommission,
  };
}