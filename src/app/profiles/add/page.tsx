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

    if (isLoadingStatuses) {
        return (
            <MainLayout title="Add New Profile">
                <div className="flex justify-center items-center h-40">Loading status options...</div>
            </MainLayout>
        );
    }

     if (statusesError) {
        return (
            <MainLayout title="Add New Profile">
                <div className="text-destructive text-center">Error loading statuses: {statusesError.message}</div>
            </MainLayout>
        );
    }


    return (
        <MainLayout title="Add New Profile">
        <ProfileForm
            onSubmit={handleSubmit}
            isSubmitting={mutation.isPending}
            statuses={statuses}
        />
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
