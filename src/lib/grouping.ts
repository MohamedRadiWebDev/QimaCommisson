
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
  SVHeadSummaryRow,
  EmployeeRolesMapping
} from "./types";
import { useEmployeeStore } from "./employeeStore";
import { getCommissionRateFromJson } from "./calculator";

export function groupAndCalculate(
  data: RawDataRow[],
  company: Company,
  employeeRoles: EmployeeRolesMapping,
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
  const employeeSubTypeMap = new Map(employees.map(emp => [emp.name, emp.productionSubType]));

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
          let employeeType = employeeTypeMap.get(collectorName) || "collector";
          let lookupType = typeName;
          
          // For production employees, we need to use "production" as employee type
          // and the productionSubType as the Type field in the lookup
          if (employeeType === "production") {
            const productionSubType = employeeSubTypeMap.get(collectorName);
            if (productionSubType === "tele") {
              lookupType = "Tele";
            } else {
              lookupType = "collector";
            }
          }
          
          const rate = getCommissionRateFromJson(company, lookupType, employeeType, targetStatus);
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

  // Calculate SV and Head commissions for grand total
  let grandTotalSVCommission = 0;
  let grandTotalHeadCommission = 0;

  headGroups.forEach((headGroup) => {
    headGroup.svGroups.forEach((svGroup) => {
      svGroup.types.forEach((typeGroup) => {
        const svRate = getCommissionRateFromJson(company, typeGroup.type, "S.V", targetStatus);
        const headRate = getCommissionRateFromJson(company, typeGroup.type, "Head", targetStatus);
        
        grandTotalSVCommission += (typeGroup.totalPayment * svRate) / 100;
        grandTotalHeadCommission += (typeGroup.totalPayment * headRate) / 100;
      });
    });
  });

  const grandTotalAllCommissions = grandTotalCommission + grandTotalSVCommission + grandTotalHeadCommission;

  return {
    headGroups,
    grandTotalPayment,
    grandTotalCommission,
    grandTotalSVCommission,
    grandTotalHeadCommission,
    grandTotalAllCommissions,
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
    const svRate = getCommissionRateFromJson(company, typeName, "S.V", "No Target");
    const headRate = getCommissionRateFromJson(company, typeName, "Head", "No Target");
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

export interface TypeBreakdown {
  type: string;
  payment: number;
  rate: number;
  commission: number;
}

export interface SVDetail {
  name: string;
  totalPayment: number;
  totalCommission: number;
  typeBreakdown: TypeBreakdown[];
}

export interface HeadDetail {
  name: string;
  totalPayment: number;
  totalCommission: number;
  typeBreakdown: TypeBreakdown[];
}

export interface SVHeadDetailedSummary {
  svDetails: SVDetail[];
  headDetails: HeadDetail[];
  totalSVCommission: number;
  totalHeadCommission: number;
  totalPayment: number;
}

export function generateSVHeadDetailedSummary(data: ProcessedData, company: Company): SVHeadDetailedSummary {
  const svMap = new Map<string, { payment: number; commission: number; typeBreakdown: Map<string, { payment: number; rate: number; commission: number }> }>();
  const headMap = new Map<string, { payment: number; commission: number; typeBreakdown: Map<string, { payment: number; rate: number; commission: number }> }>();
  
  let totalPayment = 0;

  data.headGroups.forEach((headGroup) => {
    headGroup.svGroups.forEach((svGroup) => {
      let svTotalPayment = 0;
      let svTotalCommission = 0;
      const svTypeBreakdown = new Map<string, { payment: number; rate: number; commission: number }>();

      svGroup.types.forEach((typeGroup) => {
        const svRate = getCommissionRateFromJson(company, typeGroup.type, "S.V", "No Target");
        const svCommission = (typeGroup.totalPayment * svRate) / 100;
        
        svTotalPayment += typeGroup.totalPayment;
        svTotalCommission += svCommission;

        const currentType = svTypeBreakdown.get(typeGroup.type) || { payment: 0, rate: svRate, commission: 0 };
        svTypeBreakdown.set(typeGroup.type, {
          payment: currentType.payment + typeGroup.totalPayment,
          rate: svRate,
          commission: currentType.commission + svCommission
        });
      });

      const currentSV = svMap.get(svGroup.sv) || { payment: 0, commission: 0, typeBreakdown: new Map() };
      
      svTypeBreakdown.forEach((typeData, typeName) => {
        const existingType = currentSV.typeBreakdown.get(typeName) || { payment: 0, rate: typeData.rate, commission: 0 };
        currentSV.typeBreakdown.set(typeName, {
          payment: existingType.payment + typeData.payment,
          rate: typeData.rate,
          commission: existingType.commission + typeData.commission
        });
      });

      svMap.set(svGroup.sv, {
        payment: currentSV.payment + svTotalPayment,
        commission: currentSV.commission + svTotalCommission,
        typeBreakdown: currentSV.typeBreakdown
      });
    });

    let headTotalPayment = 0;
    let headTotalCommission = 0;
    const headTypeBreakdown = new Map<string, { payment: number; rate: number; commission: number }>();

    headGroup.svGroups.forEach((svGroup) => {
      svGroup.types.forEach((typeGroup) => {
        const headRate = getCommissionRateFromJson(company, typeGroup.type, "Head", "No Target");
        const headCommission = (typeGroup.totalPayment * headRate) / 100;
        
        headTotalPayment += typeGroup.totalPayment;
        headTotalCommission += headCommission;

        const currentType = headTypeBreakdown.get(typeGroup.type) || { payment: 0, rate: headRate, commission: 0 };
        headTypeBreakdown.set(typeGroup.type, {
          payment: currentType.payment + typeGroup.totalPayment,
          rate: headRate,
          commission: currentType.commission + headCommission
        });
      });
    });

    const currentHead = headMap.get(headGroup.head) || { payment: 0, commission: 0, typeBreakdown: new Map() };
    
    headTypeBreakdown.forEach((typeData, typeName) => {
      const existingType = currentHead.typeBreakdown.get(typeName) || { payment: 0, rate: typeData.rate, commission: 0 };
      currentHead.typeBreakdown.set(typeName, {
        payment: existingType.payment + typeData.payment,
        rate: typeData.rate,
        commission: existingType.commission + typeData.commission
      });
    });

    headMap.set(headGroup.head, {
      payment: currentHead.payment + headTotalPayment,
      commission: currentHead.commission + headTotalCommission,
      typeBreakdown: currentHead.typeBreakdown
    });
    
    totalPayment += headTotalPayment;
  });

  const svDetails: SVDetail[] = [];
  let totalSVCommission = 0;

  svMap.forEach((data, name) => {
    const typeBreakdown: TypeBreakdown[] = [];
    data.typeBreakdown.forEach((typeData, typeName) => {
      typeBreakdown.push({
        type: typeName,
        payment: typeData.payment,
        rate: typeData.rate,
        commission: typeData.commission
      });
    });
    typeBreakdown.sort((a, b) => b.payment - a.payment);

    svDetails.push({
      name,
      totalPayment: data.payment,
      totalCommission: data.commission,
      typeBreakdown
    });
    totalSVCommission += data.commission;
  });

  svDetails.sort((a, b) => b.totalPayment - a.totalPayment);

  const headDetails: HeadDetail[] = [];
  let totalHeadCommission = 0;

  headMap.forEach((data, name) => {
    const typeBreakdown: TypeBreakdown[] = [];
    data.typeBreakdown.forEach((typeData, typeName) => {
      typeBreakdown.push({
        type: typeName,
        payment: typeData.payment,
        rate: typeData.rate,
        commission: typeData.commission
      });
    });
    typeBreakdown.sort((a, b) => b.payment - a.payment);

    headDetails.push({
      name,
      totalPayment: data.payment,
      totalCommission: data.commission,
      typeBreakdown
    });
    totalHeadCommission += data.commission;
  });

  headDetails.sort((a, b) => b.totalPayment - a.totalPayment);

  return {
    svDetails,
    headDetails,
    totalSVCommission,
    totalHeadCommission,
    totalPayment
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
