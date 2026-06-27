import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  canonicalUrl, 
  keywords, 
  ogImage = 'https://asmitagruhudhyog.in/images/og-image.png', 
  themeColor = '#d4af37',
  noindex = false
}) => {
  const siteName = 'Asmita Gruh Udhyog';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const siteUrl = 'https://asmitagruhudhyog.in';
  const url = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Theme Color */}
      <meta name="theme-color" content={themeColor} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@asmitagruh" />
      <meta name="twitter:creator" content="@asmitagruh" />
      
      {/* Additional Meta Tags */}
      <meta name="author" content={siteName} />
      <meta name="publisher" content={siteName} />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <html lang="en" />
    </Helmet>
  );
};

export default SEO;
