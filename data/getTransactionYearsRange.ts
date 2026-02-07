import "server-only";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";

export async function getTransactionYearsRange() {
  
  const session = await auth();

  if (!session?.user) return [];

  
  const userId = session.user.email!;


  await connectDB();

  const earliest = await Transaction.findOne({ userId })
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
