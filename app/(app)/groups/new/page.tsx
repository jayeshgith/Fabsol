import { auth } from "@/auth";
import { getGroupAccessByEmail } from "@/lib/group-access";
import { redirect } from "next/navigation";
import CreateGroupForm from "./create-group-form";

export default async function CreateGroupPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const groupAccess = await getGroupAccessByEmail(session.user.email);
  if (!groupAccess) {
    redirect("/dashboard");
  }

  if (!groupAccess.canCreateGroup) {
    redirect("/dashboard");
  }

  return <CreateGroupForm />;
}
