import { useState, useCallback } from "react";

/**
 * Custom hook for managing pagination state with localStorage persistence
 * Both page number and rows per page are saved and restored across navigation
 *
 * @param {string} pageKey - Unique key for this page (e.g., 'backup-scheduler', 'schedule-details')
 * @param {number} defaultSize - Default rows per page (e.g., 10 or 5)
 * @returns {Object} { page, rowsPerPage, setPage, setRowsPerPage }
 */
export const usePaginationState = (pageKey, defaultSize = 10) => {
  const getInitialState = () => {
    try {
      const stored = localStorage.getItem(`pagination_${pageKey}`);
      if (stored) {
        const { page, rowsPerPage } = JSON.parse(stored);
        return {
          page: page || 1,
          rowsPerPage: rowsPerPage || defaultSize,
        };
      }
    } catch (error) {}
    return { page: 1, rowsPerPage: defaultSize };
  };

  const [state, setState] = useState(getInitialState());

  const setPage = useCallback(
    (newPage) => {
      setState((prevState) => {
        const newState = {
          ...prevState,
          page: newPage,
        };

        // Persist to localStorage
        try {
          localStorage.setItem(
            `pagination_${pageKey}`,
            JSON.stringify({
              page: newPage,
              rowsPerPage: prevState.rowsPerPage,
            }),
          );
        } catch (error) {}

        return newState;
      });
    },
    [pageKey],
  );

  const setRowsPerPage = useCallback(
    (newSize) => {
      setState((prevState) => {
        const newState = {
          page: 1,
          rowsPerPage: newSize,
        };

        try {
          localStorage.setItem(
            `pagination_${pageKey}`,
            JSON.stringify({ page: 1, rowsPerPage: newSize }),
          );
        } catch (error) {}

        return newState;
      });
    },
    [pageKey],
  );

  return {
    page: state.page,
    rowsPerPage: state.rowsPerPage,
    setPage,
    setRowsPerPage,
  };
};
