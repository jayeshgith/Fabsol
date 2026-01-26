import "server-only";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { Category } from "@/models/Category"; // ✅ force model registration

export async function getRecentTransactions() {
  const { userId } = await auth();
  if (!userId) return [];

  await connectDB();

  const transactions = await Transaction.find({ userId })
    .populate("category", "name type")
    .sort({ transactionDate: -1 })
    .limit(5)
    .lean();

  return transactions.map((t: any) => ({
    id: t._id.toString(),
    description: t.description,
    amount: t.amount,
    transactionDate: t.transactionDate,
    category: t.category?.name ?? "Unknown",
    transactionType: t.transactionType ?? t.category?.type ?? "expense",
  }));
}
