'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { addProfile, fetchStatuses } from '@/lib/apiClient';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { MainLayout } from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';
import { ProfileSchema } from '@/types/profile'; // Import base schema
import { Providers } from '@/app/providers';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state
import { AlertTriangle } from 'lucide-react'; // Import icon for error state

// Define the schema specifically for the form submission (what the API expects)
const ProfileCreateSchema = ProfileSchema.omit({ id: true, createdAt: true, updatedAt: true });
type ProfileCreateData = z.infer<typeof ProfileCreateSchema>;


function AddProfilePageContent() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { toast } = useToast();

     // Fetch statuses for the dropdown
      const { data: statuses = [], isLoading: isLoadingStatuses, error: statusesError } = useQuery({
        queryKey: ['statuses'],
        queryFn: fetchStatuses,
      });

      // Log statuses when they are fetched or change
    //   React.useEffect(() => {
    //     if (!isLoadingStatuses && statuses) {
    //       console.log("Statuses loaded in AddProfilePageContent:", statuses);
    //     }
    //   }, [statuses, isLoadingStatuses]);


    const mutation = useMutation({
        mutationFn: (newProfile: ProfileCreateData) => addProfile(newProfile),
        onSuccess: (data) => {
            toast({
                title: 'Profile Added',
                description: `Profile for ${data.name} has been successfully created.`,
            });
            queryClient.invalidateQueries({ queryKey: ['profiles'] }); // Refetch profile list
            queryClient.invalidateQueries({ queryKey: ['allProfilesForFilterOptions'] }); // Refetch filter options
            router.push('/'); // Redirect to home page
        },
        onError: (error) => {
             let description = 'Could not add the profile.';
             if (error instanceof z.ZodError) {
                 // Format Zod errors for better readability
                 description = "Validation failed: " + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
             } else if (error instanceof Error) {
                 description = error.message;
             }
            toast({
                title: 'Error Adding Profile',
                description: description,
                variant: 'destructive',
            });
        },
    });

    const handleSubmit = async (data: ProfileCreateData) => {
        console.log("Form submitted with data:", data); // Log form data on submit
        await mutation.mutateAsync(data);
    };

    let content;

    if (isLoadingStatuses) {
       content = (
           // Show skeleton while loading form data (similar to edit page)
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
    } else if (statusesError) {
        content = (
            <div className="text-center text-destructive flex flex-col items-center gap-2">
                <AlertTriangle className="w-8 h-8" />
                <span>Error loading status options: {statusesError.message}</span>
            </div>
        );
    } else {
        content = (
             <ProfileForm
                onSubmit={handleSubmit}
                isSubmitting={mutation.isPending}
                statuses={statuses} // Pass the fetched statuses here
            />
        );
    }


    return (
        <MainLayout title="Add New Profile">
            {content}
        </MainLayout>
    );
}


export default function AddProfilePage() {
    return (
        <Providers>
            <AddProfilePageContent />
        </Providers>
    );
}
