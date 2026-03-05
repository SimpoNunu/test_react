export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  category: "accessoires" | "vetements" | "electronique";
};

export const products: Product[] = [
  {
    id: "tshirt-geist",
    name: "T-shirt Geist",
    description: "T-shirt 100% coton, coupe unisexe. Confort premium.",
    priceCents: 1990,
    category: "vetements",
  },
  {
    id: "mug-next",
    name: "Mug Next",
    description: "Mug en céramique 330ml. Parfait pour le café du build.",
    priceCents: 1290,
    category: "accessoires",
  },
  {
    id: "sac-tote",
    name: "Tote bag",
    description: "Sac en toile robuste pour transporter tout votre setup.",
    priceCents: 1490,
    category: "accessoires",
  },
  {
    id: "clavier-mini",
    name: "Clavier mécanique mini",
    description: "Clavier compact 65%, switches linéaires, rétroéclairage.",
    priceCents: 8990,
    category: "electronique",
  },
  {
    id: "souris-pro",
    name: "Souris Pro",
    description: "Capteur haute précision, ultra légère, excellente autonomie.",
    priceCents: 5990,
    category: "electronique",
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}


