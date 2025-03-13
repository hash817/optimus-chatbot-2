"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useContext, useEffect, useState } from "react"
import { UiContext } from "@/store/ui-context"
import { createClient } from "@/utils/supabase/client"
import { SourceDisplay } from "./SourceDisplay"

interface Source {
  title: string
  url: string
}

interface SourceSidebarProps {
  sources: Source[]
  onClose: () => void
}

const supabase = createClient()

export default function SourceSidebar() {
  const uiContext = useContext(UiContext);

  if (!uiContext) {
    return <p>Something went wrong!!!</p>
  }
  const { selectedMessageId, setSelectedMessageId } = uiContext
  const [loading, setLoading] = useState(false)
  const [sources, setSources] = useState([])

  useEffect(() => {
    if (selectedMessageId) {
      const fetchSources = async () => {
        setLoading(true)
        const { data, error } = await supabase
          .from("Message")
          .select("sources")
          .eq("id", selectedMessageId)

        if (error) {
          return
        }

        if (data && data[0]['sources']) {
          setSources(data[0]['sources']['documents_l'])
        } else {
          setSources([])
        }

        setLoading(false)
      }

      fetchSources()
    }
  }, [selectedMessageId])

  return (
    <>
      {selectedMessageId && (
        <div className="fixed right-0 top-0 h-full w-64 bg-background border-l border-border p-4 overflow-y-auto shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Sources</h2>
            <Button variant="ghost" size="sm" onClick={() => setSelectedMessageId(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {sources.length > 0 && sources.map((s, i) => (
            <SourceDisplay source={s} key={i} />
          ))}
          {sources.length == 0 && <p className="text-muted-foreground">No sources available for this message.</p>}
        </div>
      )}
    </>

  );
}

