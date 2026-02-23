import Link from "next/link";
import { LandmarkIcon } from "lucide-react";
import AuthButtons from "../auth-buttons";
import NotificationListener from "./notification-listener";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { getGroupAccessByEmail } from "@/lib/group-access";
import { isProfileComplete } from "@/lib/profile";
import { User } from "@/models/User";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean();
  const groupAccess = await getGroupAccessByEmail(session.user.email);
  const hasOwnedGroups = groupAccess?.hasOwnedGroups ?? false;
  const canCreateGroup = groupAccess?.canCreateGroup ?? false;

  if (
    !isProfileComplete({
      name: user?.name ?? "",
      email: session.user.email,
      phone: user?.phone ?? "",
      image: user?.image ?? "",
    })
  ) {
    redirect("/complete-profile");
  }

  return (
    <>
      <nav className="bg-primary p-8 text-white h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold gap-2 flex items-center">
          <LandmarkIcon className="text-lime-500" />
          PinTrust
        </Link>

        <div className="flex items-center gap-3">
          {canCreateGroup ? (
            <Link
              href="/groups/new"
              className="rounded-lg border border-white/25 px-3 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Create Family
            </Link>
          ) : null}
          <AuthButtons showGroupDashboard={hasOwnedGroups} />
        </div>
      </nav>

      <NotificationListener />
      {children}
    </>
  );
}
