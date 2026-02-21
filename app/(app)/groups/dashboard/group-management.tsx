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

type GroupManagementProps = {
  groupId: string;
  groupName: string;
};

export default function GroupManagement({
  groupId,
  groupName,
}: GroupManagementProps) {
  const router = useRouter();
  const [name, setName] = useState(groupName);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onRename() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Group name is required.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data?.error ?? "Unable to update group name.");
        setSaving(false);
        return;
      }

      toast.success("Group name updated.");
      router.refresh();
    } catch {
      toast.error("Something went wrong while updating group.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    setDeleting(true);

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data?.error ?? "Unable to delete group.");
        setDeleting(false);
        return;
      }

      toast.success("Group deleted successfully.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong while deleting group.");
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-xl border bg-slate-50 p-3">
      <p className="mb-2 text-sm font-semibold text-slate-700">Manage Group</p>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Group name"
          className="w-full max-w-xs bg-white"
        />
        <Button onClick={onRename} disabled={saving}>
          {saving ? "Saving..." : "Save Name"}
        </Button>

        <Button variant="outline" asChild>
          <Link href={`/groups/${groupId}/edit`}>Edit Members</Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={deleting}>
              Delete Group
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete This Group?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the group and free all members so they can join
                another group.
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
