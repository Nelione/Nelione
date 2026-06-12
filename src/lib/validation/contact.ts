import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Indica tu nombre.").max(120),
  organization: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().email("Correo electrónico no válido.").max(200),
  interest: z
    .enum(["exposicion", "adquisicion", "editorial", "otro"])
    .optional()
    .or(z.literal("")),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres).").max(4000),
  // Honeypot anti-spam: campo invisible que los humanos dejan vacío.
  website: z.literal("").optional().or(z.literal(undefined)),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const INTEREST_LABELS: Record<string, string> = {
  exposicion: "Exposición individual",
  adquisicion: "Adquisición de obra",
  editorial: "Colaboración editorial",
  otro: "Otro",
};
