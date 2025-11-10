"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import CartDrawer from "@/components/cart/cart-drawer";

export default function CartButton() {
  const { itemCount } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="relative"
        onClick={() => setIsDrawerOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 p-0 flex items-center justify-center text-xs">
            {itemCount > 99 ? "99+" : itemCount}
          </Badge>
        )}
      </Button>

      <CartDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  );
}
