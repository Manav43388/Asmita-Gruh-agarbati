import React from 'react';
import { Helmet } from 'react-helmet-async';

const StructuredData = ({ type, data }) => {
  const generateSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': type,
    };
    return JSON.stringify({ ...baseSchema, ...data });
  };

  return (
    <Helmet>
      <script type="application/ld+json">{generateSchema()}</script>
    </Helmet>
  );
};

// Pre-configured commonly used schemas
export const OrganizationSchema = () => (
  <StructuredData
    type="Organization"
    data={{
      name: 'Asmita Gruh Udhyog',
      url: 'https://asmitagruhudhyog.in',
      logo: 'https://asmitagruhudhyog.in/assets/logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-XXXXXXXXXX', // Ensure real data is replaced
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi', 'gu']
      },
      sameAs: [
        'https://www.facebook.com/asmitagruhudhyog',
        'https://www.instagram.com/asmitagruhudhyog'
      ]
    }}
  />
);

export const WebSiteSchema = () => (
  <StructuredData
    type="WebSite"
    data={{
      name: 'Asmita Gruh Udhyog',
      url: 'https://asmitagruhudhyog.in',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://asmitagruhudhyog.in/?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }}
  />
);

export const LocalBusinessSchema = () => (
  <StructuredData
    type="LocalBusiness"
    data={{
      name: 'Asmita Gruh Udhyog',
      image: 'https://asmitagruhudhyog.in/assets/storefront.jpg',
      '@id': 'https://asmitagruhudhyog.in',
      url: 'https://asmitagruhudhyog.in',
      telephone: '+91-XXXXXXXXXX',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Your Street',
        addressLocality: 'Your City',
        addressRegion: 'Gujarat',
        postalCode: 'XXXXXX',
        addressCountry: 'IN'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 22.0,
        longitude: 71.0
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'
        ],
        opens: '09:00',
        closes: '18:00'
      }
    }}
  />
);

export const ProductSchema = ({ product }) => (
  <StructuredData
    type="Product"
    data={{
      name: product.name,
      image: product.image || product.images?.[0],
      description: product.description,
      sku: product.id,
      brand: {
        '@type': 'Brand',
        name: 'Asmita Gruh Udhyog'
      },
      offers: {
        '@type': 'Offer',
        url: `https://asmitagruhudhyog.in/?product=${product.id}`,
        priceCurrency: 'INR',
        price: product.price,
        itemCondition: 'https://schema.org/NewCondition',
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
      },
      ...(product.rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviews || 1
        }
      })
    }}
  />
);

export const FAQSchema = ({ faqs }) => (
  <StructuredData
    type="FAQPage"
    data={{
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }}
  />
);

export const BreadcrumbSchema = ({ items }) => (
  <StructuredData
    type="BreadcrumbList"
    data={{
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `https://asmitagruhudhyog.in${item.path}`
      }))
    }}
  />
);

export default StructuredData;
