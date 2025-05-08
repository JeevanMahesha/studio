// src/components/profile/ProfileFilters.tsx
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FilterX } from "lucide-react";

interface ProfileFiltersProps {
  onSearchChange: (searchTerm: string) => void;
}

export function ProfileFilters({ onSearchChange }: ProfileFiltersProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleSearchTermChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    onSearchChange(newSearchTerm);
  };

  const clearFilters = () => {
    setSearchTerm("");
    onSearchChange("");
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-card space-y-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 items-end">
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
      </div>
      <div className="flex justify-end mt-4">
        <Button variant="ghost" onClick={clearFilters} size="sm">
          <FilterX className="mr-2 h-4 w-4" /> Clear Search
        </Button>
      </div>
    </div>
  );
}
