import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Middleware:
 * 1. Refresca la sesión de Supabase en cada request (patrón oficial @supabase/ssr).
 * 2. Protege las rutas /admin/* — redirige a /admin/login si no hay sesión.
 *
 * La verificación de rol (staff/admin) se hace en el layout de /admin con
 * datos del servidor, no aquí: el middleware solo garantiza autenticación,
 * la autorización fina vive junto a los datos (Clean Architecture: la regla
 * de negocio no depende del transporte).
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // IMPORTANTE: usar getUser() (valida el JWT contra el servidor de Auth),
  // nunca getSession() en middleware — getSession no verifica la firma.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas excepto:
     * - _next/static, _next/image (assets)
     * - favicon, archivos públicos comunes
     * - api/webhooks (Stripe firma sus propias requests; no necesita sesión)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|woff2?)$).*)",
  ],
};
