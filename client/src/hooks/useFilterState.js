import { useState, useCallback } from "react";

/**
 * Custom hook for managing filter state with localStorage persistence.
 * Mirrors usePaginationState pattern for consistency.
 *
 * @param {string} pageKey - Unique key for this page (e.g., 'ne-restore-job-management')
 * @param {Object} defaultFilters - Default filter values
 * @returns {Object} { filters, setFilters, clearFilters }
 */
export const useFilterState = (pageKey, defaultFilters = {}) => {
  const storageKey = `filters_${pageKey}`;

  const getInitialState = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return { ...defaultFilters, ...JSON.parse(stored) };
      }
    } catch (error) {}
    return { ...defaultFilters };
  };

  const [filters, setFiltersState] = useState(getInitialState());

  const setFilters = useCallback(
    (updater) => {
      setFiltersState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (error) {}
        return next;
      });
    },
    [storageKey],
  );

  const clearFilters = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {}
    setFiltersState({ ...defaultFilters });
  }, [storageKey, defaultFilters]);

  return { filters, setFilters, clearFilters };
};
