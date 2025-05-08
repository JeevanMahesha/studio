"use client";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useRouter } from "next/navigation";
import * as React from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  DistrictList,
  matchingNakshatraList,
  StateList,
  rasiListWithTranslations,
} from "@/lib/dropDownConstValues";
import { Profile, ProfileSchema, ProfileStatus } from "@/types/profile";
import { Loader2 } from "lucide-react";

// Define the schema specifically for the form (excluding server-generated fields like id, createdAt, updatedAt)
const ProfileFormSchema = ProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

interface ProfileFormProps {
  readonly profile?: Profile;
  readonly statuses: ProfileStatus[];
  readonly onSubmit: (data: z.infer<typeof ProfileFormSchema>) => Promise<void>;
  readonly isSubmitting: boolean;
}

export function ProfileForm({
  profile,
  statuses = [],
  onSubmit,
  isSubmitting,
}: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const star = matchingNakshatraList;
  const [selectedState, setSelectedState] = React.useState<string | undefined>(
    profile?.state
  );
  const defaultValues = {
    name: profile?.name ?? "",
    casteRaise: profile?.casteRaise ?? "",
    age: profile?.age ?? 0, // Ensure number type or undefined
    star: profile?.star ?? "",
    city: profile?.city ?? "",
    state: profile?.state ?? "",
    starMatchScore: profile?.starMatchScore ?? 0, // Ensure number type or undefined
    mobileNumber: profile?.mobileNumber ?? "",
    statusId: profile?.statusId ?? "",
    matrimonyId: profile?.matrimonyId ?? "",
    comments: profile?.comments ?? "",
  };

  const form = useForm({
    defaultValues: defaultValues,
    onSubmit: async ({ value }) => {
      console.log("ProfileForm onSubmit value:", value); // Log value before submitting
      await onSubmit(value);
    },
    validatorAdapter: zodValidator(),
  });

  const handleCancel = () => {
    if (profile?.id) {
      router.push(`/profiles/${profile.id}`); // Go back to details if editing
    } else {
      router.push("/"); // Go back home if adding
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{profile ? "Edit Profile" : "Add New Profile"}</CardTitle>
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
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                  placeholder="Full Name"
                  required
                />
                {field.state.meta.touchedErrors ? (
                  <em className="text-xs text-destructive">
                    {field.state.meta.touchedErrors.join(", ")}
                  </em>
                ) : null}
              </div>
            )}
          </form.Field>
          <form.Field
            name="mobileNumber"
            validators={{
              onChange: ProfileFormSchema.shape.mobileNumber,
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Mobile Number</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                  placeholder="+91XXXXXXXXXX"
                  type="tel"
                  required
                />
                {field.state.meta.touchedErrors ? (
                  <em className="text-xs text-destructive">
                    {field.state.meta.touchedErrors.join(", ")}
                  </em>
                ) : null}
              </div>
            )}
          </form.Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="casteRaise"
              validators={{
                onChange: ProfileFormSchema.shape.casteRaise,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Raise</Label>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    required
                    onValueChange={(value) => {
                      field.handleChange(value);
                    }}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select Raise" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(rasiListWithTranslations).map(
                        ([key, rasi]: [
                          string,
                          (typeof rasiListWithTranslations)[keyof typeof rasiListWithTranslations]
                        ]) => (
                          <SelectItem key={key} value={key}>
                            {rasi.tanglish} ({rasi.english})
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  {field.state.meta.touchedErrors ? (
                    <em className="text-xs text-destructive">
                      {field.state.meta.touchedErrors.join(", ")}
                    </em>
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field
              name="star"
              validators={{
                onChange: ProfileFormSchema.shape.star,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Star</Label>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    required
                    onValueChange={(value) => {
                      field.handleChange(value);
                    }}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Birth Star" />
                    </SelectTrigger>
                    <SelectContent>
                      {star.map((star) => (
                        <SelectItem key={star.english} value={star.english}>
                          {star.english}{" "}
                          <span className="text-xs text-muted-foreground">
                            ({star.score})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.touchedErrors ? (
                    <em className="text-xs text-destructive">
                      {field.state.meta.touchedErrors.join(", ")}
                    </em>
                  ) : null}
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="age"
              validators={{
                onChange: ProfileFormSchema.shape.age,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Age</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""} // Handle undefined for controlled input
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const parsedValue = parseInt(rawValue, 10);
                      let valueToSet = 0;
                      if (rawValue !== "") {
                        valueToSet = isNaN(parsedValue)
                          ? field.state.value
                          : parsedValue;
                      }
                      field.handleChange(valueToSet);
                    }}
                    type="number"
                    placeholder="Age"
                    required
                    min="18"
                  />
                  {field.state.meta.touchedErrors ? (
                    <em className="text-xs text-destructive">
                      {field.state.meta.touchedErrors.join(", ")}
                    </em>
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field
              name="starMatchScore"
              validators={{
                onChange: ProfileFormSchema.shape.starMatchScore,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Star Match Score (0-10)</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""} // Handle undefined
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const parsedValue = parseFloat(rawValue);
                      let valueToSet = 0;

                      if (rawValue !== "") {
                        valueToSet = isNaN(parsedValue)
                          ? field.state.value
                          : parsedValue;
                      }

                      field.handleChange(valueToSet);
                    }}
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="e.g., 8"
                    required
                  />
                  {field.state.meta.touchedErrors ? (
                    <em className="text-xs text-destructive">
                      {field.state.meta.touchedErrors.join(", ")}
                    </em>
                  ) : null}
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="state"
              validators={{
                onChange: ProfileFormSchema.shape.state,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>State</Label>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    required
                    onValueChange={(value) => {
                      field.handleChange(value);
                      setSelectedState(value);
                      // Clear city when state changes
                      form.setFieldValue("city", "");
                    }}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {StateList.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.touchedErrors ? (
                    <em className="text-xs text-destructive">
                      {field.state.meta.touchedErrors.join(", ")}
                    </em>
                  ) : null}
                </div>
              )}
            </form.Field>
            <form.Field
              name="city"
              validators={{
                onChange: ProfileFormSchema.shape.city,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>City</Label>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    required
                    disabled={!selectedState}
                    onValueChange={(value) => {
                      field.handleChange(value);
                    }}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue
                        placeholder={
                          selectedState ? "Select city" : "Select state first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedState &&
                        DistrictList[
                          selectedState as keyof typeof DistrictList
                        ]?.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.touchedErrors ? (
                    <em className="text-xs text-destructive">
                      {field.state.meta.touchedErrors.join(", ")}
                    </em>
                  ) : null}
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="statusId"
              validators={{
                onChange: ProfileFormSchema.shape.statusId,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Status</Label>
                  <Select
                    value={field.state.value ?? ""}
                    onValueChange={(value) => {
                      console.log(`Status changed to value: ${value}`);
                      field.handleChange(value);
                    }}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses && statuses.length > 0 ? (
                        statuses.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-statuses" disabled>
                          No statuses available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {field.state.meta.touchedErrors ? (
                    <em className="text-xs text-destructive">
                      {field.state.meta.touchedErrors.join(", ")}
                    </em>
                  ) : null}
                  {/* Debugging: Show current field value */}
                  {/* <p className="text-xs mt-1">Current statusId value: {field.state.value || 'undefined'}</p> */}
                </div>
              )}
            </form.Field>

            <form.Field
              name="matrimonyId"
              validators={{
                onChange: ProfileFormSchema.shape.matrimonyId,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Matrimony ID</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    placeholder="Matrimony Site Profile ID"
                    required
                  />
                  {field.state.meta.touchedErrors ? (
                    <em className="text-xs text-destructive">
                      {field.state.meta.touchedErrors.join(", ")}
                    </em>
                  ) : null}
                </div>
              )}
            </form.Field>
          </div>

          <form.Field
            name="comments"
            validators={{
              onChange: ProfileFormSchema.shape.comments,
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Comments</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ""} // Handle potentially undefined value
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                  placeholder="Any additional notes or comments"
                />
                {field.state.meta.touchedErrors ? (
                  <em className="text-xs text-destructive">
                    {field.state.meta.touchedErrors.join(", ")}
                  </em>
                ) : null}
              </div>
            )}
          </form.Field>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, formIsSubmitting]) => {
              const actualIsSubmitting = formIsSubmitting || isSubmitting;
              return (
                <Button
                  type="submit"
                  disabled={!canSubmit || actualIsSubmitting}
                >
                  {actualIsSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {profile ? "Update Profile" : "Add Profile"}
                </Button>
              );
            }}
          </form.Subscribe>
        </CardFooter>
      </form>
    </Card>
  );
}
