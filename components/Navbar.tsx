"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <h1 className="font-bold">MaBoutique</h1>
      <div className="space-x-4">
        <Link href="/">Accueil</Link>
        <Link href="/products">Produits</Link>
        <Link href="/cart">Panier</Link>
        <Link href="/login">Connexion</Link>
      </div>
    </nav>
  );
}
