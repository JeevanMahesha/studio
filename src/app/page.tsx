'use client'; // Mark this as a Client Component

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProfiles, fetchStatuses, deleteProfile } from '@/lib/apiClient';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProfileList } from '@/components/profile/ProfileList';
import { ProfileFilters } from '@/components/profile/ProfileFilters';
import { PaginationControls } from '@/components/common/PaginationControls';
import { useToast } from '@/hooks/use-toast';
import { Providers } from './providers'; // Import the Providers component
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

const PROFILES_PER_PAGE = 10;

function HomePageContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filters, setFilters] = React.useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy] = React.useState('name'); // Default sort by name
  const [currentPage, setCurrentPage] = React.useState(1);

  // Fetch statuses (needed for displaying status names and filtering)
  const { data: statuses = [], isLoading: isLoadingStatuses } = useQuery({
    queryKey: ['statuses'],
    queryFn: fetchStatuses,
  });

   // Fetch all profiles initially to populate filter options (can be optimized)
   // Use a distinct query key to avoid conflicts
   const { data: allProfilesData, isLoading: isLoadingAllProfiles } = useQuery({
        queryKey: ['allProfilesForFilterOptions'], // Distinct query key
        queryFn: () => fetchProfiles({}, '', 'name', 1, 1000), // Fetch a large number
        enabled: !isLoadingStatuses, // Only run when statuses are loaded
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes, adjust as needed
    });

  // Fetch profiles based on filters, search, sort, and pagination
  const { data: profilesData, isLoading: isLoadingProfiles, error: profilesError } = useQuery({
    queryKey: ['profiles', filters, searchTerm, sortBy, currentPage, PROFILES_PER_PAGE],
    queryFn: () => fetchProfiles(filters, searchTerm, sortBy, currentPage, PROFILES_PER_PAGE),
     enabled: !isLoadingStatuses, // Only run when statuses are loaded
     placeholderData: (previousData) => previousData, // Keep previous data while loading new page
  });

  // Mutation for deleting a profile
  const deleteMutation = useMutation({
    mutationFn: deleteProfile,
    onSuccess: (deleted, id) => {
      if (deleted) {
        toast({
          title: 'Profile Deleted',
          description: 'The profile has been successfully deleted.',
        });
        // Invalidate queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['profiles'] });
        queryClient.invalidateQueries({ queryKey: ['allProfilesForFilterOptions'] }); // Invalidate filter options query
         // Reset to page 1 if the last item on the current page was deleted
         if (profilesData?.data.length === 1 && currentPage > 1) {
             setCurrentPage(currentPage - 1);
         }
      } else {
         toast({
             title: 'Deletion Failed',
             description: 'Could not delete the profile. It might be in use or an error occurred.',
             variant: 'destructive',
         });
      }
    },
    onError: (error) => {
      toast({
        title: 'Deletion Error',
        description: `Failed to delete profile: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset to first page on search change
  };

   const handlePageChange = (newPage: number) => {
       setCurrentPage(newPage);
   };

   const handleDeleteProfile = async (id: string) => {
       await deleteMutation.mutateAsync(id);
   };

  const totalProfiles = profilesData?.total ?? 0;
  const totalPages = Math.ceil(totalProfiles / PROFILES_PER_PAGE);

  // Prepare initial filters *without* _profilesForOptions for the ProfileFilters component
  // Pass _profilesForOptions separately if needed by the component internally
  const initialFilterValues = React.useMemo(() => ({
        ...filters, // Current active filters
    }), [filters]);

  const profileOptionsForFilters = React.useMemo(() => ({
      _profilesForOptions: allProfilesData?.data ?? []
  }), [allProfilesData]);


  return (
    <MainLayout title="Matrimony Profiles" showAddButton={true}>
       {/* Show Skeleton or Loading state while statuses or all profiles are loading */}
       {isLoadingStatuses || isLoadingAllProfiles ? (
          <div className="mb-6 p-4 border rounded-lg bg-card space-y-4 h-[180px]"> {/* Adjusted height */}
                <Skeleton className="h-6 w-1/4 mb-2" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                    {[...Array(6)].map((_, i) => (
                         <div key={i} className="space-y-1">
                             <Skeleton className="h-4 w-1/3" />
                             <Skeleton className="h-10 w-full" />
                         </div>
                    ))}
                </div>
                 <div className="flex justify-end pt-2">
                    <Skeleton className="h-8 w-32" />
                </div>
            </div>
        ) : (
          <ProfileFilters
            statuses={statuses}
            initialFilters={profileOptionsForFilters} // Pass options data
            // initialFilters={initialFilterValues} // Pass only active filter values
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
          />
        )}

      {profilesError ? (
        <div className="text-destructive text-center">Error loading profiles: {profilesError.message}</div>
      ) : (
        <>
          <ProfileList
             profiles={profilesData?.data ?? []}
             statuses={statuses}
             onDelete={handleDeleteProfile}
             isLoading={isLoadingProfiles || deleteMutation.isPending} // Consider initial profile load as well
          />
          {totalPages > 1 && ( // Only show pagination if there's more than one page
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
