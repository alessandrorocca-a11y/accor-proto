export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav className="ads-pagination" aria-label="Pagination">
      <button
        type="button"
        className="ads-pagination-btn"
        disabled={!prev}
        onClick={() => prev != null && onPageChange(prev)}
        aria-label="Previous page"
      >
        ‹
      </button>
      <span className="ads-pagination-info">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        className="ads-pagination-btn"
        disabled={!next}
        onClick={() => next != null && onPageChange(next)}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}
