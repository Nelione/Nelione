import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Acceso",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-8">
      <h1 className="mb-10 text-center font-display text-3xl font-bold tracking-[0.15em]">
        Acceso privado
      </h1>
      <LoginForm next={next} />
    </section>
  );
}
