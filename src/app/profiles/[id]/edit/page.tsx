"use client";

import { Providers } from "@/app/providers";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fetchProfileById, updateProfile } from "@/lib/apiClient";
import { defaultStatuses, ProfileSchema } from "@/types/profile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";

// Define the schema specifically for the form submission (what the API expects for update)
// It's similar to create but we might make some fields optional in a real scenario
const ProfileUpdateSchema = ProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
type ProfileUpdateData = z.infer<typeof ProfileUpdateSchema>;

function EditProfilePageContent() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const id = params.id as string;

  // Fetch the profile data to pre-fill the form
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => fetchProfileById(id),
    enabled: !!id, // Fetch only when id and statuses are available
  });

  // Mutation for updating the profile
  const mutation = useMutation({
    mutationFn: (updatedData: ProfileUpdateData) =>
      updateProfile(id, updatedData),
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "Profile Updated",
          description: `Profile for ${data.name} has been successfully updated.`,
        });
        queryClient.invalidateQueries({ queryKey: ["profile", id] }); // Invalidate specific profile
        queryClient.invalidateQueries({ queryKey: ["profiles"] }); // Invalidate list view
        queryClient.invalidateQueries({ queryKey: ["allProfilesForOptions"] }); // Invalidate filter options
        router.push(`/profiles/${id}`); // Redirect to details page
      } else {
        toast({
          title: "Update Failed",
          description: "Could not find the profile to update.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error Updating Profile",
        description: error.message || "Could not update the profile.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: ProfileUpdateData) => {
    await mutation.mutateAsync(data);
  };

  const isLoading = isLoadingProfile;

  let content;

  if (isLoading) {
    content = (
      // Show skeleton while loading form data
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-10 w-1/3 mb-4" />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <div className="flex justify-end gap-2 pt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  } else if (profileError) {
    content = (
      <div className="text-center text-destructive flex flex-col items-center gap-2">
        <AlertTriangle className="w-8 h-8" />
        <span>Error loading profile data: {profileError.message}</span>
      </div>
    );
  } else if (!profile) {
    content = (
      <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
        <AlertTriangle className="w-8 h-8" />
        <span>Profile not found. Cannot edit.</span>
      </div>
    );
  } else {
    content = (
      <ProfileForm
        profile={profile}
        statuses={defaultStatuses}
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
      />
    );
  }

  return (
    <MainLayout title={`Edit Profile: ${profile?.name ?? ""}`}>
      {content}
    </MainLayout>
  );
}

export default function EditProfilePage() {
  return (
    <Providers>
      <EditProfilePageContent />
    </Providers>
  );
}
