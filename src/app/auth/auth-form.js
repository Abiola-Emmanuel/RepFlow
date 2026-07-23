"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import SegmentedControl from "@/components/SegmentedControl";
import { createClient } from "@/lib/supabase/client";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const supabase = useMemo(() => (hasSupabaseConfig ? createClient() : null), [hasSupabaseConfig]);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleEmailAuth(event) {
    event.preventDefault();
    setStatus("");

    if (!supabase) {
      setStatus("Add your Supabase URL and anon key to .env.local, then restart the dev server.");
      return;
    }

    if (mode === "signup") {
      const trimmedUsername = username.trim();
      if (!USERNAME_PATTERN.test(trimmedUsername)) {
        setStatus("Username must be 3–20 characters (letters, numbers, underscores).");
        return;
      }
    }

    setIsLoading(true);

    const auth =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/onboarding")}`,
              data: {
                username: username.trim(),
                full_name: username.trim(),
                onboarding_complete: false,
              },
            },
          });

    const { data, error } = await auth;
    setIsLoading(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    if (mode === "signup") {
      if (data?.session) {
        router.replace("/onboarding");
      } else {
        setStatus("Check your email to confirm your account, then log in.");
        return;
      }
    } else {
      const onboardingDone = data?.user?.user_metadata?.onboarding_complete !== false;
      router.replace(onboardingDone ? next : "/onboarding");
    }

    router.refresh();
  }

  async function handleGoogleAuth() {
    setStatus("");

    if (!supabase) {
      setStatus("Add your Supabase URL and anon key to .env.local, then restart the dev server.");
      return;
    }

    setIsLoading(true);

    const oauthNext = mode === "signup" ? "/onboarding" : next;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(oauthNext)}`,
      },
    });

    if (error) {
      setStatus(error.message);
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#080908] px-5 py-10 text-white">
      <section className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-xl font-black tracking-tight">
          <span className="text-[#b7ff00]">Rep</span>Flow
        </Link>

        <div className="rounded-3xl border border-white/12 bg-white/[0.065] p-7 shadow-2xl shadow-black/30">
          <SegmentedControl
            value={mode}
            onChange={setMode}
            layoutId="auth-mode-pill"
            options={[
              { value: "login", label: "Login" },
              { value: "signup", label: "Sign up" },
            ]}
          />

          <form onSubmit={handleEmailAuth} className="mt-6 space-y-5">
            {mode === "signup" ? (
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">Username</span>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="repflow_athlete"
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]{3,20}"
                  required
                  className="mt-2 min-h-12 w-full rounded-md border border-white/18 bg-white/12 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#b7ff00]"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="mt-2 min-h-12 w-full rounded-md border border-white/18 bg-white/12 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#b7ff00]"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                minLength={6}
                required
                className="mt-2 min-h-12 w-full rounded-md border border-white/18 bg-white/12 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#b7ff00]"
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="min-h-11 w-full rounded-md border border-white/20 text-sm font-black transition hover:border-[#b7ff00] hover:text-[#b7ff00] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isLoading ? "Please wait..." : "Continue"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-xs text-white/25">
            <span className="h-px flex-1 bg-white/8" />
            or
            <span className="h-px flex-1 bg-white/8" />
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-white/20 text-sm font-black transition hover:border-white/45 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <FcGoogle className="text-lg" />
            Continue with Google
          </button>

          {status ? <p className="mt-5 text-center text-sm leading-6 text-red-300">{status}</p> : null}

          <p className="mt-6 text-center text-xs text-white/28">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-black text-[#b7ff00]"
            >
              {mode === "login" ? "Sign up free" : "Login"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
