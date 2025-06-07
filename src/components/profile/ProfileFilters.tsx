"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clearProfileFilters } from "@/lib/filterUtils";
import { ProfileStatus } from "@/types/profile";
import { FilterX } from "lucide-react";
import * as React from "react";

interface ProfileFiltersProps {
  onSearchChange: (searchTerm: string) => void;
  onStatusChange: (statusId: string | null) => void;
  statuses: ProfileStatus[];
  initialSearchTerm?: string;
  initialStatus?: string | null;
}

export function ProfileFilters({
  onSearchChange,
  onStatusChange,
  statuses,
  initialSearchTerm = "",
  initialStatus = null,
}: Readonly<ProfileFiltersProps>) {
  const [searchTerm, setSearchTerm] = React.useState(initialSearchTerm);
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(
    initialStatus
  );

  // Update local state when initial values change (synced with localStorage)
  React.useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  React.useEffect(() => {
    setSelectedStatus(initialStatus);
  }, [initialStatus]);

  const handleSearchTermChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    onSearchChange(newSearchTerm);
  };

  const handleStatusChange = (value: string) => {
    let newStatus: string | null = null;

    if (value === "all") {
      // Show all active profiles (excluding rejected)
      newStatus = null;
    } else if (value === "include-all") {
      // Special value to indicate we want to include rejected profiles
      newStatus = "include-all";
    } else {
      // Specific status filter
      newStatus = value;
    }

    setSelectedStatus(newStatus);
    onStatusChange(newStatus);
  };

  const clearFilters = () => {
    // Clear localStorage filters
    clearProfileFilters();

    // Update component state
    setSearchTerm("");
    setSelectedStatus(null);

    // Notify parent components
    onSearchChange("");
    onStatusChange(null);
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-card space-y-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        {/* Search Input */}
        <div>
          <Label htmlFor="searchName">Search by Name</Label>
          <Input
            id="searchName"
            placeholder="Search name..."
            value={searchTerm}
            onChange={handleSearchTermChange}
          />
        </div>

        {/* Status Filter */}
        <div>
          <Label htmlFor="statusFilter">Filter by Status</Label>
          <Select
            value={selectedStatus === null ? "all" : selectedStatus}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger id="statusFilter">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Active Profiles</SelectItem>
              <SelectItem value="include-all">
                All Profiles (Including Rejected)
              </SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <Button variant="ghost" onClick={clearFilters} size="sm">
          <FilterX className="mr-2 h-4 w-4" /> Clear Filters
        </Button>
      </div>
    </div>
  );
}
