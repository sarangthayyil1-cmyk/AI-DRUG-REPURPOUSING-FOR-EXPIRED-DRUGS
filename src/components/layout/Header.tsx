"use client";

import { History, LogOut, PlusCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

/**
 * Top navigation bar with PharmStable branding.
 * Matches the dark header from the design screenshots.
 */
export default function Header() {
  const [user, setUser] = useState<User | null>(null);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="bg-brand text-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <Link href="/analyze" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white overflow-hidden">
          <Image src="/logo.png" alt="PharmStable Logo" width={40} height={40} className="object-contain" />
        </div>
        <span className="text-lg font-bold tracking-tight">PharmStable</span>
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
              onClick={handleSignOut}
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
  );
}
