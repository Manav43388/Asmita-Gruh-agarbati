import { writeFileSync } from 'fs';
import { resolve } from 'path';

// Define all static and dynamic routes you want to be indexed
const routes = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/#products', changefreq: 'daily', priority: 0.9 },
  { url: '/#categories', changefreq: 'weekly', priority: 0.8 },
  { url: '/#about', changefreq: 'monthly', priority: 0.7 },
  { url: '/contact', changefreq: 'monthly', priority: 0.8 },
  { url: '/#faq', changefreq: 'weekly', priority: 0.6 },
  // Exclude admin, wishlist, cart, tracking, etc. from indexing
];

const hostname = 'https://asmitagruhudhyog.in';

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${hostname}${route.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /wishlist
Disallow: /track
Disallow: /payment-success
Disallow: /payment-failed

Sitemap: ${hostname}/sitemap.xml
`;

try {
  const distDir = resolve(process.cwd(), 'dist');
  writeFileSync(resolve(distDir, 'sitemap.xml'), sitemap);
  writeFileSync(resolve(distDir, 'robots.txt'), robotsTxt);
  console.log('✅ sitemap.xml and robots.txt generated successfully.');
} catch (error) {
  // If dist folder is not yet created, the user might be running this at the wrong time.
  console.error('Error generating SEO assets: ensure dist folder exists.', error);
}
