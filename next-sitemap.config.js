/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://quickhaat.com",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ["/account/*", "/admin/*", "/api/*", "/checkout/*", "/cart"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/admin", "/api", "/checkout", "/cart"],
      },
    ],
  },
};
