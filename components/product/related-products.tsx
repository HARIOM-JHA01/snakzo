import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: {
    url: string;
    altText: string | null;
  }[];
  brand: {
    name: string;
  } | null;
}

interface RelatedProductsProps {
  products: RelatedProduct[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => {
          const image = product.images[0];
          const hasDiscount =
            product.comparePrice && product.comparePrice > product.price;
          const discountPercentage =
            hasDiscount && product.comparePrice
              ? Math.round(
                  ((product.comparePrice - product.price) /
                    product.comparePrice) *
                    100
                )
              : 0;

          return (
            <Link key={product.id} href={`/products/${product.slug}`}>
              <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {image ? (
                      <Image
                        src={image.url}
                        alt={image.altText || product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}

                    {hasDiscount && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{discountPercentage}%
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    {product.brand && (
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {product.brand.name}
                      </p>
                    )}
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">
                        ₹{product.price.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{product.comparePrice!.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <Button size="sm" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
