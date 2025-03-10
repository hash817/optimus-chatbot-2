interface SourceDisplayProps {
    source: {
        act: string
        part_id: string
        part_title: string
        title: string
        content: string
    }
}

export function SourceDisplay({ source }: SourceDisplayProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-primary">{source.act}</h3>
                <p className="text-sm text-muted-foreground">
                    {source.part_id} - {source.part_title}
                </p>
            </div>
            <div className="border-b border-border pb-4">
                <h4 className="text-lg font-medium text-primary">{source.title}</h4>
                <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{source.content}</p>
            </div>
        </div>
    )
}

