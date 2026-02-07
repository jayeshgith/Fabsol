"use client";

import TransactionForm from "@/components/transaction-form";
import { transactionFormSchema } from "@/lib/validators/transactionFormSchema";
import type { Category } from "@/types/Category";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import { updateTransactionAction } from "./actions";

const EditTransactionForm = ({
  categories,
  transaction,
}: {
  categories: Category[];
  transaction: {
    id: string;
    categoryId: string;
    amount: number;
    description: string;
    transactionDate: Date;
    transactionType?: "income" | "expense";
  };
}) => {
  const router = useRouter();
const handleSubmit = async (data: z.input<typeof transactionFormSchema>) => {
  const result = await updateTransactionAction({
    id: transaction.id, 
    transactionType: data.transactionType,
    amount: Number(data.amount),
    categoryId: data.categoryId, 
    transactionDate: data.transactionDate, 
    description: data.description,
  });

  if (result.success) {
    toast.success("Transaction updated successfully.", { duration: 4000 });
    router.push(
      "/dashboard/transactions?month=" +
        (new Date().getMonth() + 1) +
        "&year=" +
        new Date().getFullYear(),
    );
  } else {
    toast.error("Failed to update transaction.", {
      description: result.message,
      duration: 4000,
    });
  }
};


  return (
    <TransactionForm
      categories={categories}
      onsubmit={handleSubmit}
      defaultValues={{
        transactionType:
          transaction.transactionType ||
          categories.find((c) => c._id === transaction.categoryId)?.type ||
          "income",
        amount: transaction.amount,
        categoryId: transaction.categoryId,
        description: transaction.description,
        transactionDate: new Date(transaction.transactionDate),
      }}
    />
  );
};

export default EditTransactionForm;
