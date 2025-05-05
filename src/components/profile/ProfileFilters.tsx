// src/components/profile/ProfileFilters.tsx
'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { ProfileStatus } from '@/types/profile';
import { FilterX } from 'lucide-react';

interface ProfileFiltersProps {
  statuses: ProfileStatus[];
  initialFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onSearchChange: (searchTerm: string) => void;
}

export function ProfileFilters({
  statuses,
  initialFilters,
  onFilterChange,
  onSearchChange,
}: ProfileFiltersProps) {
  // Remove _profilesForOptions from initial state if it exists
  const { _profilesForOptions, ...relevantInitialFilters } = initialFilters;
  const [filters, setFilters] = React.useState(relevantInitialFilters);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleFilterChange = (key: string, value: string | undefined) => {
     // Treat the placeholder value (if somehow selected, though unlikely) or empty string as clearing the filter
    const actualValue = value === '' ? undefined : value;
    const newFilters = { ...filters, [key]: actualValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

   const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);
        onSearchChange(newSearchTerm);
   };

  const clearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    setSearchTerm('');
    onFilterChange(clearedFilters);
    onSearchChange('');
  };

  // Extract unique values for dropdowns (can be optimized for large datasets)
  // In a real app, these might come from the backend or be pre-calculated
  // Use the passed _profilesForOptions for deriving options
  const uniqueCities = React.useMemo(() => Array.from(new Set(_profilesForOptions?.map((p: any) => p.city) ?? [])).filter(Boolean), [_profilesForOptions]);
  const uniqueStates = React.useMemo(() => Array.from(new Set(_profilesForOptions?.map((p: any) => p.state) ?? [])).filter(Boolean), [_profilesForOptions]);
  const uniqueStars = React.useMemo(() => Array.from(new Set(_profilesForOptions?.map((p: any) => p.star) ?? [])).filter(Boolean), [_profilesForOptions]);
  const uniqueCasteRaises = React.useMemo(() => Array.from(new Set(_profilesForOptions?.map((p: any) => p.casteRaise) ?? [])).filter(Boolean), [_profilesForOptions]);


  return (
    <div className="mb-6 p-4 border rounded-lg bg-card space-y-4 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
        {/* Search Input */}
        <div className="col-span-full sm:col-span-1">
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
          <Label htmlFor="filterStatus">Status</Label>
          <Select
            value={filters.statusId} // Bind directly, undefined will show placeholder
            onValueChange={(value) => handleFilterChange('statusId', value)}
          >
            <SelectTrigger id="filterStatus">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {/* Removed: <SelectItem value="">All Statuses</SelectItem> */}
              {statuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Filter */}
        <div>
          <Label htmlFor="filterCity">City</Label>
           <Select
             value={filters.city}
             onValueChange={(value) => handleFilterChange('city', value)}
           >
             <SelectTrigger id="filterCity">
               <SelectValue placeholder="All Cities" />
             </SelectTrigger>
             <SelectContent>
                {/* Removed: <SelectItem value="">All Cities</SelectItem> */}
                {uniqueCities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
             </SelectContent>
           </Select>
        </div>

        {/* State Filter */}
        <div>
          <Label htmlFor="filterState">State</Label>
           <Select
             value={filters.state}
             onValueChange={(value) => handleFilterChange('state', value)}
           >
             <SelectTrigger id="filterState">
               <SelectValue placeholder="All States" />
             </SelectTrigger>
             <SelectContent>
                 {/* Removed: <SelectItem value="">All States</SelectItem> */}
                {uniqueStates.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
             </SelectContent>
           </Select>
        </div>

        {/* Star Filter */}
        <div>
          <Label htmlFor="filterStar">Star</Label>
           <Select
             value={filters.star}
             onValueChange={(value) => handleFilterChange('star', value)}
           >
             <SelectTrigger id="filterStar">
               <SelectValue placeholder="All Stars" />
             </SelectTrigger>
             <SelectContent>
                {/* Removed: <SelectItem value="">All Stars</SelectItem> */}
                {uniqueStars.map((star) => (
                    <SelectItem key={star} value={star}>{star}</SelectItem>
                ))}
             </SelectContent>
           </Select>
        </div>

         {/* Caste/Raise Filter */}
         <div>
           <Label htmlFor="filterCasteRaise">Caste/Raise</Label>
            <Select
              value={filters.casteRaise}
              onValueChange={(value) => handleFilterChange('casteRaise', value)}
            >
              <SelectTrigger id="filterCasteRaise">
                <SelectValue placeholder="All Castes/Raises" />
              </SelectTrigger>
              <SelectContent>
                 {/* Removed: <SelectItem value="">All Castes/Raises</SelectItem> */}
                 {uniqueCasteRaises.map((caste) => (
                     <SelectItem key={caste} value={caste}>{caste}</SelectItem>
                 ))}
              </SelectContent>
            </Select>
         </div>

        {/* Age Filter (Simple Input for now, range slider could be better) */}
        {/* <div>
          <Label htmlFor="filterAge">Age</Label>
          <Input
            id="filterAge"
            type="number"
            placeholder="Age"
            value={filters.age ?? ''}
            onChange={(e) => handleFilterChange('age', e.target.value === '' ? undefined : parseInt(e.target.value))}
          />
        </div> */}

        {/* Star Match Score Filter (Simple Input) */}
         {/* <div>
           <Label htmlFor="filterScore">Min Star Score</Label>
           <Input
             id="filterScore"
             type="number"
             placeholder="e.g., 7"
              min="0" max="10" step="0.1"
             value={filters.starMatchScore ?? ''}
             onChange={(e) => handleFilterChange('starMatchScore', e.target.value === '' ? undefined : parseFloat(e.target.value))}
           />
         </div> */}


      </div>
       <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={clearFilters} size="sm">
            <FilterX className="mr-2 h-4 w-4" /> Clear All Filters
          </Button>
        </div>
    </div>
  );
}
