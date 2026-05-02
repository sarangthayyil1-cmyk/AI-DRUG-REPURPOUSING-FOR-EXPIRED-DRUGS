"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter them.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If Supabase issued a session immediately (email confirmation off),
    // jump straight into the app.
    if (data.session) {
      router.push("/analyze");
      router.refresh();
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
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
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-black text-gray-900 mb-1">
            Create your <span className="text-brand">account</span>
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Save your stability analyses and revisit them any time.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-12 h-12 bg-brand-light text-brand rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-gray-700 font-medium">
                Check your email for a confirmation link.
              </p>
              <Link
                href="/login"
                className="inline-block text-brand font-semibold hover:underline"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="form-label block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label block mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  minLength={6}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Minimum 6 characters.
                </p>
              </div>
              <div>
                <label className="form-label block mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`form-input ${
                    confirmPassword && confirmPassword !== password
                      ? "!border-red-400"
                      : ""
                  }`}
                  minLength={6}
                  required
                />
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-600 mt-1">
                    Passwords do not match.
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
          )}

          {!success && (
            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-brand font-semibold hover:underline">
                Log In
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
