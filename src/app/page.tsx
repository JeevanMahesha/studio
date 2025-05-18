"use client"; // Mark this as a Client Component

import { PaginationControls } from "@/components/common/PaginationControls";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProfileFilters } from "@/components/profile/ProfileFilters";
import { ProfileList } from "@/components/profile/ProfileList";
import { useToast } from "@/hooks/use-toast";
import { deleteProfile, fetchProfiles } from "@/lib/apiClient"; // Import seed function
import { defaultStatuses } from "@/types/profile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Providers } from "./providers"; // Import the Providers component

const PROFILES_PER_PAGE = 10;

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get URL parameters
  const searchTerm = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || null;
  const currentPage = Number(searchParams.get("page")) || 1;
  const sortBy = searchParams.get("sort") || "updatedAt";

  // Update URL parameters
  const updateSearchParams = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      router.push(`?${newParams.toString()}`);
    },
    [router, searchParams]
  );

  // Fetch profiles based on search, sort, and pagination
  const {
    data: profilesData,
    isLoading: isLoadingProfiles,
    error: profilesError,
  } = useQuery({
    queryKey: [
      "profiles",
      searchTerm,
      statusFilter,
      sortBy,
      currentPage,
      PROFILES_PER_PAGE,
    ],
    queryFn: () =>
      fetchProfiles(
        { profileStatusId: statusFilter || null },
        searchTerm,
        sortBy,
        currentPage,
        PROFILES_PER_PAGE
      ),
    enabled: true,
    placeholderData: (previousData) => previousData,
  });

  // Mutation for deleting a profile
  const deleteMutation = useMutation({
    mutationFn: deleteProfile,
    onSuccess: (deleted, id) => {
      if (deleted) {
        toast({
          title: "Profile Deleted",
          description: "The profile has been successfully deleted.",
        });
        queryClient.invalidateQueries({ queryKey: ["profiles"] });
        // Reset to page 1 if the last item on the current page was deleted
        if (profilesData?.data.length === 1 && currentPage > 1) {
          updateSearchParams({ page: "1" });
        }
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

  const handleSearchChange = (newSearchTerm: string) => {
    updateSearchParams({
      search: newSearchTerm || null,
      page: "1",
    });
  };

  const handleStatusChange = (newStatus: string | null) => {
    updateSearchParams({
      status: newStatus,
      searchTerm: null,
      page: "1",
    });
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage.toString() });
  };

  const handleDeleteProfile = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const totalProfiles = profilesData?.total ?? 0;
  const totalPages = Math.ceil(totalProfiles / PROFILES_PER_PAGE);

  return (
    <MainLayout title="Matrimony Profiles" showAddButton={true}>
      <ProfileFilters
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        statuses={defaultStatuses}
        initialSearchTerm={searchTerm}
        initialStatus={statusFilter}
      />

      {profilesError ? (
        <div className="text-destructive text-center">
          Error loading profiles: {profilesError.message}
        </div>
      ) : (
        <>
          <ProfileList
            profiles={profilesData?.data ?? []}
            statuses={defaultStatuses}
            onDelete={handleDeleteProfile}
            isLoading={isLoadingProfiles || deleteMutation.isPending}
          />
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </MainLayout>
  );
}

// Wrap the page content with the Providers
export default function Home() {
  return (
    <Providers>
      <HomePageContent />
    </Providers>
  );
}
