"use client";

import * as React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Profile, ProfileStatus } from "@/types/profile";
import { Badge } from "@/components/ui/badge";
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
import { rasiListWithTranslations } from "@/lib/dropDownConstValues";

interface ProfileListProps {
  profiles: Profile[];
  statuses: ProfileStatus[];
  onDelete: (id: string) => Promise<void>; // Add onDelete handler
  isLoading: boolean; // Add loading state
}

// Helper to get status name from ID
export const getStatusName = (
  profileStatusId: string,
  statuses: ProfileStatus[]
): string => {
  return statuses.find((s) => s.id === profileStatusId)?.name ?? "Unknown";
};

// Helper to get badge variant based on status
export const getStatusVariant = (
  statusId: string
):
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "primary" => {
  switch (statusId) {
    case "1": // New
      return "default";
    case "2": // Contacted
      return "warning";
    case "3": // Meeting Scheduled
      return "outline";
    case "4": // Rejected
      return "destructive";
    case "5": // Accepted
      return "success";
    case "6": // On Hold
      return "secondary";
    case "7": // Profile Shared
      return "primary";
    default:
      return "secondary";
  }
};

// Helper to get Tanglish value for raise
const getTanglishRaise = (raise: string): string => {
  return (
    rasiListWithTranslations[raise as keyof typeof rasiListWithTranslations]
      ?.tanglish ?? raise
  );
};

// Helper to get status priority for sorting
const getStatusPriority = (statusId: string): number => {
  switch (statusId) {
    case "1": // New
      return 1;
    case "2": // Contacted
      return 2;
    case "3": // Meeting Scheduled
      return 3;
    case "4": // Rejected
      return 5;
    case "5": // Accepted
      return 4;
    case "6": // On Hold
      return 6;
    default:
      return 999;
  }
};

export function ProfileList({
  profiles,
  statuses,
  onDelete,
  isLoading,
}: ProfileListProps) {
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  // Sort profiles based on status priority
  const sortedProfiles = React.useMemo(() => {
    return [...profiles].sort((a, b) => {
      const priorityA = getStatusPriority(a.profileStatusId);
      const priorityB = getStatusPriority(b.profileStatusId);
      return priorityA - priorityB;
    });
  }, [profiles]);

  const handleDeleteConfirm = async (id: string) => {
    setIsDeleting(id);
    await onDelete(id);
    setIsDeleting(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        Loading profiles...
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="text-center text-muted-foreground mt-10">
        No profiles found. Add one to get started!
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="hidden md:table-cell">Raise</TableHead>
          <TableHead className="hidden sm:table-cell">City</TableHead>
          <TableHead>Profile Status</TableHead>
          <TableHead>Star</TableHead>
          <TableHead>Star Match Score</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedProfiles.map((profile, index) => (
          <TableRow key={profile.id}>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-medium">{profile.name}</TableCell>
            <TableCell className="hidden md:table-cell">
              {getTanglishRaise(profile.raise)}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {profile.city}, {profile.state}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(profile.profileStatusId)}>
                {getStatusName(profile.profileStatusId, statuses)}
              </Badge>
            </TableCell>
            <TableCell>{profile.star}</TableCell>
            <TableCell>{profile.starMatchScore}</TableCell>
            <TableCell className="text-right space-x-1">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/profiles/${profile.id}`}>
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/profiles/${profile.id}/edit`}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isDeleting === profile.id}
                  >
                    {isDeleting === profile.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                    <span className="sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the profile for{" "}
                      <span className="font-semibold">{profile.name}</span>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting === profile.id}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteConfirm(profile.id!)}
                      disabled={isDeleting === profile.id}
                      className={buttonVariants({ variant: "destructive" })}
                    >
                      {isDeleting === profile.id ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Re-export buttonVariants if needed within this file
import { buttonVariants } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
