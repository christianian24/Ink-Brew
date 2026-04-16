"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-coffee-900 dark:text-slate-200">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="reader@inkandbrew.com"
          className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-coffee-900 dark:text-slate-200">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
        />
      </div>

      {state?.message && (
        <div className="text-sm text-red-500 font-medium">{state.message}</div>
      )}

      <Button type="submit" className="w-full dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
