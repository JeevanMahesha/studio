// Profile filters storage keys
export const STORAGE_KEYS = {
  SEARCH_TERM: "studio_profile_search_term",
  STATUS_FILTER: "studio_profile_status_filter",
  CURRENT_PAGE: "studio_profile_current_page",
  SORT_BY: "studio_profile_sort_by",
};

// Status IDs
export const PROFILE_STATUS_IDS = {
  NEW: "1",
  CONTACTED: "2",
  MEETING_SCHEDULED: "3",
  REJECTED: "4",
  ACCEPTED: "5",
  ON_HOLD: "6",
  PROFILE_SHARED: "7",
};

// Type definition for profile filter state
export interface ProfileFilterState {
  searchTerm: string;
  statusFilter: string | null;
  currentPage: number;
  sortBy: string;
}

// Default filter state
export const DEFAULT_FILTER_STATE: ProfileFilterState = {
  searchTerm: "",
  statusFilter: null,
  currentPage: 1,
  sortBy: "updatedAt",
};

// Get profile filters from localStorage
export function getProfileFilters(): ProfileFilterState {
  if (typeof window === "undefined") {
    return DEFAULT_FILTER_STATE;
  }

  try {
    return {
      searchTerm: localStorage.getItem(STORAGE_KEYS.SEARCH_TERM) || "",
      statusFilter: localStorage.getItem(STORAGE_KEYS.STATUS_FILTER),
      currentPage: Number(localStorage.getItem(STORAGE_KEYS.CURRENT_PAGE)) || 1,
      sortBy: localStorage.getItem(STORAGE_KEYS.SORT_BY) || "updatedAt",
    };
  } catch (error) {
    console.error("Error reading filters from localStorage:", error);
    return DEFAULT_FILTER_STATE;
  }
}

// Save profile filters to localStorage
export function saveProfileFilters(
  filters: Partial<ProfileFilterState>
): ProfileFilterState {
  if (typeof window === "undefined") {
    return DEFAULT_FILTER_STATE;
  }

  const currentFilters = getProfileFilters();
  const updatedFilters = { ...currentFilters, ...filters };

  try {
    if (filters.searchTerm !== undefined) {
      localStorage.setItem(STORAGE_KEYS.SEARCH_TERM, filters.searchTerm);
    }

    if (filters.statusFilter !== undefined) {
      if (filters.statusFilter === null) {
        localStorage.removeItem(STORAGE_KEYS.STATUS_FILTER);
      } else {
        localStorage.setItem(STORAGE_KEYS.STATUS_FILTER, filters.statusFilter);
      }
    }

    if (filters.currentPage !== undefined) {
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_PAGE,
        filters.currentPage.toString()
      );
    }

    if (filters.sortBy !== undefined) {
      localStorage.setItem(STORAGE_KEYS.SORT_BY, filters.sortBy);
    }

    return updatedFilters;
  } catch (error) {
    console.error("Error saving filters to localStorage:", error);
    return currentFilters;
  }
}

// Clear all profile filters
export function clearProfileFilters(): ProfileFilterState {
  if (typeof window === "undefined") {
    return DEFAULT_FILTER_STATE;
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.SEARCH_TERM);
    localStorage.removeItem(STORAGE_KEYS.STATUS_FILTER);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PAGE);
    localStorage.removeItem(STORAGE_KEYS.SORT_BY);
  } catch (error) {
    console.error("Error clearing filters from localStorage:", error);
  }

  return DEFAULT_FILTER_STATE;
}
