import "server-only";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";

export async function getAnnualCashflow(year: number) {
  const { userId } = await auth();
  if (!userId) return [];

  await connectDB();

  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);


  const rows = await Transaction.aggregate([
    {
      $match: {
        userId,
        transactionDate: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$transactionDate" },
          type: "$transactionType", 
        },
        total: { $sum: "$amount" },
      },
    },
  ]);

  const result: {
    month: number;
    totalIncome: number;
    totalExpenses: number;
  }[] = [];

  for (let m = 1; m <= 12; m++) {
    const totalIncome =
      rows.find((r: any) => r._id.month === m && r._id.type === "income")
        ?.total ?? 0;

    const totalExpenses =
      rows.find((r: any) => r._id.month === m && r._id.type === "expense")
        ?.total ?? 0;

    result.push({
      month: m,
      totalIncome: Number(totalIncome),
      totalExpenses: Number(totalExpenses),
    });
  }

  return result;
}
