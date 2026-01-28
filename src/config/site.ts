export const siteConfig = {
  name: "lnkiq",
  domain: "lnkiq.net",
  emails: {
    privacy: "privacy@lnkiq.net",
    legal: "legal@lnkiq.net",
    contact: "hello@lnkiq.net",
  },
  social: {
    twitter: "https://twitter.com/lnkiq",
    github: "https://github.com/lnkiq",
  },
} as const;

export type SiteConfig = typeof siteConfig;
