"use client";

import { Providers } from "@/app/providers";
import { MainLayout } from "@/components/layout/MainLayout";
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
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { deleteProfile, fetchProfileById } from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns"; // For formatting dates
import { AlertTriangle, ArrowLeft, Edit, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

function ProfileDetailsPageContent() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const id = params.id as string;

  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => fetchProfileById(id),
    enabled: !!id, // Only fetch if id is available and statuses are loaded
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProfile,
    onSuccess: (deleted) => {
      if (deleted) {
        toast({
          title: "Profile Deleted",
          description: "The profile has been successfully deleted.",
        });
        queryClient.invalidateQueries({ queryKey: ["profiles"] });
        queryClient.invalidateQueries({ queryKey: ["allProfilesForOptions"] });
        router.push("/");
      } else {
        toast({
          title: "Deletion Failed",
          description:
            "Could not delete the profile. It might be in use or an error occurred.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Deletion Error",
        description: `Failed to delete profile: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = async () => {
    if (!profile?.id) return;
    await deleteMutation.mutateAsync(profile.id);
  };

  const isLoading = isLoadingProfile || deleteMutation.isPending;

  let content;

  if (isLoading) {
    content = (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/5 mb-2" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
          <div className="space-y-1 pt-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-10 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardFooter>
      </Card>
    );
  } else if (profileError) {
    content = (
      <div className="text-center text-destructive flex flex-col items-center gap-2">
        <AlertTriangle className="w-8 h-8" />
        <span>Error loading profile: {profileError.message}</span>
        <Button variant="outline" onClick={() => router.push("/")}>
          Go Back Home
        </Button>
      </div>
    );
  } else if (!profile) {
    content = (
      <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
        <AlertTriangle className="w-8 h-8" />
        <span>Profile not found.</span>
        <Button variant="outline" onClick={() => router.push("/")}>
          Go Back Home
        </Button>
      </div>
    );
  } else {
    content = (
      <Card className="w-full max-w-2xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">{profile.name}</CardTitle>
          <CardDescription>Matrimony ID: {profile.matrimonyId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {/* <Badge variant="secondary" className="text-sm">{getStatusName(profile.statusId)}</Badge> */}
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Age</p>
              <p>{profile.age}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Caste/Raise
              </p>
              <p>{profile.casteRaise}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Star</p>
              <p>{profile.star}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Star Match Score
              </p>
              <p>{profile.starMatchScore}/10</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Location
              </p>
              <p>
                {profile.city}, {profile.state}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Mobile Number
              </p>
              <p>{profile.mobileNumber}</p>
            </div>

            {profile.createdAt && (
              <div className="md:col-span-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Created On
                </p>
                <p>{format(new Date(profile.createdAt), "PPpp")}</p>
              </div>
            )}
            {profile.updatedAt && (
              <div className="md:col-span-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </p>
                <p>{format(new Date(profile.updatedAt), "PPpp")}</p>
              </div>
            )}
          </div>

          {profile.comments && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Comments
                </p>
                <p className="whitespace-pre-wrap">{profile.comments}</p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link href={`/profiles/${profile.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the profile for{" "}
                    <span className="font-semibold">{profile.name}</span>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteMutation.isPending}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className={buttonVariants({ variant: "destructive" })}
                  >
                    {deleteMutation.isPending
                      ? "Deleting..."
                      : "Confirm Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <MainLayout title={profile?.name ?? "Profile Details"}>
      {content}
    </MainLayout>
  );
}

export default function ProfileDetailsPage() {
  return (
    <Providers>
      <ProfileDetailsPageContent />
    </Providers>
  );
}
