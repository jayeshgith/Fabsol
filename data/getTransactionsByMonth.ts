import "server-only";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";

export async function getTransactionsByMonth({
  year,
  month,
}: {
  year: number;
  month: number;
}) {
  // ✅ Auth.js session
  const session = await auth();

  if (!session?.user) return [];

  // token.sub mapped to session.user.id
  const userId = session.user.email!;


  await connectDB();

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1); // next month start

  const transactions = await Transaction.find({
    userId,
    transactionDate: { $gte: start, $lt: end },
  })
    .populate("category", "name type")
    .sort({ transactionDate: -1 })
    .lean();

  return transactions.map((t: any) => ({
    id: t._id.toString(),
    description: t.description,
    amount: t.amount,
    transactionDate: t.transactionDate,
    category: t.category?.name ?? "Unknown",
    transactionType: t.category?.type ?? "expense",
  }));
}
