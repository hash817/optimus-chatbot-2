import Link from "next/link";

interface JudgmentCardProps {
  title: string
  paragraph_summary: string,
  original_url: string,
  court: string,
  judgment_date: string
  keyword: string
  id: number
  citations: string
}

export function JudgmentCard({ title, paragraph_summary, original_url, court, judgment_date, keyword, id, citations }: JudgmentCardProps) {
  return (
    <div className="p-4 mb-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold text-gray-800">
        <Link href={`/search/${id}`}>{title}</Link>
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        {paragraph_summary}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        <strong>Date:</strong> {judgment_date}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        <strong>Court:</strong> {court}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        <strong>Keywords:</strong> {keyword}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        <strong>Citations:</strong> {citations}
      </p>
    </div>
  );
}
