import { createClient } from '@/utils/supabase/server';
import ReactMarkdown from "react-markdown";

export default async function JudgementPage({ params }: { params: { jId: number } }) {
  const supabase = await createClient()
  const { data } = await supabase.from('judgments').select().eq('id', params.jId)
  let content = <p className='text-center text-lg font-semibold text-gray-500 p-4 bg-gray-100 border border-gray-300 rounded-md shadow-md'>
    No summary found !!!
  </p>;
  const original_url = data![0].original_url;
  if (data && data[0].full_summary) {
    content = <ReactMarkdown>{data[0].full_summary || ''}</ReactMarkdown>
  }
  return (
    <div style={{ whiteSpace: 'pre-line', paddingBottom:'2rem' }}>
      {original_url && (
        <div className="text-center pb-5">
          <a
            href={original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium underline"
          >
            View Original Judgment
          </a>
        </div>
      )}
      {content}
    </div>
  );
}
