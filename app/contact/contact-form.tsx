"use client";

import { useActionState, useEffect, useState } from "react";
import Script from "next/script";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { submitContact, type ContactFormState } from "./actions";

const initialState: ContactFormState = {};

export function ContactForm({ siteKey }: { siteKey?: string }) {
  const [state, formAction] = useActionState(submitContact, initialState);
  const [resetKey, setResetKey] = useState(0);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const turnstileDisabled =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_TURNSTILE_DISABLED === "true" ||
    process.env.NEXT_PUBLIC_TURNSTILE_DISABLED === "1";

  // Expose a global callback name for Turnstile to call
  useEffect(() => {
    // @ts-expect-error attach to window for Turnstile callback
    window.onTurnstileCallback = (token: string) => {
      const input = document.querySelector<HTMLInputElement>("#cf-turnstile-token");
      if (input) input.value = token;
    };
  }, []);

  useEffect(() => {
    if (state.success) {
      // Successful submit: clear the form and reset Turnstile widget key
      setFormValues({ name: "", email: "", company: "", message: "" });
      setResetKey((value) => value + 1);
    } else if (state.values) {
      // Failed submit: keep user-entered values
      setFormValues((prev) => ({ ...prev, ...state.values }));
    }
  }, [state.success, state.values]);

  return (
    <form key={resetKey} action={formAction} className="grid gap-3 md:grid-cols-2">
      <div className="space-y-2 md:col-span-1">
        <label className="text-sm font-medium" htmlFor="name">
          Name
        </label>
        <Input
          id="name"
          name="name"
          placeholder="Your name"
          required
          autoComplete="name"
          value={formValues.name}
          onChange={(e) => setFormValues((v) => ({ ...v, name: e.target.value }))}
        />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          value={formValues.email}
          onChange={(e) => setFormValues((v) => ({ ...v, email: e.target.value }))}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium" htmlFor="company">
          Company / Organization (optional)
        </label>
        <Input
          id="company"
          name="company"
          placeholder="Where are you reaching out from?"
          value={formValues.company}
          onChange={(e) => setFormValues((v) => ({ ...v, company: e.target.value }))}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium" htmlFor="message">
          Message
        </label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell me a bit about the opportunity or question you have."
          rows={5}
          required
          value={formValues.message}
          onChange={(e) => setFormValues((v) => ({ ...v, message: e.target.value }))}
        />
      </div>
      {state.error ? (
        <p className="text-destructive text-sm md:col-span-2">{state.error}</p>
      ) : state.success ? (
        <p className="text-sm text-emerald-600 md:col-span-2">
          Message sent. I’ll respond shortly.
        </p>
      ) : null}
      <div className="flex justify-end md:col-span-2">
        <Button type="submit">Send message</Button>
      </div>
      {/* Cloudflare Turnstile widget */}
      {!turnstileDisabled && siteKey ? (
        <div className="md:col-span-2">
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
          <div
            className="cf-turnstile mt-2"
            data-sitekey={siteKey}
            data-callback="onTurnstileCallback"
          />
          <input id="cf-turnstile-token" name="cf-turnstile-token" type="hidden" />
        </div>
      ) : null}
    </form>
  );
}
