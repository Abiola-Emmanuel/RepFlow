import { Suspense } from "react";
import AuthForm from "./auth-form";

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthShell />}>
      <AuthForm />
    </Suspense>
  );
}

function AuthShell() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#080908] px-5 py-10 text-white">
      <div className="h-96 w-full max-w-md animate-pulse rounded-3xl border border-white/12 bg-white/[0.065]" />
    </main>
  );
}
