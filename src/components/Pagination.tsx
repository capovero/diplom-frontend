import React from 'react';
import { Pagination as BSPagination } from 'react-bootstrap';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
                                                          currentPage,
                                                          totalPages,
                                                          onPageChange,
                                                      }) => {
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    return (
        <BSPagination className="justify-content-center">
            <BSPagination.First
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
            />
            <BSPagination.Prev
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            />

            {getPageNumbers().map((page, index) => (
                typeof page === 'number' ? (
                    <BSPagination.Item
                        key={index}
                        active={page === currentPage}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </BSPagination.Item>
                ) : (
                    <BSPagination.Ellipsis key={index} />
                )
            ))}

            <BSPagination.Next
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            />
            <BSPagination.Last
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
            />
        </BSPagination>
    );
};