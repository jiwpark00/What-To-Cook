// Server Component - no client bundle cost
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types' // your generated types

const PAGE_SIZE = 20;

export default async function RecentPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>>; }) {

    // debugging more promise issue
    const params = ((await searchParams) as Record<string, string | string[] | undefined> | undefined) ??
        {};

    const raw = Array.isArray(params.page)
        ? params.page[0]
        : params.page;

    const page = Number(raw ?? '0');

    const supabase = createServerComponentClient<Database>({
        cookies, // you must pass the cookie store in App Router
    });

    const { data, error, count } = await supabase
        .from('public_llm_logs') // since I created this view
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (error) throw error;

    return (
        <main className="p-6 mx-auto max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">Latest AI-Generated Recipes with Fridge Ingredients</h1>

            <ul className="space-y-6">
                {data.map((row) => (
                    <li key={row.public_id} className="border rounded-xl p-4 shadow">
                        <time className="text-sm opacity-70">
                            {new Date(row.created_at).toLocaleString()}
                        </time>
                        <p className="mt-1 font-mono text-sm">
                            {row.language}
                        </p>
                        <p className="mt-1 font-mono text-sm">
                            {row.ingredients.join(', ')}
                        </p>
                        <pre className="mt-2 whitespace-pre-wrap">
                            {row.response}
                        </pre>
                    </li>
                ))}
            </ul>

            {/* Simple pagination */}
            <nav className="mt-8 flex gap-4">
                {page > 0 && (
                    <a href={`/recent?page=${page - 1}`} className="underline">
                        ← Newer
                    </a>
                )}
                {(page + 1) * PAGE_SIZE < (count ?? 0) && (
                    <a href={`/recent?page=${page + 1}`} className="underline ml-auto">
                        Older →
                    </a>
                )}
            </nav>
        </main>
    );
}
