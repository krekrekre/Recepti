"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          const next = searchParams.get("next") ?? "/";
          router.replace(next);
          return;
        }
        setCheckingAuth(false);
      });
  }, [router, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri prijavi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      {checkingAuth ? (
        <p className="text-[var(--ar-gray-500)]">Učitavanje...</p>
      ) : (
        <>
      <h1 className="text-2xl font-bold text-[var(--ar-gray-700)]">Prijava</h1>
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
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-11 rounded-xl"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--ar-gray-700)]">
            Lozinka
          </label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 h-11 rounded-xl"
          />
        </div>
        <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl">
          {loading ? "Prijava..." : "Prijavi se"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--ar-gray-500)]">
        Nemate nalog?{" "}
        <Link href="/signup" className="font-medium text-[var(--ar-primary)] hover:underline">
          Registruj se
        </Link>
      </p>
      <Link href="/" className="mt-4 block text-center text-sm text-[var(--ar-gray-500)] hover:text-[var(--ar-primary)]">
        ← Nazad na početnu
      </Link>
        </>
      )}
    </div>
  );
}
