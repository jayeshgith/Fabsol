import Link from "next/link";
import { LandmarkIcon } from "lucide-react";
import AuthButtons from "../auth-buttons";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="bg-primary p-8 text-white h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold gap-2 flex items-center">
          <LandmarkIcon className="text-lime-500" />
          PinTrust
        </Link>

        <AuthButtons />
      </nav>

      {children}
    </>
  );
}
