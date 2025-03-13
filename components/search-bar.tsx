'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

interface SearchBarProps {
  loading?: boolean;
}

export function SearchBar({ loading = false }: SearchBarProps) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get the query from URL parameters when component mounts or params change
  useEffect(() => {
    const query = searchParams.get('query') || '';
    setSearchQuery(query);
  }, [searchParams]);

  return (
    <div className="flex space-x-2 w-full pb-5">
      <Input 
        name='query' 
        type="text" 
        className="px-3 py-2 flex-grow" 
        placeholder="Search..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={loading}
      />
      <Button 
        className="px-3 py-2" 
        type="submit"
        disabled={loading}
      >
        {loading ? 'Searching...' : 'Search'}
      </Button>
    </div>
  )
}