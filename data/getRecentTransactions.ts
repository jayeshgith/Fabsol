import "server-only";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { Category } from "@/models/Category"; 

export async function getRecentTransactions() {
  
  const session = await auth();

  if (!session?.user) return [];

  
  const userId = session.user.email!;


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
