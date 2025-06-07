"use client"; // Mark this as a Client Component

import { PaginationControls } from "@/components/common/PaginationControls";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProfileFilters } from "@/components/profile/ProfileFilters";
import { ProfileList } from "@/components/profile/ProfileList";
import { useToast } from "@/hooks/use-toast";
import { deleteProfile, fetchProfiles } from "@/lib/apiClient"; // Import seed function
import { getProfileFilters, saveProfileFilters } from "@/lib/filterUtils";
import { defaultStatuses } from "@/types/profile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Providers } from "./providers"; // Import the Providers component

const PROFILES_PER_PAGE = 10;

function HomePageContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Initialize state from localStorage
  const [filters, setFilters] = useState(() => getProfileFilters());
  const { searchTerm, statusFilter, currentPage, sortBy } = filters;

  // Update filters in state and localStorage
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = saveProfileFilters(newFilters);
    setFilters(updatedFilters);
  };

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
    queryFn: () => {
      // Handle the special "include-all" value
      if (statusFilter === "include-all") {
        // When "include-all" is selected, pass null as profileStatusId and set includeRejected to true
        return fetchProfiles(
          { profileStatusId: null },
          searchTerm,
          sortBy,
          currentPage,
          PROFILES_PER_PAGE,
          true // includeRejected = true to show all profiles including rejected
        );
      }

      return fetchProfiles(
        { profileStatusId: statusFilter },
        searchTerm,
        sortBy,
        currentPage,
        PROFILES_PER_PAGE,
        statusFilter === "4" // Only include rejected profiles if explicitly filtering for them (REJECTED status ID is '4')
      );
    },
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
          updateFilters({ currentPage: 1 });
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
    updateFilters({
      searchTerm: newSearchTerm,
      currentPage: 1,
    });
  };

  const handleStatusChange = (newStatus: string | null) => {
    updateFilters({
      statusFilter: newStatus,
      searchTerm: "",
      currentPage: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    updateFilters({ currentPage: newPage });
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
