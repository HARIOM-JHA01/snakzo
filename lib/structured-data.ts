import { siteConfig } from "./seo";

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    sameAs: [
      `https://twitter.com/${siteConfig.twitter.replace("@", "")}`,
      `https://facebook.com/${siteConfig.name.toLowerCase()}`,
    ],
  };
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateProductSchema({
  name,
  description,
  image,
  price,
  currency = "INR",
  availability = "InStock",
  brand,
  category,
  sku,
  rating,
  reviewCount,
  url,
}: {
  name: string;
  description?: string;
  image?: string;
  price: number;
  currency?: string;
  availability?: string;
  brand?: string;
  category?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  url: string;
}) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    url,
    sku: sku || name.toLowerCase().replace(/\s+/g, "-"),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price: price.toFixed(2),
      availability: `https://schema.org/${availability}`,
      priceValidUntil: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
  };

  if (brand) {
    schema.brand = {
      "@type": "Brand",
      name: brand,
    };
  }

  if (category) {
    schema.category = category;
  }

  if (rating && reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateReviewSchema({
  productName,
  reviews,
}: {
  productName: string;
  reviews: Array<{
    author: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}) {
  return reviews.map((review) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Product",
      name: productName,
    },
    author: {
      "@type": "Person",
      name: review.author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.comment,
    datePublished: review.date,
  }));
}
