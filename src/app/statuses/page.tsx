'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStatuses, addStatus, updateStatus, deleteStatus } from '@/lib/apiClient';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
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
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { ProfileStatus, ProfileStatusSchema } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { Providers } from '@/app/providers';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';

// Schema for the Status form (excluding ID)
const StatusFormSchema = ProfileStatusSchema.omit({ id: true });
type StatusFormData = z.infer<typeof StatusFormSchema>;


function StatusManagementPageContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingStatus, setEditingStatus] = React.useState<ProfileStatus | null>(null);

  const { data: statuses = [], isLoading, error } = useQuery({
    queryKey: ['statuses'],
    queryFn: fetchStatuses,
  });

  // Form hook using TanStack Form
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      if (editingStatus) {
        await updateMutation.mutateAsync({ id: editingStatus.id, data: value });
      } else {
        await addMutation.mutateAsync(value);
      }
    },
    validatorAdapter: zodValidator(),
  });

  // Add Mutation
  const addMutation = useMutation({
    mutationFn: (newStatus: StatusFormData) => addStatus(newStatus),
    onSuccess: (data) => {
      toast({ title: 'Status Added', description: `Status "${data.name}" created.` });
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: 'Error Adding Status', description: error.message, variant: 'destructive' });
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: StatusFormData }) => updateStatus(id, data),
    onSuccess: (data) => {
      if (data) {
        toast({ title: 'Status Updated', description: `Status "${data.name}" updated.` });
        queryClient.invalidateQueries({ queryKey: ['statuses'] });
        setIsDialogOpen(false);
        setEditingStatus(null);
        form.reset();
      }
    },
    onError: (error) => {
      toast({ title: 'Error Updating Status', description: error.message, variant: 'destructive' });
    },
  });

   // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteStatus,
    onSuccess: (deleted, id) => {
         if(deleted) {
            toast({ title: 'Status Deleted', description: 'Status successfully deleted.' });
            queryClient.invalidateQueries({ queryKey: ['statuses'] });
         } else {
             toast({
                 title: 'Deletion Failed',
                 description: 'Status might be in use by a profile and cannot be deleted.',
                 variant: 'destructive',
             });
         }
    },
    onError: (error) => {
      toast({ title: 'Error Deleting Status', description: error.message, variant: 'destructive' });
    },
  });


  const handleOpenDialog = (status: ProfileStatus | null = null) => {
    setEditingStatus(status);
    form.reset(); // Reset form on open
     if (status) {
        // Set form values if editing
         form.setFieldValue('name', status.name);
         form.setFieldValue('description', status.description ?? '');
     }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
      setIsDialogOpen(false);
      setEditingStatus(null);
      form.reset();
  }

  const handleDeleteConfirm = (id: string) => {
      deleteMutation.mutate(id);
  };

  const isSubmitting = addMutation.isPending || updateMutation.isPending;


  return (
    <MainLayout title="Manage Statuses">
      <div className="flex justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Status
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
             <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}>
                <DialogHeader>
                <DialogTitle>{editingStatus ? 'Edit Status' : 'Add New Status'}</DialogTitle>
                <DialogDescription>
                    {editingStatus ? 'Update the details for this status.' : 'Create a new status type for profiles.'}
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <form.Field
                         name="name"
                         validators={{ onChange: StatusFormSchema.shape.name }}
                         children={(field) => (
                             <div className="grid grid-cols-4 items-center gap-4">
                                 <Label htmlFor={field.name} className="text-right">Name</Label>
                                 <Input
                                     id={field.name}
                                     name={field.name}
                                     value={field.state.value}
                                     onBlur={field.handleBlur}
                                     onChange={(e) => field.handleChange(e.target.value)}
                                     className="col-span-3"
                                     required
                                     placeholder="e.g., Contacted"
                                 />
                                 {field.state.meta.touchedErrors && (
                                    <div className="col-start-2 col-span-3 text-xs text-destructive">{field.state.meta.touchedErrors}</div>
                                )}
                             </div>
                         )}
                    />
                    <form.Field
                         name="description"
                         validators={{ onChange: StatusFormSchema.shape.description }}
                         children={(field) => (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={field.name} className="text-right">Description</Label>
                                <Textarea
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value ?? ''}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    className="col-span-3"
                                    placeholder="(Optional) Describe when to use this status"
                                />
                                {field.state.meta.touchedErrors && (
                                    <div className="col-start-2 col-span-3 text-xs text-destructive">{field.state.meta.touchedErrors}</div>
                                )}
                            </div>
                         )}
                    />
                </div>
                <DialogFooter>
                 <DialogClose asChild>
                     <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                 </DialogClose>
                 <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit]) => (
                         <Button type="submit" disabled={!canSubmit || isSubmitting}>
                           {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                           {editingStatus ? 'Save Changes' : 'Create Status'}
                         </Button>
                     )}
                  />

                </DialogFooter>
             </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading statuses...</div>
      ) : error ? (
        <div className="text-destructive">Error loading statuses: {error.message}</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statuses.map((status) => (
                <TableRow key={status.id}>
                  <TableCell className="font-medium">{status.name}</TableCell>
                  <TableCell className="text-muted-foreground">{status.description || '-'}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(status)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" disabled={deleteMutation.isPending && deleteMutation.variables === status.id}>
                               {deleteMutation.isPending && deleteMutation.variables === status.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                )}
                                <span className="sr-only">Delete</span>
                             </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                             <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. Deleting status "{status.name}" might fail if it's currently assigned to any profiles.
                                </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                                <AlertDialogCancel disabled={deleteMutation.isPending && deleteMutation.variables === status.id}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                     onClick={() => handleDeleteConfirm(status.id)}
                                     disabled={deleteMutation.isPending && deleteMutation.variables === status.id}
                                     className={buttonVariants({ variant: "destructive" })}
                                >
                                    {deleteMutation.isPending && deleteMutation.variables === status.id ? 'Deleting...' : 'Confirm Delete'}
                                </AlertDialogAction>
                             </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                  </TableCell>
                </TableRow>
              ))}
               {statuses.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                          No statuses found. Add one to get started.
                      </TableCell>
                  </TableRow>
               )}
            </TableBody>
          </Table>
        </div>
      )}
    </MainLayout>
  );
}


export default function StatusManagementPage() {
    return (
        <Providers>
            <StatusManagementPageContent />
        </Providers>
    );
}
