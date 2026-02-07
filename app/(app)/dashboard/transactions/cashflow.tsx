import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnnualCashflow } from "@/data/getAnnualCashflow";
import CashFlowFilters from "./cashflow-filters";
import { getTransactionYearsRange } from "@/data/getTransactionYearsRange";
import CashFlowContent from "./cashflow-content";

const CashFlow = async ({ year }: { year: number }) => {
  const [cashflow, yearsRange] = await Promise.all([
    getAnnualCashflow(year),
    getTransactionYearsRange(),
  ]);

  console.log("CashFlow Rendered with year:", cashflow);
  console.log("Years Range:", yearsRange);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Annual Cash Flow</span>
          <CashFlowFilters year={year} yearsRange={yearsRange} />
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-[1fr_250px]">
        <CashFlowContent annualCashflow={cashflow} />
      </CardContent>
    </Card>
  );
};

export default CashFlow;

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { getAnnualCashflow } from "@/data/getAnnualCashflow";
// import CashFlowFilters from "./cashflow-filters.client";
// import { getTransactionYearsRange } from "@/data/getTransactionYearsRange";
// import CashFlowContent from "./cashflow-content";

// const CashFlow = async ({ year }: { year: number }) => {
//   const [cashflow, yearsRange] = await Promise.all([
//     getAnnualCashflow(year),
//     getTransactionYearsRange(),
//   ]);

//   return (
//     <Card className="mb-8">
//       <CardHeader>
//         <CardTitle className="flex justify-between">
//           <span>Annual Cash Flow</span>
//           <CashFlowFilters year={year} yearsRange={yearsRange} />
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="grid grid-cols-[1fr_250px]">
//         <CashFlowContent annualCashflow={cashflow} />
//       </CardContent>
//     </Card>
//   );
// };

// export default CashFlow;
