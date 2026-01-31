import "server-only";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";

export async function getTransaction(transactionId: string) {
 
  const session = await auth();

  if (!session?.user) return null;

  
  const userId = session.user.email!;


  await connectDB();

  const tx = await Transaction.findOne({ _id: transactionId, userId })
    .populate("category", "name type")
    .lean();

  if (!tx) return null;

  return {
    id: tx._id.toString(),
    description: tx.description,
    amount: tx.amount,
    transactionDate: tx.transactionDate,
    transactionType: tx.transactionType,
    categoryId: tx.category?._id?.toString(), 
  };
}
