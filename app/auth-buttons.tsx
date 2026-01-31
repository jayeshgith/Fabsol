
"use client";

import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import UserDropdown from "./user-dropdown";

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session?.user) {
    return (
      <div className="flex items-center">
        <Button
          variant="link"
          className="mr-4 text-white text-xl"
          onClick={() =>
            signIn("google", {
              callbackUrl: "/",
              prompt: "select_account", 
            })
          }
        >
          Sign In
        </Button>

        <Button
          variant="link"
          className="mr-4 text-white text-xl"
          onClick={() =>
            signIn("google", {
              callbackUrl: "/",
              prompt: "select_account", 
            })
          }
        >
          Sign Up
        </Button>
      </div>
    );
  }

  
  return (
    <div className="flex items-center gap-4">
      <UserDropdown />
    </div>
  );
}
