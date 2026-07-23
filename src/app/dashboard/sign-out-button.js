"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useThemeClasses } from "@/lib/theme";

export default function LogoutButton({ children }) {
  const router = useRouter();
  const theme = useThemeClasses();

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
      className={`grid size-10 place-items-center rounded-md border transition ${
        theme.isLight
          ? "border-black/12 text-black/60 hover:border-black/35 hover:text-black"
          : "border-white/12 text-white/70 hover:border-white/35 hover:text-white"
      }`}
      aria-label="Sign out"
      title="Sign out"
    >
      {children}
    </button>
  );
}
