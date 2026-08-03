"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form-fields";
import { type LoginState, signIn } from "@/lib/actions/auth";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={formAction} className="space-y-8">
      {next && <input type="hidden" name="next" value={next} />}

      <div>
        <Label htmlFor="login-email">Correo electrónico</Label>
        <Input id="login-email" name="email" type="email" autoComplete="email" required />
      </div>

      <div>
        <Label htmlFor="login-password">Contraseña</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state.error && (
        <p role="alert" className="text-xs text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
