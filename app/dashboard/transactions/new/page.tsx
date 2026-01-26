import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import NewTransactionForm from "./new-transaction-form";

import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
// import { Category } from "@/types/Category";
// import Category  from "@/models/Category";

const NewTransactionPage = async () => {
  await connectDB();
 


  const categories = await Category.find().lean();
   console.log("CATEGORIES FROM DB:", categories.length);
   console.log("FIRST:", categories[0]);

  
  const safeCategories = categories.map((c: any) => ({
    _id: c._id.toString(),
    name: c.name,
    type: c.type,
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
        <CardHeader className="text-2xl font-bold">
          <CardTitle>New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <NewTransactionForm categories={safeCategories} />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTransactionPage;
