import { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true, // Clerk userId
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    transactionType: {
      type: String,
      enum: ["income", "expense"],
      required: false,
    },
    accountScope: {
      type: String,
      enum: ["personal", "family"],
      required: true,
      default: "personal",
      index: true,
    },
    groupId: {
      type: String,
      required: false,
      index: true,
      default: null,
    },
  },

  { timestamps: true },
);

export const Transaction =
  models.Transaction || model("Transaction", TransactionSchema);

  
