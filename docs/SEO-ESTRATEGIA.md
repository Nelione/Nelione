# Estrategia SEO para artistas contemporáneos — Nelione

El SEO de un artista no compite por términos genéricos ("comprar arte"), sino
por construir **autoridad sobre el propio nombre y la obra**, y por aparecer
en búsquedas de intención específica (técnica + formato + estilo). La web ya
trae implementada la base técnica; esta guía es la capa de contenido y
crecimiento.

## 1. Lo que ya está resuelto técnicamente

- Metadata API por página con títulos y descripciones únicos.
- Canonicals en todas las rutas indexables.
- Open Graph + Twitter Card (con imagen de la obra en las fichas).
- Sitemap dinámico que incluye cada obra publicada.
- robots.txt que protege admin/carrito/checkout.
- Datos estructurados: `Organization`, `WebSite`, `Person` (artista) y
  `Product` + `Offer` en cada obra (precio y disponibilidad).
- Render en servidor (RSC) → HTML completo para los rastreadores, sin depender
  de JavaScript.
- Catálogo estático/ISR → tiempos de carga bajos (factor de ranking).

## 2. Estrategia de palabras clave

Tres niveles, de mayor a menor intención:

1. **Marca**: "Nelione", "Nelione arte", "Nelione Feel Create Repeat".
   Objetivo: dominar la primera página. Refuerza con perfiles externos
   (paso 6) que enlacen a nelione.com.
2. **Obra + atributo**: "lámina edición limitada rosa", "escultura
   contemporánea pequeño formato", "obra original abstracta [técnica]".
   Trabaja estos términos en los campos `meta_title`, `meta_description`,
   `medium` y `description` de cada obra.
3. **Editorial/long-tail**: "arte contemporáneo sobre los ciclos del cuerpo",
   "cómo se hace una edición limitada". Se cubren con un futuro blog/diario
   (paso 4).

## 3. Optimización de cada ficha de obra

Para cada obra en el admin:
- **Nombre** descriptivo y único (evita "Sin título" repetido; añade número
  romano o subtítulo).
- **Meta título** ≤ 70 caracteres: `Nombre — técnica | Nelione`.
- **Meta descripción** ≤ 160: incluye técnica, formato, dimensiones y una
  frase de la pieza.
- **Alt text** en todas las imágenes: describe la obra (no "imagen1.jpg").
  Es accesibilidad **y** SEO de Google Imágenes, muy relevante para arte.
- **Descripción** de 60–120 palabras: contexto, materiales, idea. El texto
  único por obra es lo que diferencia tu catálogo de un PDF.

## 4. Contenido editorial (el mayor multiplicador a medio plazo)

Añade en una fase posterior una sección "Diario" o "Estudio":
- Proceso de creación de una serie (con fotos del estudio).
- El significado detrás de una colección.
- Vídeos cortos de obra en progreso.
Cada entrada es una URL indexable que capta long-tail y genera enlaces. Para
artistas, el contenido de "detrás del proceso" es el que más se comparte y
enlaza.

## 5. Google Imágenes y vídeo

El arte se descubre visualmente. Prioriza:
- Imágenes nítidas, bien nombradas (alt text rico), en AVIF/WebP (ya servido).
- El vídeo de inicio: súbelo también a YouTube/Vimeo con título y descripción
  optimizados, enlazando a nelione.com.

## 6. SEO off-page / autoridad

- **Google Business Profile** si tienes estudio visitable.
- Perfiles en **Artsy, Saatchi Art, Artland, Google Arts & Culture** (cuando
  proceda) enlazando a nelione.com → señales de marca + tráfico cualificado.
- **Prensa y blogs de arte**: cada mención con enlace suma autoridad.
- **Instagram** con enlace en bio a nelione.com (no transfiere "link juice"
  directo, pero genera búsquedas de marca, que sí cuentan).
- **Wikipedia/Wikidata**: si alcanzas notoriedad verificable, una entidad en
  Wikidata refuerza el Knowledge Panel de Google sobre tu nombre.

## 7. Medición

- **Google Search Console**: posiciones por consulta, cobertura del sitemap,
  errores de indexación. Revisa mensualmente qué obras reciben impresiones.
- **Analítica con respeto a la privacidad**: Vercel Analytics o Plausible
  (sin cookies, RGPD-friendly) en lugar de GA4 si quieres evitar el banner.
- KPI realistas para un artista: crecimiento de clics de marca, nº de obras
  indexadas, impresiones en Google Imágenes, y consultas desde `/galerias`.

## 8. Errores a evitar

- No reutilices la misma meta descripción en varias obras.
- No publiques obras sin imagen ni alt text.
- No bloquees el sitio en `robots.txt` por error tras un rediseño.
- No cambies slugs de obras ya indexadas sin redirección 301 (si lo necesitas,
  habría que añadir un mapa de redirects en `next.config.ts`).
