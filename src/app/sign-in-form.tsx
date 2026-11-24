"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState } from "react";
import { requestMagicLink, type SignInState } from "@/lib/auth/actions";

export function SignInForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(requestMagicLink, { status: "idle" });

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state.status === "sent" ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-accent-soft p-5 text-sm leading-relaxed"
          role="status"
        >
          <p className="font-semibold text-accent">Vérifiez votre boîte mail.</p>
          <p className="mt-1">
            Si cette adresse a accès à un rapport, un lien de connexion vient de lui être envoyé. Il est valable 15 minutes.
          </p>
        </motion.div>
      ) : (
        <motion.form key="form" action={action} exit={{ opacity: 0, y: -8 }} className="space-y-3">
          <label htmlFor="email" className="block text-sm font-medium">
            Adresse e-mail professionnelle
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="prenom.nom@…"
            className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[15px] outline-none transition-shadow focus:border-accent focus:ring-4 focus:ring-accent/15"
          />
          {state.status === "error" && (
            <p className="text-sm" style={{ color: "var(--sev-critique)" }} role="alert">
              {state.message}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-[15px] font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Envoi…" : "Recevoir un lien de connexion"}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
