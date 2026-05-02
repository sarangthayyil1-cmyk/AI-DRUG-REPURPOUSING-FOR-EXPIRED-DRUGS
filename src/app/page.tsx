"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FlaskConical, LogOut, Sparkles, ShieldCheck, Clock, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Landing / introduction page.
 * Shows the brand, a short description and a "Get Started" CTA
 * that takes the user to login (or directly into the app if already signed in).
 */
export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
      setChecked(true);
    });
  }, []);

  const ctaHref = checked && user ? "/analyze" : "/login";
  const ctaLabel = checked && user ? "Go to Analysis" : "Get Started";

  const confirmSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    setUser(null);
    setSigningOut(false);
    setShowSignOutModal(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top bar */}
      <header className="bg-brand text-white px-6 py-3 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <span className="bg-white rounded-lg p-1.5 flex items-center justify-center shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="PharmStable logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
          </span>
          <span className="text-xl font-bold tracking-tight">PharmStable</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium">
          {checked && user ? (
            <>
              <Link href="/analyze" className="text-white/90 hover:text-white">
                Analyze
              </Link>
              <Link href="/history" className="text-white/90 hover:text-white">
                History
              </Link>
              <button
                onClick={() => setShowSignOutModal(true)}
                className="text-white/90 hover:text-red-200 ml-2 pl-4 border-l border-white/20"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white/90 hover:text-white">
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-white text-brand px-4 py-1.5 rounded-lg font-semibold hover:bg-brand-light transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center w-full">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light text-brand text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              AI-powered drug stability
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">
              Are your expired
              <br />
              drugs still
              <br />
              <span className="text-brand">biologically active?</span>
            </h1>

            <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
              PharmStable estimates the residual bioactivity of aging or expired
              medications using a heuristic degradation model and Claude-powered
              repurposing insights — so unused stockpiles don't go straight to
              the bin.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold py-3.5 px-7 rounded-xl text-base transition-colors shadow-lg"
              >
                {ctaLabel}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <p className="text-xs text-gray-400 pt-2">
              Research and educational use only. Not a substitute for clinical
              advice.
            </p>
          </div>

          {/* Right side: feature cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <FeatureCard
              icon={<FlaskConical className="w-5 h-5" />}
              title="Stability Scoring"
              body="Heuristic 0–100 score that factors in temperature, humidity, light, container integrity and time past expiry."
            />
            <FeatureCard
              icon={<Sparkles className="w-5 h-5" />}
              title="AI Discovery"
              body="Claude suggests analog compounds, structural modifications, related drugs and repurposing opportunities."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-5 h-5" />}
              title="Verdict at a glance"
              body="Likely Active / Possibly Degraded / Likely Inactive verdicts with a clear factor breakdown."
            />
            <FeatureCard
              icon={<Clock className="w-5 h-5" />}
              title="Saved History"
              body="Every analysis is saved to your account so you can revisit reports any time."
            />
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-6">
        © {new Date().getFullYear()} PharmStable. For research and educational use.
      </footer>

      {showSignOutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => !signingOut && setShowSignOutModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => !signingOut && setShowSignOutModal(false)}
              className="absolute top-3 right-3 text-gray-300 hover:text-gray-600 transition-colors"
              aria-label="Close"
              disabled={signingOut}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Sign out of PharmStable?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              You&apos;ll need to log in again to view your analysis history or
              run new reports.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSignOutModal(false)}
                disabled={signingOut}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                disabled={signingOut}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60"
              >
                {signingOut ? "Signing out..." : "Yes, sign out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-lg bg-brand-light text-brand flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
    </div>
  );
}
