import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">Account Settings</h1>

      <div className="mt-6 rounded-xl border p-4">
        <p className="text-sm text-gray-600">Signed in as</p>
        <p className="mt-1 font-medium">{session.user.name}</p>
        <p className="text-gray-700">{session.user.email}</p>
      </div>

      <div className="mt-6 rounded-xl border p-4">
        <h2 className="text-xl font-semibold">Security</h2>
        <p className="mt-2 text-gray-600 text-sm">
         Login another Google Account or change your current account password.
        </p>
      </div>
    </div>
  );
}
