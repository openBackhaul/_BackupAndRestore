import React from "react";

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  className = "",
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      pageNumbers.push(i);
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      pageNumbers.push("...");
    }
  }

  const uniquePageNumbers = pageNumbers.filter((item, pos, self) => {
    return item !== "..." || self[pos - 1] !== "...";
  });

  return (
    <div
      className={`d-flex align-items-center justify-content-between px-2 ${className}`}
    >
      <div className="d-flex align-items-center">
        <span className="text-muted small me-2">Rows per page:</span>
        <select
          className="form-select form-select-sm"
          style={{ width: "auto", minWidth: "70px", fontSize: "0.9rem", padding: "4px 8px" }}
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="text-muted small">
        {totalItems === 0
          ? "0 items"
          : `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
              currentPage * itemsPerPage,
              totalItems
            )} of ${totalItems}`}
      </div>

      <nav aria-label="Page navigation">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              aria-label="Previous"
            >
              <span aria-hidden="true">&lsaquo;</span>
            </button>
          </li>

          {uniquePageNumbers.map((p, index) => (
            <li
              key={index}
              className={`page-item ${p === currentPage ? "active" : ""} ${
                p === "..." ? "disabled" : ""
              }`}
            >
              <button
                type="button"
                className="page-link"
                onClick={() => p !== "..." && handlePageChange(p)}
                style={p === currentPage ? { backgroundColor: '#0067FF', borderColor: '#0067FF', color: '#FFFFFF' } : {}}
              >
                {p}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              type="button"
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              aria-label="Next"
            >
              <span aria-hidden="true">&rsaquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
