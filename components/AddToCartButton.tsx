"use client";

import { addToCart } from "@/lib/cartClient";
import { useState } from "react";

export default function AddToCartButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className={
        className ??
        "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      }
      onClick={() => {
        addToCart(productId, 1);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 900);
      }}
      aria-label="Ajouter au panier"
    >
      {added ? "Ajouté !" : "Ajouter au panier"}
    </button>
  );
}


