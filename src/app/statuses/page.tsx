'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchStatuses,
  addStatus,
  updateStatus,
  deleteStatus,
} from '@/lib/apiClient';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import type { ProfileStatus } from '@/types/profile'; // Keep ProfileStatus type
import { ProfileStatusSchema } from '@/types/profile'; // Import the Zod schema
import { useToast } from '@/hooks/use-toast';
import { Providers } from '@/app/providers';
import { useForm } from '@tanstack/react-form'; // Corrected import path
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';
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
} from '@/components/ui/alert-dialog';

// Schema for the status form (name and description)
const StatusFormSchema = ProfileStatusSchema.omit({ id: true });
type StatusFormData = z.infer<typeof StatusFormSchema>;

interface StatusFormProps {
  status?: ProfileStatus; // For editing
  onSubmit: (data: StatusFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function StatusForm({
  status,
  onSubmit,
  onCancel,
  isSubmitting,
}: StatusFormProps) {
  const form = useForm({
    defaultValues: {
      name: status?.name ?? '',
      description: status?.description ?? '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
    validatorAdapter: zodValidator(),
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{status ? 'Edit Status' : 'Add New Status'}</CardTitle>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardContent className="space-y-4">
          <form.Field
            name="name"
            validators={{ onChange: StatusFormSchema.shape.name }}
            children={(field) => (
              <div>
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Status Name (e.g., Contacted)"
                  required
                />
                {field.state.meta.touchedErrors ? (
                  <em className="text-xs text-destructive">
                    {field.state.meta.touchedErrors.join(', ')}
                  </em>
                ) : null}
              </div>
            )}
          />
          <form.Field
            name="description"
            validators={{ onChange: StatusFormSchema.shape.description.optional() }}
            children={(field) => (
              <div>
                <Label htmlFor={field.name}>Description (Optional)</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Brief description of the status"
                />
                {field.state.meta.touchedErrors ? (
                  <em className="text-xs text-destructive">
                    {field.state.meta.touchedErrors.join(', ')}
                  </em>
                ) : null}
              </div>
            )}
          />
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, formIsSubmitting]) => {
              const actualIsSubmitting = formIsSubmitting || isSubmitting;
              return (
                <Button type="submit" disabled={!canSubmit || actualIsSubmitting}>
                  {actualIsSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {status ? 'Update Status' : 'Add Status'}
                </Button>
              );
            }}
          />
        </CardFooter>
      </form>
    </Card>
  );
}

function ManageStatusesPageContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = React.useState(false);
  const [editingStatus, setEditingStatus] = React.useState<
    ProfileStatus | undefined
  >(undefined);

  const {
    data: statuses = [],
    isLoading: isLoadingStatuses,
    error: statusesError,
  } = useQuery({
    queryKey: ['statuses'],
    queryFn: fetchStatuses,
  });

  const addMutation = useMutation({
    mutationFn: addStatus,
    onSuccess: (newStatus) => {
      toast({
        title: 'Status Added',
        description: `Status "${newStatus.name}" has been successfully added.`,
      });
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error Adding Status',
        description: error.message || 'Could not add the status.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: StatusFormData }) =>
      updateStatus(id, data),
    onSuccess: (updatedStatus) => {
      if (updatedStatus) {
        toast({
          title: 'Status Updated',
          description: `Status "${updatedStatus.name}" has been successfully updated.`,
        });
        queryClient.invalidateQueries({ queryKey: ['statuses'] });
      } else {
        toast({
            title: 'Update Failed',
            description: 'Could not find the status to update.',
            variant: 'destructive',
        });
      }
      setShowForm(false);
      setEditingStatus(undefined);
    },
    onError: (error: any) => {
      toast({
        title: 'Error Updating Status',
        description: error.message || 'Could not update the status.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStatus,
    onSuccess: (deleted, id) => {
      if (deleted) {
        toast({
          title: 'Status Deleted',
          description: 'The status has been successfully deleted.',
        });
      } else {
        toast({
          title: 'Deletion Failed',
          description:
            'Could not delete the status. It might be in use by one or more profiles.',
          variant: 'destructive',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error Deleting Status',
        description: error.message || 'Could not delete the status.',
        variant: 'destructive',
      });
    },
  });

  const handleFormSubmit = async (data: StatusFormData) => {
    if (editingStatus) {
      await updateMutation.mutateAsync({ id: editingStatus.id, data });
    } else {
      await addMutation.mutateAsync(data);
    }
  };

  const handleEdit = (status: ProfileStatus) => {
    setEditingStatus(status);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingStatus(undefined);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  let content;

  if (isLoadingStatuses) {
    content = (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  } else if (statusesError) {
    content = (
      <div className="text-center text-destructive flex flex-col items-center gap-2">
        <AlertTriangle className="w-8 h-8" />
        <span>Error loading statuses: {(statusesError as Error).message}</span>
      </div>
    );
  } else if (statuses.length === 0 && !showForm) {
    content = (
      <div className="text-center text-muted-foreground mt-10">
        No statuses found. Add one to get started.
      </div>
    );
  } else {
    content = (
      <div className="space-y-4">
        {statuses.map((status) => (
          <Card key={status.id} className="shadow-sm">
            <CardHeader>
              <CardTitle>{status.name}</CardTitle>
              {status.description && (
                <CardDescription>{status.description}</CardDescription>
              )}
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(status)}
                disabled={updateMutation.isPending || deleteMutation.isPending}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteMutation.isPending && deleteMutation.variables === status.id}
                  >
                    {(deleteMutation.isPending && deleteMutation.variables === status.id) ? (
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
                      This action cannot be undone. This will permanently delete the
                      status "{status.name}". If this status is in use by any profiles,
                      deletion might fail.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteMutation.isPending && deleteMutation.variables === status.id}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(status.id)}
                      disabled={deleteMutation.isPending && deleteMutation.variables === status.id}
                      className={buttonVariants({ variant: 'destructive' })}
                    >
                       {(deleteMutation.isPending && deleteMutation.variables === status.id) ? 'Deleting...' : 'Confirm Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <MainLayout title="Manage Profile Statuses">
      <div className="mb-6 flex justify-end">
        {!showForm && (
          <Button onClick={() => { setEditingStatus(undefined); setShowForm(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Status
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <StatusForm
            key={editingStatus ? editingStatus.id : 'new'} // Ensure form re-renders with new defaults
            status={editingStatus}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            isSubmitting={addMutation.isPending || updateMutation.isPending}
          />
        </div>
      )}

      {content}
    </MainLayout>
  );
}

export default function ManageStatusesPage() {
  return (
    <Providers>
      <ManageStatusesPageContent />
    </Providers>
  );
}
