import { createClient } from "@/lib/supabase/server";
import { AdminReviewsList } from "./AdminReviewsList";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = status === "approved" || status === "denied" ? status : "pending";

  const supabase = await createClient();
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      recipe_id,
      user_id,
      stars,
      content,
      tags,
      status,
      created_at,
      reviewed_at,
      recipe:recipes(id, title_sr, slug)
    `
    )
    .eq("status", filter)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-red-600">
        Greška pri učitavanju: {error.message}
      </div>
    );
  }

  const rows = (reviews ?? []).map((r) => ({
    id: r.id,
    recipe_id: r.recipe_id,
    user_id: r.user_id,
    stars: r.stars,
    content: r.content ?? "",
    tags: (r.tags ?? []) as string[],
    status: r.status,
    created_at: r.created_at,
    reviewed_at: r.reviewed_at ?? null,
    recipe: r.recipe as { id: string; title_sr: string; slug: string } | null,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--ar-gray-900)]">
        Recenzije
      </h1>
      <div className="mt-4 flex gap-2 border-b border-[var(--ar-gray-200)]">
        <a
          href="/admin/reviews?status=pending"
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            filter === "pending"
              ? "border-[var(--ar-primary)] text-[var(--ar-primary)]"
              : "border-transparent text-[var(--ar-gray-600)] hover:text-[var(--ar-gray-900)]"
          }`}
        >
          Na čekanju
        </a>
        <a
          href="/admin/reviews?status=approved"
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            filter === "approved"
              ? "border-[var(--ar-primary)] text-[var(--ar-primary)]"
              : "border-transparent text-[var(--ar-gray-600)] hover:text-[var(--ar-gray-900)]"
          }`}
        >
          Odobrene
        </a>
        <a
          href="/admin/reviews?status=denied"
          className={`border-b-2 px-3 py-2 text-sm font-medium ${
            filter === "denied"
              ? "border-[var(--ar-primary)] text-[var(--ar-primary)]"
              : "border-transparent text-[var(--ar-gray-600)] hover:text-[var(--ar-gray-900)]"
          }`}
        >
          Odbijene
        </a>
      </div>
      <AdminReviewsList
        reviews={rows}
        currentFilter={filter}
      />
    </div>
  );
}
