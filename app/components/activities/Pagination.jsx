'use client';

import styles from './Pagination.module.css';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${styles.prevButton}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← Previous
      </button>
      
      <div className={styles.pages}>
        {!pageNumbers.includes(1) && (
          <>
            <button
              className={`${styles.pageButton} ${currentPage === 1 ? styles.active : ''}`}
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            {!pageNumbers.includes(2) && <span className={styles.ellipsis}>...</span>}
          </>
        )}
        
        {pageNumbers.map(page => (
          <button
            key={page}
            className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        
        {!pageNumbers.includes(totalPages) && (
          <>
            {!pageNumbers.includes(totalPages - 1) && <span className={styles.ellipsis}>...</span>}
            <button
              className={`${styles.pageButton} ${currentPage === totalPages ? styles.active : ''}`}
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      
      <button
        className={`${styles.button} ${styles.nextButton}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next →
      </button>
    </div>
  );
}