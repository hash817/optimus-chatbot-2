"use client"

import { SearchBar } from "@/components/search-bar";
import { search, performSearch } from "./action";
import { JudgmentCard } from "@/components/judgment-card";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { PaginationControls } from "@/components/pagination-controls";
import { useSearchParams } from "next/navigation";

interface SearchProps {
  searchParams: { [key: string]: string | undefined };
}

interface Judgment {
  id: number;
  title: string;
  paragraph_summary: string;
  original_url: string;
  judgment_date: string;
  court: string;
  keyword: string;
}

export default function Search() {
  const [judgments, setJudgments] = useState<Judgment[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 10;
  const searchQuery = searchParams.get("query") || "";

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createClient();
      
      if (searchQuery) {
        try {
          const searchResults = await performSearch(searchQuery, page, pageSize);
          setJudgments(searchResults.data);
          setTotalPages(Math.ceil(searchResults.totalCount / pageSize));
        } catch (error) {
          console.error('Error performing search:', error);
          setJudgments([]);
          setTotalPages(0);
        }
      } else {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        try {
          let count = 0;
          if (page === 1) {
            const { count: totalCount, error: countError } = await supabase
              .from('judgments')
              .select('*', { count: 'exact', head: true });
              
            if (countError) throw countError;
            count = totalCount || 0;
            
            if (count > 0) {
              localStorage.setItem('judgments-total-count', count.toString());
            }
          } else {
            const savedCount = localStorage.getItem('judgments-total-count');
            count = savedCount ? parseInt(savedCount) : 0;
          }

          const { data, error } = await supabase
            .from('judgments')
            .select('*')
            .order('judgment_date', { ascending: false })
            .range(from, to);

          if (error) throw error;
          
          setJudgments(data || []);
          setTotalPages(Math.ceil(count / pageSize));
        } catch (error) {
          console.error('Error fetching judgments:', error);
          setJudgments([]);
          setTotalPages(0);
        }
      }
      
      setLoading(false);
    }

    fetchData();
  }, [page, searchQuery, pageSize]);

  return (
    <>
      <form action={search}>
        <SearchBar loading={loading} />
      </form>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="loader">Loading...</div>
        </div>
      ) : judgments.length > 0 ? (
        <>
          {judgments.map((item) => (
            <JudgmentCard
              id={item.id}
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
      ) : (
        <div className="text-center my-8">No results found</div>
      )}
    </>
  );
}