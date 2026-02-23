import "server-only";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";

function getCategoryName(category: unknown): string {
  if (typeof category === "string" && category.trim()) {
    return category.trim();
  }

  if (category && typeof category === "object" && "name" in category) {
    const name = (category as { name?: string }).name;
    if (typeof name === "string" && name.trim()) {
      return name.trim();
    }
  }

  return "Unknown";
}

function getTransactionType(
  transactionType: unknown,
  category: unknown,
): "income" | "expense" {
  if (transactionType === "income" || transactionType === "expense") {
    return transactionType;
  }

  if (category && typeof category === "object" && "type" in category) {
    const type = (category as { type?: unknown }).type;
    if (type === "income" || type === "expense") {
      return type;
    }
  }

  return "expense";
}

export async function getTransactionsByMonth({
  year,
  month,
}: {
  year: number;
  month: number;
}) {
 
  const session = await auth();

  if (!session?.user) return [];

  
  const userId = session.user.email!;


  await connectDB();

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1); // next month start

  const transactions = await Transaction.find({
    userId,
    transactionDate: { $gte: start, $lt: end },
  })
    .sort({ transactionDate: -1 })
    .lean();

  return transactions.map((t) => ({
    id: t._id.toString(),
    description: t.description,
    amount: t.amount,
    transactionDate: t.transactionDate,
    category: getCategoryName(t.category),
    transactionType: getTransactionType(t.transactionType, t.category),
  }));
}
