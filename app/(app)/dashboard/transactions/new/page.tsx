import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import NewTransactionForm from "./new-transaction-form";

import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Group } from "@/models/Group";
import { User } from "@/models/User";
// import dynamic from "next/dynamic";

// const NewTransactionForm = dynamic(() => import("./new-transaction-form"), {
//   ssr: false,
// });


const NewTransactionPage = async () => {
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
    name: String(group.name ?? "Unnamed Family"),
  }));

  return (
    <div className="max-w-7xl mx-auto py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/transactions">Transactions</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Transaction</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="mt-8 p-6 max-w-3xl">
        <CardContent className="pt-6">
          <NewTransactionForm familyGroups={familyGroups} />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTransactionPage;
