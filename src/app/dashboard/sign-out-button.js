"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton({ children }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/auth");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="grid size-10 place-items-center rounded-md border border-white/12 text-white/70 transition hover:border-white/35 hover:text-white"
      aria-label="Sign out"
      title="Sign out"
    >
      {children}
    </button>
  );
}
