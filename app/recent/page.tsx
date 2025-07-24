// app/recent/page.tsx  – Server Component
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

const PAGE_SIZE = 20;

// Define the expected shape of your database row
interface LogRow {
  public_id: string;
  created_at: string;
  language: string;
  ingredients: string[];
  response: string;
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RecentPage({ searchParams }: PageProps) {
  // 1. Await searchParams (Next.js 15 requirement)
  const resolvedSearchParams = await searchParams;
  
  // 2. Pagination
  const rawPage = Array.isArray(resolvedSearchParams.page)
    ? resolvedSearchParams.page[0]
    : resolvedSearchParams.page;
  const page = Math.max(0, Number(rawPage) || 0);

  // 3. Create Supabase client directly (bypassing cookie parsing issues)
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 4. Query your *view* (the view keeps RLS simple)
  const { data = [], error, count } = await supabase
    .from('public_llm_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (error) {
    console.error('Database error:', error);
    throw new Error(`Failed to fetch data: ${error.message}`);
  }

  // Type assertion with runtime check
  const typedData = (data || []) as LogRow[];

  // 5. Render
  return (
    <main className="p-6 mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">
        Latest AI‑Generated Recipes with Fridge Ingredients
      </h1>

      {typedData.length === 0 ? (
        <p className="text-gray-500">No recipes found.</p>
      ) : (
        <ul className="space-y-6">
          {typedData.map((row) => (
            <li key={row.public_id} className="border rounded-xl p-4 shadow">
              <time className="text-sm opacity-70">
                {new Date(row.created_at).toLocaleString()}
              </time>

              <p className="mt-1 font-mono text-sm">{row.language}</p>
              <p className="mt-1 font-mono text-sm">
                {Array.isArray(row.ingredients) 
                  ? row.ingredients.join(', ') 
                  : 'No ingredients listed'}
              </p>

              <pre className="mt-2 whitespace-pre-wrap">{row.response}</pre>
            </li>
          ))}
        </ul>
      )}

      {/* Simple pagination */}
      <nav className="mt-8 flex gap-4" role="navigation" aria-label="Pagination">
        {page > 0 && (
          <a 
            href={`/recent?page=${page - 1}`} 
            className="underline hover:no-underline"
            aria-label="Go to newer posts"
          >
            ← Newer
          </a>
        )}
        {(page + 1) * PAGE_SIZE < (count ?? 0) && (
          <a 
            href={`/recent?page=${page + 1}`} 
            className="underline hover:no-underline ml-auto"
            aria-label="Go to older posts"
          >
            Older →
          </a>
        )}
      </nav>
    </main>
  );
}
