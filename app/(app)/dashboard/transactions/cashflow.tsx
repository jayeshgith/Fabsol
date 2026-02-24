import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnnualCashflow } from "@/data/getAnnualCashflow";
import { getTransactionYearsRange } from "@/data/getTransactionYearsRange";
import CashFlowFiltersClient from "./cashflow-filters.client";
import CashFlowContentClient from "./cashflow-content.client";

const CashFlow = async ({
  year,
  scope = "personal",
  title = "Annual Cash Flow",
  showFilters = true,
}: {
  year: number;
  scope?: "personal" | "family";
  title?: string;
  showFilters?: boolean;
}) => {
  const [cashflow, yearsRange] = await Promise.all([
    getAnnualCashflow(year, { scope }),
    showFilters ? getTransactionYearsRange({ scope }) : Promise.resolve([]),
  ]);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>{title}</span>
          {showFilters ? (
            <CashFlowFiltersClient year={year} yearsRange={yearsRange} />
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-[1fr_250px]">
        <CashFlowContentClient annualCashflow={cashflow} />
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
