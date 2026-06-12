"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { contactSchema } from "@/lib/validation/contact";

export interface ContactFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
}

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    organization: formData.get("organization"),
    email: formData.get("email"),
    interest: formData.get("interest"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { status: "error", message: "Revisa los campos marcados.", fieldErrors };
  }

  // Honeypot relleno → probablemente un bot. Respondemos éxito sin guardar.
  if (formData.get("website")) {
    return { status: "success" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    organization: parsed.data.organization || null,
    email: parsed.data.email,
    interest: parsed.data.interest || null,
    message: parsed.data.message,
  });

  if (error) {
    console.error("Error guardando mensaje de contacto:", error.message);
    return {
      status: "error",
      message: "No se pudo enviar el mensaje. Inténtalo de nuevo en unos minutos.",
    };
  }

  return { status: "success" };
}
