

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";

export default function ProfilePage() {
  const router = useRouter();
  const { update } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    email: "",
    name: "",
    image: "",
    bio: "",
    phone: "",
  });

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = await res.json();
      setForm(data);
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    setMsg("");

    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        image: form.image,
        bio: form.bio,
        phone: form.phone,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      setMsg("Update failed");
      return;
    }

   
    await update({
      name: form.name,
      image: form.image,
    });

    router.refresh();

   
    const refreshed = await fetch("/api/me", { cache: "no-store" }).then((r) =>
      r.json(),
    );
    setForm(refreshed);

    setMsg("Profile updated successfully");
  }

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-3xl p-6 md:p-8">
       
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Profile Settings
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Manage your account information and preferences
          </p>
        </div>

        
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
         
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Email Address
            </label>
            <input
              value={form.email}
              disabled
              placeholder="Email"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500">
              Your email address cannot be changed
            </p>
          </div>

     
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-slate-700"
            >
              Full Name
            </label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

         
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Profile Photo
            </label>
            <div className="flex items-center gap-5">
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 shadow-md">
                {form.image ? (
                  <img
                    src={form.image}
                    alt="profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <svg
                      className="h-8 w-8 text-slate-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <UploadButton
                  endpoint="profileImage"
                  appearance={{
                    button:
                      "rounded-lg border-2 border-blue-500 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-all hover:bg-blue-100 hover:border-blue-600",
                    allowedContent: "text-xs text-slate-500 mt-2",
                  }}
                  onClientUploadComplete={(res) => {
                    const file = res?.[0];
                    const url = file?.ufsUrl || file?.url;
                    if (url) setForm((f) => ({ ...f, image: url }));
                  }}
                  onUploadError={(error) => setMsg(error.message)}
                />
                <p className="mt-2 text-xs text-slate-500">
                  JPG, PNG up to 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Address Field */}
          <div className="space-y-2">
            <label
              htmlFor="address"
              className="block text-sm font-semibold text-slate-700"
            >
              Address
            </label>
            <textarea
              id="address"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Enter your address"
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-slate-700"
            >
              Phone Number
            </label>
            <input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Enter your phone number"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

         
          <div className="border-t border-slate-200" />

          
          {msg && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                msg.includes("successful")
                  ? "border border-green-200 bg-green-50 text-green-800"
                  : "border border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {msg}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={save}
            disabled={saving}
            className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
