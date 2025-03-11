"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  searchResults: any; // Store the full search results
  onPageChange: (page: number) => void; // Callback for page changes
}

export function PaginationControls({ 
  currentPage, 
  totalPages,
  searchResults,
  onPageChange
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Create a memoized function to update the URL without triggering a new fetch
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handlePageChange = (page: number) => {
    // Update URL without causing a full page reload
    router.push(`${pathname}?${createQueryString('page', page.toString())}`, { 
      scroll: false 
    });
    
    // Notify parent component about page change to update displayed results
    onPageChange(page);
  };

  // Function to generate page numbers array
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Add current page and pages around it
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 2 && currentPage > 3) {
        // Add ellipsis if there's a gap
        pageNumbers.push("ellipsis-start");
      }
      
      if (!pageNumbers.includes(i)) {
        pageNumbers.push(i);
      }
    }
    
    // Add ellipsis before last page if needed
    if (currentPage < totalPages - 2 && totalPages > 3) {
      pageNumbers.push("ellipsis-end");
    }
    
    // Always show last page if we have more than 1 page
    if (totalPages > 1 && !pageNumbers.includes(totalPages)) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous button */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              if (currentPage > 1) {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }
            }}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {/* Page numbers */}
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === "ellipsis-start" || pageNum === "ellipsis-end") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={pageNum}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(pageNum);
                }}
                isActive={pageNum === currentPage}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Next button */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              if (currentPage < totalPages) {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }
            }}
            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}     