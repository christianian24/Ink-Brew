import Link from "next/link";
import LoginForm from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-coffee-100 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl font-bold text-coffee-900">Welcome Back</h1>
          <p className="text-coffee-600 text-sm">Enter your credentials to access your library</p>
        </div>

        <LoginForm />

        <div className="text-center text-sm text-coffee-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-coffee-800 font-medium hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
