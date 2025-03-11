import { SearchBar } from "@/components/search-bar";
import { search, performSearch } from "./action";
import { JudgmentCard } from "@/components/judgment-card";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/server";
import { PaginationControls } from "@/components/pagination-controls";

export default async function Search({ searchParams }) {
  const supabase = await createClient();
  const page = parseInt(searchParams.page || '1');
  const pageSize = 10;
  const searchQuery = searchParams.query || '';

  let judgments = [];
  let totalPages = 0;

  if (searchQuery) {
    // Use the search action if there's a query
    const searchResults = await performSearch(searchQuery, page, pageSize);
    judgments = searchResults.data;
    totalPages = Math.ceil(searchResults.totalCount / pageSize);
  } else {
    // Just get regular paginated data if no search query
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data: judgmentData, count, error } = await supabase
      .from('judgments')
      .select('*', { count: 'exact' })
      .order('judgment_date', { ascending: false })
      .range(from, to);
      
    if (error) {
      console.error('Error fetching data:', error);
      return <div>Error loading judgments</div>;
    }
    
    judgments = judgmentData || [];
    totalPages = Math.ceil((count || 0) / pageSize);
  }

  return (
    <>
      <form action={search}>
        <SearchBar />
      </form>
      {judgments && judgments.map((item, index) => (
        <JudgmentCard
          key={item.id}
          title={item.title}
          paragraph_summary={item.paragraph_summary}
          original_url={item.original_url}
          judgment_date={item.judgment_date}
          court={item.court}
          keyword={item.keyword}
        />
      ))}
      <PaginationControls 
        currentPage={page} 
        totalPages={totalPages} 
      />
    </>
  );
}
