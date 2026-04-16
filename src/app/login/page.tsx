import Link from "next/link";
import LoginForm from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-coffee-100 dark:border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl font-bold text-coffee-900 dark:text-slate-50">Welcome Back</h1>
          <p className="text-coffee-600 dark:text-slate-400 text-sm">Enter your credentials to access your library</p>
        </div>

        <LoginForm />

        <div className="text-center text-sm text-coffee-600 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-coffee-800 dark:text-slate-200 font-medium hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
