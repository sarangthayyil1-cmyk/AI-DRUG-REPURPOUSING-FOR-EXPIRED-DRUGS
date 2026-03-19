import Link from "next/link";

export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4 text-center">
      <div className="max-w-md p-8 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl space-y-6">
        <h1 className="text-3xl font-bold text-red-400">Authentication Error</h1>
        <p className="text-slate-300">
          The confirmation link you followed may have expired or is invalid.
          Please try signing up again or contact support if the issue persists.
        </p>
        <Link 
          href="/signup" 
          className="inline-block py-3 px-6 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
        >
          Back to Sign Up
        </Link>
      </div>
    </div>
  );
}
