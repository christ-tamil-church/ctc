import { siteImages } from "./data/images";
import { churchInfo } from "./data/site";

// The one place the public domain lives. Canonical URLs, Open Graph tags,
// structured data, and sitemap.xml are all built from it. When the new site
// moves to christtamilchurch.com, change this line and public/CNAME together.
export const siteUrl = "https://christtamilchurch.com";

export const siteName = "Christ Tamil Church Chicago";

export type PageMeta = {
  title: string;
  description: string;
  /** Breadcrumb label; omitted for the homepage. */
  label?: string;
};

const sunday = `Sunday ${churchInfo.worship.time}`;
const place = `${churchInfo.address.city}, ${churchInfo.address.state}`;

// The list of pages. Every key here must have a page in src/App.tsx (and vice
// versa; TypeScript enforces both), and each one is prerendered and listed in
// sitemap.xml. Keyword targets per route are documented in
// seo/content-pillars.md. Keep titles under ~60 characters and descriptions
// under ~160.
export const pageMeta = {
  "/": {
    title: "Christ Tamil Church – Tamil Church in Chicago (Downers Grove)",
    description: `A Tamil Christian church family serving Chicago and the surrounding suburbs. Join us ${sunday} at ${churchInfo.address.short}.`
  },
  "/visit": {
    label: "Plan Your Visit",
    title: "Plan Your Visit – Tamil & English Church, Downers Grove IL",
    description: `New to Christ Tamil Church? Worship ${sunday} at ${churchInfo.address.short}. What to expect, our mission, and what we believe.`
  },
  "/worship": {
    label: "Sunday Worship",
    title: "Sunday Tamil & English Worship, 10:30 AM – Christ Tamil Church",
    description: `Live Tamil and English worship, prayer, Scripture, and a Bible-based sermon every ${sunday} in ${place}, with children's ministry and fellowship after.`
  },
  "/grow": {
    label: "Grow",
    title: "Bible Study, Prayer & Kids Ministry – Christ Tamil Church",
    description: "Grow in faith with weekly Bible study, prayer gatherings, B.L.A.S.T. Sunday School, and Kids Circle at a Tamil church in the Chicago suburbs."
  },
  "/grow/bible-study-prayer": {
    label: "Bible Study & Prayer",
    title: "Tamil Bible Study & Prayer in Chicago – Christ Tamil Church",
    description: `Friday Bible study, weeknight prayer, and monthly fasting prayer with a Tamil church family in ${place}. No Bible background needed.`
  },
  "/grow/sunday-school": {
    label: "Sunday School",
    title: "B.L.A.S.T. Sunday School for Kids – Christ Tamil Church",
    description: `Bible Learning And Spiritual Training for children of all ages, every Sunday during the sermon at Christ Tamil Church in ${place}.`
  },
  "/grow/kids-circle": {
    label: "Kids Circle",
    title: "Kids Circle Children's Ministry – Christ Tamil Church",
    description: "A brief, joyful Bible teaching moment for children inside Sunday worship at Christ Tamil Church, a Tamil family church near Chicago."
  },
  "/serve": {
    label: "Serve",
    title: "Community Outreach & Serving – Christ Tamil Church",
    description: "Serve neighbors across Chicagoland with Christ Tamil Church through food packaging, meals, and practical care for people in need."
  },
  "/sermons": {
    label: "Messages & Moments",
    title: "Tamil Sermons & Worship Videos – Christ Tamil Church",
    description: "Watch and search more than 10 years of Tamil and English worship, sermons, devotionals, VBS, and celebrations from Christ Tamil Church Chicago."
  },
  "/connect": {
    label: "Connect",
    title: "Fellowship & Church Family – Christ Tamil Church Chicago",
    description: "Fellowship meals, picnics, family camp, Harvest Festival, and Christmas carol rounds: find your Tamil church family in the Chicago suburbs."
  },
  "/events": {
    label: "Events",
    title: "Church Events & Gatherings – Christ Tamil Church Chicago",
    description: `Weekly worship ${sunday}, Bible study, prayer, VBS, the June picnic, and Labor Day family camp at Christ Tamil Church in ${place}.`
  },
  "/contact": {
    label: "Contact",
    title: "Contact & Directions – Christ Tamil Church, Downers Grove",
    description: `Call ${churchInfo.contact.phone}, email, or get directions to ${churchInfo.address.short}. Questions and prayer requests welcome.`
  }
} satisfies Record<string, PageMeta>;

export type PagePath = keyof typeof pageMeta;

const metaByPath: Record<string, PageMeta | undefined> = pageMeta;

export const notFoundMeta: PageMeta = {
  title: `Page Not Found | ${siteName}`,
  description: pageMeta["/"].description
};

/** "/visit/" and "/visit" are the same page; routes are stored without the slash. */
export function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

/** Canonical URLs use a trailing slash because each route is built as <route>/index.html. */
export function canonicalUrl(path: string) {
  const normalized = normalizePath(path);
  return `${siteUrl}${normalized === "/" ? "/" : `${normalized}/`}`;
}

export function getPageMeta(pathname: string): PageMeta {
  return metaByPath[normalizePath(pathname)] ?? notFoundMeta;
}

export function absoluteUrl(src: string) {
  return /^https?:\/\//.test(src) ? src : `${siteUrl}${src.startsWith("/") ? "" : "/"}${src}`;
}

export const shareImage = siteImages.hero;

const churchId = `${siteUrl}/#church`;

function churchSchema() {
  return {
    "@type": "Church",
    "@id": churchId,
    name: siteName,
    alternateName: ["Christ Tamil Church", "CTC Chicago"],
    description: pageMeta["/"].description,
    url: `${siteUrl}/`,
    logo: absoluteUrl(siteImages.logo.src),
    image: absoluteUrl(shareImage.src),
    telephone: churchInfo.contact.phoneHref.replace("tel:", ""),
    email: churchInfo.contact.email,
    foundingDate: "2015",
    knowsLanguage: ["ta", "en"],
    address: {
      "@type": "PostalAddress",
      streetAddress: churchInfo.address.street,
      addressLocality: churchInfo.address.city,
      addressRegion: churchInfo.address.state,
      postalCode: churchInfo.address.zip,
      addressCountry: "US"
    },
    hasMap: churchInfo.address.directionsUrl,
    areaServed: ["Chicago", "Chicagoland", "DuPage County, Illinois", "Illinois"].map((name) => ({
      "@type": "Place",
      name
    })),
    sameAs: [churchInfo.social.facebookUrl, churchInfo.social.instagramUrl, churchInfo.social.youtubeUrl.replace(/\/videos$/, "")]
  };
}

/** JSON-LD graph for a page: the church entity, the website, and breadcrumbs on inner pages. */
export function structuredData(pathname: string) {
  const path = normalizePath(pathname);
  const graph: object[] = [
    churchSchema(),
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      url: `${siteUrl}/`,
      inLanguage: ["en", "ta"],
      publisher: { "@id": churchId }
    }
  ];

  if (path !== "/" && metaByPath[path]) {
    const segments = path.split("/").filter(Boolean);
    const crumbs = [{ name: "Home", path: "/" }];
    segments.forEach((_, index) => {
      const crumbPath = `/${segments.slice(0, index + 1).join("/")}`;
      const meta = metaByPath[crumbPath];
      if (meta?.label) crumbs.push({ name: meta.label, path: crumbPath });
    });
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: canonicalUrl(crumb.path)
      }))
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/** Former public URLs (mostly from the old christtamilchurch.com site) and where they now live. */
export const legacyRedirects: Record<string, string> = {
  "/about": "/visit#mission",
  "/faith": "/visit#beliefs",
  "/pastors": "/visit",
  "/mission": "/visit#mission",
  "/beliefs": "/visit#beliefs",
  "/pastor": "/visit",
  "/contact-us": "/contact",
  "/bible-study": "/grow/bible-study-prayer",
  "/sunday-school": "/grow/sunday-school",
  "/kids-circle": "/grow/kids-circle",
  "/audio-sermons": "/sermons",
  "/community-outreach": "/serve",
  "/fellowship-hour": "/connect",
  "/annual-church-retreat": "/events"
};
