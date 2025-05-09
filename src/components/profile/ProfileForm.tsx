"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Loader2, Plus, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the schema specifically for the form (excluding server-generated fields like id, createdAt, updatedAt)
const ProfileFormSchema = ProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

interface ProfileFormProps {
  readonly profile?: Profile;
  readonly statuses: ProfileStatus[];
  readonly onSubmit: (data: ProfileFormValues) => Promise<void>;
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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      name: profile?.name ?? "",
      raise: profile?.raise ?? "",
      age: profile?.age ?? 0,
      star: profile?.star ?? "",
      city: profile?.city ?? "",
      state: profile?.state ?? "",
      starMatchScore: profile?.starMatchScore ?? 0,
      mobileNumber: profile?.mobileNumber ?? "",
      profileStatusId: profile?.profileStatusId ?? "1",
      matrimonyId: profile?.matrimonyId ?? "",
      comments: profile?.comments ?? [],
    },
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{profile ? "Edit Profile" : "Add New Profile"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Full Name" required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="+91XXXXXXXXXX"
                      type="tel"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="raise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raise</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Raise" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(rasiListWithTranslations).map(
                            ([key, rasi]) => (
                              <SelectItem key={key} value={key}>
                                {rasi.tanglish} ({rasi.english})
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="star"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Star</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Find the selected star and update the starMatchScore
                          const selectedStar = star.find(
                            (s) => s.english === value
                          );
                          if (selectedStar) {
                            form.setValue("starMatchScore", selectedStar.score);
                          }
                        }}
                        defaultValue={field.value}
                        required
                      >
                        <SelectTrigger>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Age"
                        required
                        min="18"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="starMatchScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Star Match Score (0-10)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        placeholder="Auto-calculated from star"
                        className="font-bold text-lg bg-muted/50 text-black"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedState(value);
                          form.setValue("city", "");
                        }}
                        defaultValue={field.value}
                        required
                      >
                        <SelectTrigger>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        required
                        disabled={!selectedState}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              selectedState
                                ? "Select city"
                                : "Select state first"
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="profileStatusId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Status</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select profile status" />
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
                            No profile statuses available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="matrimonyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrimony ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Matrimony Site Profile ID"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {(field.value || []).map(
                        (comment: string, index: number) => (
                          <div key={index} className="flex gap-2 items-start">
                            <Textarea
                              value={comment}
                              onChange={(e) => {
                                const newComments = [...(field.value || [])];
                                newComments[index] = e.target.value;
                                field.onChange(newComments);
                              }}
                              placeholder="Enter comment"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newComments = [...(field.value || [])];
                                newComments.splice(index, 1);
                                field.onChange(newComments);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newComments = [...(field.value || []), ""];
                      field.onChange(newComments);
                    }}
                    className="w-full mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {profile ? "Update Profile" : "Add Profile"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
