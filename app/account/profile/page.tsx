import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <div className="mt-6 rounded-xl border p-4">
        <p className="text-sm text-gray-600">Name</p>
        <p className="mt-1 font-medium">{session.user.name}</p>

        <p className="mt-4 text-sm text-gray-600">Email</p>
        <p className="mt-1 font-medium">{session.user.email}</p>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        If you want to edit name/photo, it is controlled by your Google account.
      </p>
    </div>
  );
}
