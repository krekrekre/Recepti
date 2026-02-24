"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Heart, Star, Printer, Share2 } from "lucide-react";

interface RecipeActionsProps {
  recipeId: string;
  slug: string;
  title: string;
  editHref?: string | null;
}

export function RecipeActions({
  recipeId,
  slug,
  title,
  editHref = null,
}: RecipeActionsProps) {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from("saved_recipes")
          .select("recipe_id")
          .eq("user_id", data.user.id)
          .eq("recipe_id", recipeId)
          .maybeSingle()
          .then(({ data: saved }) => setIsSaved(!!saved));
      }
    });
  }, [recipeId]);

  async function toggleSave() {
    if (!user) {
      window.location.href = "/login?next=/recepti/" + slug;
      return;
    }
    setSaving(true);
    const supabase = createClient();
    if (isSaved) {
      await supabase
        .from("saved_recipes")
        .delete()
        .eq("user_id", user.id)
        .eq("recipe_id", recipeId);
      setIsSaved(false);
    } else {
      await supabase
        .from("saved_recipes")
        .insert({ user_id: user.id, recipe_id: recipeId });
      setIsSaved(true);
    }
    setSaving(false);
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
          text: `Pogledaj ovaj recept: ${title}`,
        });
      } catch {
        await navigator.clipboard.writeText(url);
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <div className="no-print mt-4">
      <div className="flex flex-wrap border border-[var(--ar-gray-250)]">
        <button
          type="button"
          onClick={toggleSave}
          disabled={saving}
          className={`inline-flex w-1/2 items-center justify-center gap-2 border-b border-r border-[var(--ar-gray-200)] px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors disabled:opacity-50 sm:w-auto sm:border-b-0 sm:px-5 sm:py-2.5 ${
            isSaved
              ? "bg-[var(--ar-primary)] text-white hover:bg-[var(--ar-primary-hover)]"
              : "bg-[var(--ar-primary)] text-white hover:bg-[var(--ar-primary-hover)]"
          }`}
        >
          {isSaved ? "Sačuvano" : "Sačuvaj"}
          <Heart
            className={`size-4 ${isSaved ? "fill-current" : ""}`}
            strokeWidth={2}
          />
        </button>
        <Link
          href={`/recepti/${slug}#rate`}
          className="flex w-1/2 items-center justify-center gap-1.5 border-b border-[var(--ar-gray-200)] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[var(--ar-gray-700)] hover:underline sm:w-auto sm:border-b-0 sm:border-r sm:border-[var(--ar-gray-400)] sm:py-2.5"
        >
          <Star className="size-4" strokeWidth={2} />
          Oceni
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex w-1/2 items-center justify-center gap-1.5 border-r border-[var(--ar-gray-200)] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[var(--ar-gray-700)] hover:underline sm:w-auto sm:border-r sm:border-[var(--ar-gray-40)] sm:py-2.5"
        >
          <Printer className="size-4" />
          Štampaj
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex w-1/2 items-center justify-center gap-1.5 px-4 py-3 text-sm font-bold uppercase tracking-wide text-[var(--ar-gray-700)] hover:underline sm:w-auto sm:py-2.5"
        >
          <Share2 className="size-4" />
          Podeli
        </button>
        {editHref && (
          <Link
            href={editHref}
            className="flex w-full items-center justify-center gap-1.5 border-t border-[var(--ar-gray-200)] px-4 py-3 text-sm font-bold uppercase tracking-wide text-[var(--ar-gray-700)] hover:underline sm:w-auto sm:border-l sm:border-t-0 sm:py-2.5"
          >
            Uredi
          </Link>
        )}
      </div>
    </div>
  );
}
