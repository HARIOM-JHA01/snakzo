import { Metadata } from 'next';

const siteConfig = {
  name: 'Snakzo',
  description:
    'Your one-stop shop for quality products at great prices. Browse our wide selection of electronics, fashion, home goods, and more.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://snakzo.com',
  ogImage: '/og-image.jpg',
  twitter: '@snakzo',
};

export function generateMetadata({
  title,
  description,
  image,
  noIndex = false,
  path = '',
}: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  path?: string;
}): Metadata {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const metaDescription = description || siteConfig.description;
  const metaImage = image || siteConfig.ogImage;
  const url = `${siteConfig.url}${path}`;

  return {
    title: metaTitle,
    description: metaDescription,
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    openGraph: {
      type: 'website',
      url,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.twitter,
      creator: siteConfig.twitter,
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateProductMetadata({
  name,
  description,
  image,
  price,
  currency = 'INR',
  availability = 'in stock',
  slug,
}: {
  name: string;
  description?: string;
  image?: string;
  price: number;
  currency?: string;
  availability?: string;
  slug: string;
}): Metadata {
  const title = name;
  const metaDescription =
    description?.slice(0, 160) || `Buy ${name} at ${siteConfig.name}`;
  const url = `${siteConfig.url}/products/${slug}`;

  return {
    title: `${title} | ${siteConfig.name}`,
    description: metaDescription,
    openGraph: {
      type: 'website',
      url,
      title,
      description: metaDescription,
      siteName: siteConfig.name,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.twitter,
      creator: siteConfig.twitter,
      title,
      description: metaDescription,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: url,
    },
  };
}

export { siteConfig };
