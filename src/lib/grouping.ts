import type { RawDataRow, ProcessedData, CollectorData, TypeData, SVData, HeadData } from "./types";
import { useEmployeeStore } from "./employeeStore";

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
    types: [],
    targetStatus,
  };

  const employees = useEmployeeStore.getState().employees;
  const employeeMap = new Map(employees.map(emp => [emp.name, emp.type]));

  if (typeMap.size === 0) {
    return processedData;
  }

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
      const employeeType = employeeMap.get(collectorName);

      let type = "collector";
      if (employeeType === "tele") {
        type = "Tele";
      } else if (employeeType === "production") {
        type = "Production";
      } else if (employeeType === "collector") {
        type = "collector";
      }

      collectors.push({
        name: collectorName,
        payment: data.payment,
        employeeType: type,
      });
    });

    collectors.sort((a, b) => b.payment - a.payment);

    const svMap = new Map<string, number>();
    const headMap = new Map<string, number>();

    typeRows.forEach((row) => {
      const sv = row.sv || "Unknown";
      const head = row.head || "Unknown";

      svMap.set(sv, (svMap.get(sv) || 0) + row.payment);
      headMap.set(head, (headMap.get(head) || 0) + row.payment);
    });

    const svs: SVData[] = Array.from(svMap.entries()).map(([name, payment]) => ({
      name,
      payment,
    }));

    const heads: HeadData[] = Array.from(headMap.entries()).map(([name, payment]) => ({
      name,
      payment,
    }));

    svs.sort((a, b) => b.payment - a.payment);
    heads.sort((a, b) => b.payment - a.payment);

    const totalPayment = typeRows.reduce((sum, row) => sum + row.payment, 0);

    const typeData: TypeData = {
      typeName,
      collectors,
      svs,
      heads,
      totalPayment,
    };

    processedData.types.push(typeData);
  });

  processedData.types.sort((a, b) => b.totalPayment - a.totalPayment);

  return processedData;
}