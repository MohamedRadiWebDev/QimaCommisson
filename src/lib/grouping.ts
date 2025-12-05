import type {
  NormalizedRow,
  CollectorData,
  TypeGroup,
  SVGroup,
  HeadGroup,
  ProcessedData,
  Company,
  EmployeeRolesMapping,
} from "./types";
import { getCollectorRate, getTypeTotalRate, calculateCommission } from "./calculator";

export function groupAndCalculate(
  rows: NormalizedRow[],
  company: Company,
  employeeRoles: EmployeeRolesMapping
): ProcessedData {
  const headMap = new Map<string, Map<string, Map<string, Map<string, number>>>>();

  rows.forEach((row) => {
    if (!headMap.has(row.head)) {
      headMap.set(row.head, new Map());
    }
    const svMap = headMap.get(row.head)!;

    if (!svMap.has(row.sv)) {
      svMap.set(row.sv, new Map());
    }
    const typeMap = svMap.get(row.sv)!;

    if (!typeMap.has(row.type)) {
      typeMap.set(row.type, new Map());
    }
    const collectorMap = typeMap.get(row.type)!;

    const currentPayment = collectorMap.get(row.collector) || 0;
    collectorMap.set(row.collector, currentPayment + row.payment);
  });

  const headGroups: HeadGroup[] = [];
  let grandTotalPayment = 0;
  let grandTotalCommission = 0;

  headMap.forEach((svMap, headName) => {
    const svGroups: SVGroup[] = [];
    let headTotalPayment = 0;
    let headTotalCommission = 0;

    svMap.forEach((typeMap, svName) => {
      const types: TypeGroup[] = [];
      let svTotalPayment = 0;
      let svTotalCommission = 0;

      typeMap.forEach((collectorMap, typeName) => {
        const collectors: CollectorData[] = [];
        let typeTotalPayment = 0;
        let typeTotalCommission = 0;

        collectorMap.forEach((payment, collectorName) => {
          const rate = getCollectorRate(company, typeName, collectorName, employeeRoles);
          const commission = calculateCommission(payment, rate);

          collectors.push({
            collector: collectorName,
            totalPayment: payment,
            rate,
            commission,
          });

          typeTotalPayment += payment;
          typeTotalCommission += commission;
        });

        collectors.sort((a, b) => a.collector.localeCompare(b.collector));

        const typeTotalRate = getTypeTotalRate(company, typeName);
        const typeGroupCommission = calculateCommission(typeTotalPayment, typeTotalRate);

        types.push({
          type: typeName,
          collectors,
          totalPayment: typeTotalPayment,
          totalRate: typeTotalRate,
          totalCommission: typeTotalCommission + typeGroupCommission,
        });

        svTotalPayment += typeTotalPayment;
        svTotalCommission += typeTotalCommission + typeGroupCommission;
      });

      types.sort((a, b) => {
        if (a.type === "Active") return -1;
        if (b.type === "Active") return 1;
        return a.type.localeCompare(b.type);
      });

      svGroups.push({
        sv: svName,
        types,
        totalPayment: svTotalPayment,
        totalCommission: svTotalCommission,
      });

      headTotalPayment += svTotalPayment;
      headTotalCommission += svTotalCommission;
    });

    svGroups.sort((a, b) => a.sv.localeCompare(b.sv));

    headGroups.push({
      head: headName,
      svGroups,
      totalPayment: headTotalPayment,
      totalCommission: headTotalCommission,
    });

    grandTotalPayment += headTotalPayment;
    grandTotalCommission += headTotalCommission;
  });

  headGroups.sort((a, b) => a.head.localeCompare(b.head));

  return {
    headGroups,
    grandTotalPayment,
    grandTotalCommission,
  };
}
