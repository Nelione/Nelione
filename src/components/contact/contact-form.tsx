"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form-fields";
import { type ContactFormState, submitContact } from "@/lib/actions/contact";
import { INTEREST_LABELS } from "@/lib/validation/contact";

const initialState: ContactFormState = { status: "idle" };

/**
 * Único componente cliente de la sección pública (junto al carrito):
 * necesita useActionState para errores de campo y estado pendiente.
 * La validación y la escritura ocurren en la Server Action.
 */
export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContact, initialState);

  if (state.status === "success") {
    return (
      <p className="border border-border px-8 py-10 text-center text-sm font-light text-ink">
        Gracias — te respondo en breve.
      </p>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-8">
      <div>
        <Label htmlFor="contact-name">Nombre</Label>
        <Input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Tu nombre"
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={state.fieldErrors?.name ? "error-name" : undefined}
        />
        {state.fieldErrors?.name && (
          <p id="error-name" className="mt-1.5 text-xs text-red-700">
            {state.fieldErrors.name}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="contact-organization">Galería / Institución</Label>
        <Input
          id="contact-organization"
          name="organization"
          type="text"
          autoComplete="organization"
          placeholder="Nombre de la galería (opcional)"
        />
      </div>

      <div>
        <Label htmlFor="contact-email">Correo electrónico</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="correo@galeria.com"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "error-email" : undefined}
        />
        {state.fieldErrors?.email && (
          <p id="error-email" className="mt-1.5 text-xs text-red-700">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="contact-interest">Interés</Label>
        <Select id="contact-interest" name="interest" defaultValue="">
          <option value="">— Selecciona —</option>
          {Object.entries(INTEREST_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="contact-message">Mensaje</Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          placeholder="Cuéntame sobre tu propuesta…"
          aria-invalid={Boolean(state.fieldErrors?.message)}
          aria-describedby={state.fieldErrors?.message ? "error-message" : undefined}
        />
        {state.fieldErrors?.message && (
          <p id="error-message" className="mt-1.5 text-xs text-red-700">
            {state.fieldErrors.message}
          </p>
        )}
      </div>

      {/* Honeypot anti-spam — invisible para humanos */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="contact-website">No rellenar</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && state.message && (
        <p role="alert" className="text-xs text-red-700">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
