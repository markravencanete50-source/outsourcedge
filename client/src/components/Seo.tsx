/* ─────────────────────────────────────────────────────────────────────────────
   Seo.tsx — per-page <head> management + JSON-LD for OutsourcEdge
   Drop in at: client/src/components/Seo.tsx

   Dependency-free: sets title / meta / canonical / OG / Twitter / JSON-LD
   imperatively in a useEffect (no react-helmet-async required). Tags created
   here are reused across SPA route changes; JSON-LD blocks are managed by a
   data-seo marker so stale ones are cleaned up between pages.
───────────────────────────────────────────────────────────────────────────── */
import { useEffect } from "react";

const SITE = "https://outsourcedge.com";          // ← production origin
const BRAND = "OutsourcEdge";
const OG_IMAGE = `${SITE}/brand/og-cover.jpg`;     // ← 1200×630 social card

interface SeoProps {
  title: string;
  description: string;
  /** path only, e.g. "/property-management" */
  path?: string;
  image?: string;
  /** add Organization + Service structured data on the home page */
  org?: boolean;
}

/** Set (or create) a <meta> tag keyed by name or property. */
function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Set (or create) the canonical <link>. */
function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function Seo({ title, description, path = "/", image = OG_IMAGE, org }: SeoProps) {
  useEffect(() => {
    const url = `${SITE}${path}`;
    const fullTitle = path === "/" ? `${BRAND} — ${title}` : `${title} · ${BRAND}`;

    document.title = fullTitle;
    setMeta("name", "description", description);
    setCanonical(url);
    setMeta("name", "robots", "index,follow");

    // Open Graph
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", BRAND);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);

    // JSON-LD structured data — managed by data-seo so it's swapped per page.
    const ldNodes: HTMLScriptElement[] = [];
    const addLd = (data: unknown) => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.setAttribute("data-seo", "ld");
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
      ldNodes.push(s);
    };

    if (org) {
      addLd({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: BRAND,
        url: SITE,
        logo: `${SITE}/brand/outsourcedge-mark.png`,
        description,
        sameAs: [
          "https://www.linkedin.com/company/outsourcedge",
          "https://x.com/outsourcedge",
          "https://www.facebook.com/outsourcedge",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          email: "sales@outsourcedge.com",
          contactType: "sales",
          areaServed: "US",
        },
      });
      addLd({
        "@context": "https://schema.org",
        "@type": "Service",
        serviceType: "Offshore staffing for US real estate operators",
        provider: { "@type": "Organization", name: BRAND, url: SITE },
        areaServed: { "@type": "Country", name: "United States" },
        description,
      });
    }

    return () => {
      ldNodes.forEach((n) => n.remove());
    };
  }, [title, description, path, image, org]);

  return null;
}
