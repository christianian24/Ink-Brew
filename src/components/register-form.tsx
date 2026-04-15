"use client";

import { useActionState } from "react";
import { registerAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterForm() {
  const [state, action, isPending] = useActionState(registerAction, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-coffee-900">
          Name
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Jane Doe"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-coffee-900">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="reader@inkandbrew.com"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-coffee-900">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />
      </div>

      {state?.message && (
        <div className="text-sm text-red-500 font-medium">{state.message}</div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Joining..." : "Join Now"}
      </Button>
    </form>
  );
}
