import "server-only";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";

type TransactionScope = "personal" | "family";

function getScopeFilter(scope: TransactionScope) {
  if (scope === "family") {
    return { accountScope: "family" as const };
  }

  return {
    $or: [{ accountScope: "personal" }, { accountScope: { $exists: false } }],
  };
}

export async function getAnnualCashflow(
  year: number,
  options?: {
    scope?: TransactionScope;
  },
) {
 
  const session = await auth();

  if (!session?.user) return [];

  
  const userId = session.user.email!;


  await connectDB();
  const scope = options?.scope ?? "personal";

  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const rows = await Transaction.aggregate([
    {
      $match: {
        userId,
        ...getScopeFilter(scope),
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
      rows.find((r) => r._id.month === m && r._id.type === "income")
        ?.total ?? 0;

    const totalExpenses =
      rows.find((r) => r._id.month === m && r._id.type === "expense")
        ?.total ?? 0;

    result.push({
      month: m,
      totalIncome: Number(totalIncome),
      totalExpenses: Number(totalExpenses),
    });
  }

  return result;
}
