"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type FamilyManagementProps = {
  familyId: string;
  familyName: string;
};

export default function FamilyManagement({
  familyId,
  familyName,
}: FamilyManagementProps) {
  const router = useRouter();
  const [name, setName] = useState(familyName);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onRename() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Family name is required.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/families/${familyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data?.error ?? "Unable to update family name.");
        setSaving(false);
        return;
      }

      toast.success("Family name updated.");
      router.refresh();
    } catch {
      toast.error("Something went wrong while updating family.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    setDeleting(true);

    try {
      const response = await fetch(`/api/families/${familyId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data?.error ?? "Unable to delete family.");
        setDeleting(false);
        return;
      }

      toast.success("Family deleted successfully.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong while deleting family.");
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-xl border bg-slate-50 p-3">
      <p className="mb-2 text-sm font-semibold text-slate-700">Manage Family</p>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Family name"
          className="w-full max-w-xs bg-white"
        />
        <Button onClick={onRename} disabled={saving}>
          {saving ? "Saving..." : "Save Name"}
        </Button>

        <Button variant="outline" asChild>
          <Link href={`/family/${familyId}/edit`}>Edit Members</Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={deleting}>
              Delete Family
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete This Family?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the family and free all members so they can join
                another family.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
