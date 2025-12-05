
import type { 
  RawDataRow, 
  ProcessedData, 
  Company, 
  TargetStatus,
  HeadGroup,
  SVGroup,
  TypeGroup,
  CollectorGroup,
  SVHeadSummary,
  SVHeadSummaryRow
} from "./types";
import { useEmployeeStore } from "./employeeStore";
import { calculateCommission } from "./calculator";

export function groupAndCalculate(
  data: RawDataRow[],
  company: Company,
  employeeRoles: Record<string, string>,
  targetStatus: TargetStatus = "No Target"
): ProcessedData {
  const headMap = new Map<string, Map<string, Map<string, Map<string, number>>>>();

  // Group by Head -> SV -> Type -> Collector
  data.forEach((row) => {
    const head = row.head || "Unknown";
    const sv = row.sv || "Unknown";
    const type = row.type || "Unknown";
    const collector = row.collector || "Unknown";

    if (!headMap.has(head)) {
      headMap.set(head, new Map());
    }
    const svMap = headMap.get(head)!;

    if (!svMap.has(sv)) {
      svMap.set(sv, new Map());
    }
    const typeMap = svMap.get(sv)!;

    if (!typeMap.has(type)) {
      typeMap.set(type, new Map());
    }
    const collectorMap = typeMap.get(type)!;

    const currentPayment = collectorMap.get(collector) || 0;
    collectorMap.set(collector, currentPayment + row.payment);
  });

  const employees = useEmployeeStore.getState().employees;
  const employeeTypeMap = new Map(employees.map(emp => [emp.name, emp.type]));

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
        const collectors: CollectorGroup[] = [];
        let typeTotalPayment = 0;
        let typeTotalCommission = 0;

        collectorMap.forEach((payment, collectorName) => {
          const employeeType = employeeTypeMap.get(collectorName) || "collector";
          const rate = calculateCommission(typeName, employeeType, company, targetStatus);
          const commission = (payment * rate) / 100;

          collectors.push({
            collector: collectorName,
            totalPayment: payment,
            rate,
            commission,
          });

          typeTotalPayment += payment;
          typeTotalCommission += commission;
        });

        collectors.sort((a, b) => b.totalPayment - a.totalPayment);

        types.push({
          type: typeName,
          collectors,
          totalPayment: typeTotalPayment,
          totalCommission: typeTotalCommission,
        });

        svTotalPayment += typeTotalPayment;
        svTotalCommission += typeTotalCommission;
      });

      types.sort((a, b) => b.totalPayment - a.totalPayment);

      svGroups.push({
        sv: svName,
        types,
        totalPayment: svTotalPayment,
        totalCommission: svTotalCommission,
      });

      headTotalPayment += svTotalPayment;
      headTotalCommission += svTotalCommission;
    });

    svGroups.sort((a, b) => b.totalPayment - a.totalPayment);

    headGroups.push({
      head: headName,
      svGroups,
      totalPayment: headTotalPayment,
      totalCommission: headTotalCommission,
    });

    grandTotalPayment += headTotalPayment;
    grandTotalCommission += headTotalCommission;
  });

  headGroups.sort((a, b) => b.totalPayment - a.totalPayment);

  return {
    headGroups,
    grandTotalPayment,
    grandTotalCommission,
  };
}

export function generateSVHeadSummary(data: ProcessedData, company: Company): SVHeadSummary {
  const typeMap = new Map<string, number>();

  data.headGroups.forEach((headGroup) => {
    headGroup.svGroups.forEach((svGroup) => {
      svGroup.types.forEach((typeGroup) => {
        const current = typeMap.get(typeGroup.type) || 0;
        typeMap.set(typeGroup.type, current + typeGroup.totalPayment);
      });
    });
  });

  const rows: SVHeadSummaryRow[] = [];
  let totalPayment = 0;
  let totalSVCommission = 0;
  let totalHeadCommission = 0;

  typeMap.forEach((payment, typeName) => {
    const svRate = calculateCommission(typeName, "sv", company, "No Target");
    const headRate = calculateCommission(typeName, "head", company, "No Target");
    const svCommission = (payment * svRate) / 100;
    const headCommission = (payment * headRate) / 100;

    rows.push({
      type: typeName,
      totalPayment: payment,
      svRate,
      svCommission,
      headRate,
      headCommission,
    });

    totalPayment += payment;
    totalSVCommission += svCommission;
    totalHeadCommission += headCommission;
  });

  rows.sort((a, b) => b.totalPayment - a.totalPayment);

  return {
    rows,
    totalPayment,
    totalSVCommission,
    totalHeadCommission,
  };
}

export function groupDataByType(
  data: RawDataRow[],
  targetStatus: "No Target" | "Target" | "Over Target" = "No Target"
): ProcessedData {
  const typeMap = new Map<string, RawDataRow[]>();

  data.forEach((row) => {
    const type = row.type || "Unknown";
    if (!typeMap.has(type)) {
      typeMap.set(type, []);
    }
    typeMap.get(type)!.push(row);
  });

  const processedData: ProcessedData = {
    headGroups: [],
    grandTotalPayment: 0,
    grandTotalCommission: 0,
  };

  const employees = useEmployeeStore.getState().employees;
  const employeeMap = new Map(employees.map(emp => [emp.name, emp.type]));

  if (typeMap.size === 0) {
    return processedData;
  }

  return processedData;
}
