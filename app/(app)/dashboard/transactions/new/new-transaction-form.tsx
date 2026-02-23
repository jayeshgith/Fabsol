"use client";

import TransactionForm from "@/components/transaction-form";
import { transactionFormSchema } from "@/lib/validators/transactionFormSchema";
import z from "zod";
import { createTransactionAction } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FamilyGroup = {
  id: string;
  name: string;
};

const NewTransactionForm = ({
  familyGroups,
}: {
  familyGroups: FamilyGroup[];
}) => {
  const router = useRouter();

  const handleSubmit = async (data: z.input<typeof transactionFormSchema>) => {
    const result = await createTransactionAction({
      accountScope: data.accountScope,
      transactionType: data.transactionType,
      amount: Number(data.amount),
      groupId: data.groupId,
      category: data.category,
      transactionDate: data.transactionDate,
      description: data.description,
    });

    if (result.success) {
      toast.success("Transaction created successfully.", { duration: 4000 });

      router.push(
        "/dashboard/transactions?month=" +
          (new Date().getMonth() + 1) +
          "&year=" +
          new Date().getFullYear(),
      );
    } else {
      toast.error("Failed to create transaction.", {
        description: result.message,
        duration: 4000,
      });
    }
  };

  return (
    <TransactionForm
      familyGroups={familyGroups}
      onsubmit={handleSubmit}
      showDynamicTitle
    />
  );
};

export default NewTransactionForm;
