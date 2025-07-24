// app/recent/page.tsx - Server Component
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import RecipeList from '@/components/RecipeList';

const PAGE_SIZE = 8; // Number of recipes per page

// Define the expected shape of your database row
interface LogRow {
  public_id: string;
  created_at: string;
  language: string;
  ingredients: string[];
  response: string;
}

interface PageProps {
  searchParams?: Promise<unknown>;
}

export default async function RecentPage({ searchParams }: PageProps) {
  // Always await searchParams, default to empty object
  const params = (await (searchParams ?? Promise.resolve({}))) as { page?: string | string[] };

  // Handle pagination
  const rawPage = params.page;
  const page = Math.max(0, Number(Array.isArray(rawPage) ? rawPage[0] : rawPage) || 0);

  // Create Supabase client
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Query the database
  const { data = [], count } = await supabase
    .from('public_llm_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  // Type assertion
  const typedData = (data || []) as LogRow[];

  return (
    <RecipeList 
      initialData={typedData} 
      initialCount={count || 0} 
      page={page} 
    />
  );
}
