import { getProductById } from "@/lib/products";
import { NextResponse } from "next/server";

export function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const product = getProductById(params.id);
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }
  return NextResponse.json({ product });
}


