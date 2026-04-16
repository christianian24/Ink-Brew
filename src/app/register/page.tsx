import Link from "next/link";
import RegisterForm from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-coffee-100 dark:border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl font-bold text-coffee-900 dark:text-slate-50">Join Ink & Brew</h1>
          <p className="text-coffee-600 dark:text-slate-400 text-sm">Create an account to read, write, and explore.</p>
        </div>

        <RegisterForm />

        <div className="text-center text-sm text-coffee-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-coffee-800 dark:text-slate-200 font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
