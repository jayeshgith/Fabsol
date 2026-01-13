"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Divide } from "lucide-react";
import numeral from "numeral";
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";

const CashFlowContent = ({
  annualCashflow,
}: {
  annualCashflow: {
    month: number;
    totalIncome: number;
    totalExpenses: number;
  }[];
}) => {
  const today = new Date();

  const totalAnnualIncome = annualCashflow.reduce((total, month) => {
    return total + month.totalIncome;
  }, 0);

  const totalAnnualExpenses = annualCashflow.reduce((total, month) => {
    return total + month.totalExpenses;
  }, 0);

  const balance = totalAnnualIncome - totalAnnualExpenses;

  return (
    <>
      <ChartContainer
        config={{
          totalIncome: {
            label: "Income",
            color: "#84cc16",
          },
          totalExpenses: {
            label: "Expenses",
            color: "#f97316",
          },
        }}
        className="w-full h-[300px]">
        <BarChart data={annualCashflow}>
          <CartesianGrid vertical={false} />
          <YAxis
            tickFormatter={(value) => {
              return `₹ ${numeral(value).format("0,0")}`;
            }}
          />
          <XAxis
            tickFormatter={(value) => {
              return format(
                new Date(today.getFullYear(), value as number, 1),
                "MMM"
              );
            }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value, payload) => {
                  const month = payload[0]?.payload?.month;
                  return (
                    <div>
                      {format(
                        new Date(today.getFullYear(), month - 1, 1),
                        "MMMM"
                      )}
                    </div>
                  );
                }}
              />
            }
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={30}
            iconType="circle"
            formatter={(value) => {
              return <span className="capitalize text-primary">{value}</span>;
            }}
          />
          <Bar
            dataKey="totalIncome"
            radius={4}
            fill="var(--color-totalIncome)"
          />
          <Bar
            dataKey="totalExpenses"
            radius={4}
            fill="var(--color-totalExpenses)"
          />
        </BarChart>
      </ChartContainer>
      <div className="border-l px-4 flex flex-col gap-4 justify-center">
        <div>
          <span className="text-muted-foreground font-bold text-sm">
            Income
          </span>
          <h2 className="text-3xl font-semibold">
            ₹ {numeral(totalAnnualIncome).format("0,0[.]00")}
          </h2>
        </div>
        <div className="border-t" />
        <div>
          <span className="text-muted-foreground font-bold text-sm">
            Expenses
          </span>
          <h2 className="text-3xl font-semibold">
            ₹ {numeral(totalAnnualExpenses).format("0,0[.]00")}
          </h2>
        </div>
        <div className="border-t" />
        <div>
          <span className="text-muted-foreground font-bold text-sm">
            Balance
          </span>
          <h2
            className={cn(
              "text-3xl font-semibold",
              balance < 0 ? "text-red-600" : "text-green-600"
            )}>
            ₹ {numeral(balance).format("0,0[.]00")}
          </h2>
        </div>
      </div>
    </>
  );
};

export default CashFlowContent;
