"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { signInAction, type LoginState } from "./actions";
import { loginSchema, type LoginValues } from "./schema";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, actionPending] = useActionState(signInAction, initialState);
  const [transitionPending, startTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (state?.error) {
      return;
    }

    form.clearErrors();
  }, [state?.error, form]);

  const onSubmit = form.handleSubmit((values) => {
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);

    startTransition(() => {
      formAction(formData);
    });
  });

  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;
  const pending = actionPending || transitionPending;

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Portal</CardTitle>
          <CardDescription>
            Sign in with your Supabase credentials to manage content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={pending}
                aria-invalid={emailError ? "true" : "false"}
                {...form.register("email")}
              />
              {emailError ? <p className="text-destructive text-sm">{emailError}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                disabled={pending}
                aria-invalid={passwordError ? "true" : "false"}
                {...form.register("password")}
              />
              {passwordError ? <p className="text-destructive text-sm">{passwordError}</p> : null}
            </div>

            {state?.error ? (
              <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
                {state.error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
