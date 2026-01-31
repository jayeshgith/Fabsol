"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="text-sm text-gray-600 mt-2">
          Continue with Google to SignIn & SignUp.
        </p>

      </div>
    </div>
  );
}
