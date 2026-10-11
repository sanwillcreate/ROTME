import Link from "next/link";
import { SignInPrompt } from "../components/ProfileMenu";

// Reuses the existing magic-link sign-in from the profile menu.
// No second authentication system.
export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-5 text-neutral-100">
      <Link
        href="/"
        className="mb-10 text-lg font-bold tracking-tight text-neutral-50"
      >
        ROT<span className="text-orange-500">ME</span>
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900/40 p-7">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-orange-500/80">
          Account
        </span>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-50">
          Log in to ROT ME
        </h1>

        <div className="mt-6">
          <SignInPrompt heading="Enter your email and we'll send you a sign-in link." />
        </div>
      </div>
    </main>
  );
}