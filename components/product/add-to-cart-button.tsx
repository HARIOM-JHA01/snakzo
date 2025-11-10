"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price: number;
  maxQuantity: number;
  variantId?: string | null;
  isInStock: boolean;
}

export default function AddToCartButton({
  productId,
  productName,
  price,
  maxQuantity,
  variantId,
  isInStock,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!isInStock) {
      toast.error("This item is currently unavailable.");
      return;
    }

    setIsAddingToCart(true);

    try {
      // If user is not logged in, store in localStorage
      if (!session) {
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        const existingItemIndex = guestCart.findIndex(
          (item: any) =>
            item.productId === productId && item.variantId === variantId
        );

        if (existingItemIndex >= 0) {
          guestCart[existingItemIndex].quantity += quantity;
        } else {
          guestCart.push({
            productId,
            variantId,
            quantity,
            productName,
            price,
          });
        }

        localStorage.setItem("guestCart", JSON.stringify(guestCart));

        toast.success(`${quantity} × ${productName} added to your cart.`);
      } else {
        // Add to database cart
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            variantId,
            quantity,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add to cart");
        }

        toast.success(`${quantity} × ${productName} added to your cart.`);
      }

      // Reset quantity to 1 after adding
      setQuantity(1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!session) {
      toast.error("Please login to add items to your wishlist.");
      router.push("/login");
      return;
    }

    setIsAddingToWishlist(true);

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add to wishlist");
      }

      toast.success(`${productName} added to your wishlist.`);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add to wishlist."
      );
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Quantity:</label>
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1 || !isInStock}
            className="h-10 w-10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= maxQuantity || !isInStock}
            className="h-10 w-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {maxQuantity > 0 && maxQuantity < 10 && (
          <span className="text-sm text-muted-foreground">
            Max: {maxQuantity}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={!isInStock || isAddingToCart}
          className="flex-1 h-12 text-base"
          size="lg"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isAddingToCart ? "Adding..." : "Add to Cart"}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleAddToWishlist}
          disabled={isAddingToWishlist}
          className="h-12 w-12"
        >
          <Heart className="h-5 w-5" />
        </Button>
      </div>

      {!isInStock && (
        <p className="text-sm text-destructive">
          This item is currently out of stock.
        </p>
      )}
    </div>
  );
}
