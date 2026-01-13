import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const categoriesTable = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  type: text({
    enum: ["income", "expense"],
  }).notNull(),
});

// export const transactionsTable = pgTable("transactions", {
export const transactionsTable = pgTable("transactions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  description: text().notNull(),
  amount: numeric().notNull(),
  transactionDate: timestamp("transaction_date", { mode: "string" }).notNull(),
  categoryId: integer("category_id")
    .references(() => categoriesTable.id)
    .notNull(),
});
