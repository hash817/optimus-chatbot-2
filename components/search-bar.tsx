'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SearchBar() {
  return (
    <div className="flex items-center space-x-2 pb-5">
      <Input name='query' type="text" className="px-3 py-2 w-80" placeholder="Search..." />
      <Button className="px-3 py-2">Search</Button>
    </div>
  )
}