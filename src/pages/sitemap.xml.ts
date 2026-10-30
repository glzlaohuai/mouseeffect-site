import { locales, pathFor, domain, type PageKind } from "../data/locales";
export function GET() {
  const pages = ["home", "privacy", "support"] as PageKind[];
  const urls = locales.flatMap((l) =>
    pages.map(
      (page) =>
        `<url><loc>${domain + pathFor(l.code, page)}</loc>${locales.map((other) => `<xhtml:link rel="alternate" hreflang="${other.lang}" href="${domain + pathFor(other.code, page)}"/>`).join("")}<xhtml:link rel="alternate" hreflang="x-default" href="${domain + pathFor("en", page)}"/></url>`,
    ),
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join("")}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
