import { Card, CardContent } from "@/components/ui/card";
import { redirect } from "next/navigation";
import NewTransactionForm from "./new-transaction-form";

import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Group } from "@/models/Group";
import { User } from "@/models/User";
import type { Category as CategoryType } from "@/types/Category";
import TransactionBackButton from "../transaction-back-button";

const NewTransactionPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) => {
  const params = await searchParams;
  const requestedScope = params.scope === "society" ? "family" : "personal";

  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  await connectDB();

  const currentUser = await User.findOne({ email: session.user.email })
    .select("_id")
    .lean();

  const familyGroupsRaw = currentUser?._id
    ? await Group.find({ memberIds: String(currentUser._id) })
        .select("_id name")
        .sort({ name: 1 })
        .lean()
    : [];

  const familyGroups = familyGroupsRaw.map((group) => ({
    id: String(group._id),
    name: String(group.name ?? "Unnamed Society"),
  }));

  const defaultAccountScope =
    requestedScope === "family" && familyGroups.length > 0 ? "family" : "personal";
  const transactionsHref =
    requestedScope === "family"
      ? "/dashboard/transactions?scope=society"
      : "/dashboard/transactions";

  const categoriesRaw = await Category.find()
    .select("_id name type scope")
    .sort({ name: 1 })
    .lean();

  const categories: CategoryType[] = categoriesRaw.flatMap((category) => {
    if (category.type !== "income" && category.type !== "expense") {
      return [];
    }

    const name = String(category.name ?? "").trim();
    if (!name) {
      return [];
    }

    return [
      {
        _id: String(category._id),
        name,
        type: category.type,
        scope:
          category.scope === "personal" ||
          category.scope === "family" ||
          category.scope === "social"
            ? category.scope
            : undefined,
      },
    ];
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <TransactionBackButton fallbackHref={transactionsHref} />

      <Card className="mt-6 w-full max-w-3xl p-4 sm:p-6">
        <CardContent className="pt-6">
          <NewTransactionForm
            familyGroups={familyGroups}
            categories={categories}
            defaultAccountScope={defaultAccountScope}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTransactionPage;
