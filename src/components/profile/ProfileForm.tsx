'use client';

import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ProfileSchema, Profile, ProfileStatus } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Define the schema specifically for the form (excluding server-generated fields like id, createdAt, updatedAt)
const ProfileFormSchema = ProfileSchema.omit({ id: true, createdAt: true, updatedAt: true });

interface ProfileFormProps {
  profile?: Profile; // Optional profile data for editing
  statuses: ProfileStatus[];
  onSubmit: (data: z.infer<typeof ProfileFormSchema>) => Promise<void>;
  isSubmitting: boolean;
}

export function ProfileForm({ profile, statuses = [], onSubmit, isSubmitting }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      name: profile?.name ?? '',
      casteRaise: profile?.casteRaise ?? '',
      age: profile?.age ?? undefined, // Ensure number type or undefined
      star: profile?.star ?? '',
      city: profile?.city ?? '',
      state: profile?.state ?? '',
      starMatchScore: profile?.starMatchScore ?? undefined, // Ensure number type or undefined
      mobileNumber: profile?.mobileNumber ?? '',
      statusId: profile?.statusId ?? '',
      matrimonyId: profile?.matrimonyId ?? '',
      comments: profile?.comments ?? '',
    },
    onSubmit: async ({ value }) => {
        await onSubmit(value);
    },
    validatorAdapter: zodValidator(),
  });


  const handleCancel = () => {
    if (profile?.id) {
      router.push(`/profiles/${profile.id}`); // Go back to details if editing
    } else {
      router.push('/'); // Go back home if adding
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{profile ? 'Edit Profile' : 'Add New Profile'}</CardTitle>
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
            validators={{
              onChange: ProfileFormSchema.shape.name,
            }}
            children={(field) => (
              <div>
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Full Name"
                  required
                />
                {field.state.meta.touchedErrors ? (
                  <em className="text-xs text-destructive">{field.state.meta.touchedErrors}</em>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="casteRaise"
            validators={{
              onChange: ProfileFormSchema.shape.casteRaise,
            }}
            children={(field) => (
              <div>
                <Label htmlFor={field.name}>Caste/Raise</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Caste or Community"
                  required
                />
                {field.state.meta.touchedErrors ? (
                  <em className="text-xs text-destructive">{field.state.meta.touchedErrors}</em>
                ) : null}
              </div>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="age"
               validators={{
                 onChange: ProfileFormSchema.shape.age,
               }}
              children={(field) => (
                <div>
                  <Label htmlFor={field.name}>Age</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ''} // Handle undefined
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                    type="number"
                    placeholder="Age"
                    required
                    min="18"
                  />
                  {field.state.meta.touchedErrors ? (
                    <em className="text-xs text-destructive">{field.state.meta.touchedErrors}</em>
                  ) : null}
                </div>
              )}
            />

            <form.Field
              name="star"
              validators={{
                onChange: ProfileFormSchema.shape.star,
              }}
              children={(field) => (
                <div>
                  <Label htmlFor={field.name}>Star</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Birth Star (Nakshatra)"
                    required
                  />
                  {field.state.meta.touchedErrors ? (
                    <em className="text-xs text-destructive">{field.state.meta.touchedErrors}</em>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="city"
              validators={{
                onChange: ProfileFormSchema.shape.city,
              }}
              children={(field) => (
                <div>
                  <Label htmlFor={field.name}>City</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="City"
                    required
                  />
                  {field.state.meta.touchedErrors ? (
                    <em className="text-xs text-destructive">{field.state.meta.touchedErrors}</em>
                  ) : null}
                </div>
              )}
            />

            <form.Field
              name="state"
              validators={{
                onChange: ProfileFormSchema.shape.state,
              }}
              children={(field) => (
                <div>
                  <Label htmlFor={field.name}>State</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="State"
                    required
                  />
                  {field.state.meta.touchedErrors ? (
                    <em className="text-xs text-destructive">{field.state.meta.touchedErrors}</em>
                  ) : null}
                </div>
              )}
            />
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field
                  name="starMatchScore"
                  validators={{
                    onChange: ProfileFormSchema.shape.starMatchScore,
                  }}
                  children={(field) => (
                    <div>
                      <Label htmlFor={field.name}>Star Match Score (0-10)</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ''} // Handle undefined
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        placeholder="e.g., 8.5"
                        required
                      />
                      {field.state.meta.touchedErrors ? (
                        <em className="text-xs text-destructive">{field.state.meta.touchedErrors}</em>
                      ) : null}
                    </div>
                  )}
                />

               <form.Field
                    name="statusId"
                     validators={{
                         onChange: ProfileFormSchema.shape.statusId,
                       }}
                    children={(field) => (
                        <div>
                        <Label htmlFor={field.name}>Status</Label>
                        <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value)}
                            required
                        >
                            <SelectTrigger id={field.name}>
                            <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                            {statuses.map((status) => (
                                <SelectItem key={status.id} value={status.id}>
                                {status.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                         {field.state.meta.touchedErrors ? (
                           <em className="text-xs text-destructive">{field.state.meta.touchedErrors}</em>
                         ) : null}
                        </div>
                    )}
                    />
           </div>


          <form.Field
            name="mobileNumber"
            validators={{
              onChange: ProfileFormSchema.shape.mobileNumber,
            }}
            children={(field) => (
              <div>
                <Label htmlFor={field.name}>Mobile Number</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                  type="tel"
                  required
                />
                 {field.state.meta.touchedErrors ? (
                   <em className="text-xs text-destructive">{field.state.meta.touchedErrors}</em>
                 ) : null}
              </div>
            )}
          />

          <form.Field
            name="matrimonyId"
            validators={{
              onChange: ProfileFormSchema.shape.matrimonyId,
            }}
            children={(field) => (
              <div>
                <Label htmlFor={field.name}>Matrimony ID</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Matrimony Site Profile ID"
                  required
                />
                 {field.state.meta.touchedErrors ? (
                   <em className="text-xs text-destructive">{field.state.meta.touchedErrors}</em>
                 ) : null}
              </div>
            )}
          />

          <form.Field
            name="comments"
             validators={{
               onChange: ProfileFormSchema.shape.comments,
             }}
            children={(field) => (
              <div>
                <Label htmlFor={field.name}>Comments</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ''} // Handle potentially undefined value
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Any additional notes or comments"
                />
                 {field.state.meta.touchedErrors ? (
                   <em className="text-xs text-destructive">{field.state.meta.touchedErrors}</em>
                 ) : null}
              </div>
            )}
          />
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {profile ? 'Update Profile' : 'Add Profile'}
                </Button>
            )}
           />
        </CardFooter>
      </form>
    </Card>
  );
}
