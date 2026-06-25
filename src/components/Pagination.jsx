/**
 * Pagination component.
 *
 * Props:
 *   currentPage  – 1-indexed current page
 *   totalPages   – total number of pages
 *   onPageChange – callback(pageNumber)
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const range = 2; // pages around current

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - range && i <= currentPage + range)
    ) {
      pages.push(i);
    } else if (
      i === currentPage - range - 1 ||
      i === currentPage + range + 1
    ) {
      pages.push("...");
    }
  }

  // Deduplicate consecutive ellipses
  const dedupedPages = pages.filter((p, idx) => !(p === "..." && pages[idx - 1] === "..."));

  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ‹
      </button>

      {dedupedPages.map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} style={{ color: "var(--text-muted)", padding: "0 4px" }}>…</span>
        ) : (
          <button
            key={page}
            className={`page-btn ${page === currentPage ? "active" : ""}`}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        className="page-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;
