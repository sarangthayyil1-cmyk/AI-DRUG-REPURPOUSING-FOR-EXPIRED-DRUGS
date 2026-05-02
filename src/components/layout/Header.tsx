"use client";

import { History, LogOut, PlusCircle, X } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

/**
 * Top navigation bar with PharmStable branding.
 */
export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const confirmSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
    setShowSignOutModal(false);
    router.push("/");
    router.refresh();
  };

  const homeHref = user ? "/analyze" : "/";

  return (
    <>
      <header className="bg-brand text-white px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <Link href={homeHref} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
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

        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                href="/analyze"
                className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Analyze
              </Link>
              <Link
                href="/history"
                className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                <History className="w-4 h-4" />
                History
              </Link>
              <button
                onClick={() => setShowSignOutModal(true)}
                className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-red-200 transition-colors ml-4 pl-4 border-l border-white/20"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              Login
            </Link>
          )}
        </nav>
      </header>

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
    </>
  );
}
