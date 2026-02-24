"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri registraciji.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold text-[var(--ar-gray-700)]">Proverite email</h1>
        <p className="mt-2 text-[var(--ar-gray-500)]">
          Poslali smo vam link za potvrdu. Kliknite na link u email-u da
          aktivirate nalog.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block font-medium text-[var(--ar-primary)] hover:underline"
        >
          Idi na prijavu →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-[var(--ar-gray-700)]">Registracija</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--ar-gray-700)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--ar-gray-200)] px-4 py-2.5 focus:border-[var(--ar-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ar-primary)]"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--ar-gray-700)]">
            Lozinka (min. 6 karaktera)
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--ar-gray-200)] px-4 py-2.5 focus:border-[var(--ar-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ar-primary)]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--ar-primary)] py-3 font-medium text-white hover:bg-[var(--ar-primary-hover)] disabled:opacity-50"
        >
          {loading ? "Registracija..." : "Registruj se"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--ar-gray-500)]">
        Već imate nalog?{" "}
        <Link href="/login" className="font-medium text-[var(--ar-primary)] hover:underline">
          Prijavi se
        </Link>
      </p>
      <Link href="/" className="mt-4 block text-center text-sm text-[var(--ar-gray-500)] hover:text-[var(--ar-primary)]">
        ← Nazad na početnu
      </Link>
    </div>
  );
}
