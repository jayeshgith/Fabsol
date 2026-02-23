import "server-only";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";

type TransactionScope = "all" | "personal" | "family";

function getScopeFilter(scope: TransactionScope) {
  if (scope === "all") {
    return {};
  }

  if (scope === "family") {
    return { accountScope: "family" as const };
  }

  return {
    $or: [{ accountScope: "personal" }, { accountScope: { $exists: false } }],
  };
}

export async function getTransactionYearsRange(options?: {
  scope?: TransactionScope;
}) {
  
  const session = await auth();

  if (!session?.user) return [];

  
  const userId = session.user.email!;


  await connectDB();
  const scope = options?.scope ?? "all";

  const earliest = await Transaction.findOne({
    userId,
    ...getScopeFilter(scope),
  })
    .sort({ transactionDate: 1 })
    .lean();

  const currentYear = new Date().getFullYear();
  const earliestYear = earliest
    ? new Date(earliest.transactionDate).getFullYear()
    : currentYear;

  return Array.from(
    { length: currentYear - earliestYear + 1 },
    (_, i) => currentYear - i,
  );
}
