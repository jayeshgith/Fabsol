import z from "zod";
import { transactionFormSchema } from "../validators/transactionFormSchema";

export const transactionFormDefaultValues: z.infer<
  typeof transactionFormSchema
> = {
  transactionType: "income",
  categoryId: "",
  transactionDate: new Date(),
  amount: 0,
  description: "",
};
