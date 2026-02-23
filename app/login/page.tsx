"use client";

export default function LoginPage() {
  return (
    <form className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Connexion</h2>

      <input type="email" placeholder="Email" className="border p-2 w-full mb-2" />
      <input type="password" placeholder="Mot de passe" className="border p-2 w-full mb-2" />

      <button className="bg-blue-600 text-white p-2 w-full">
        Se connecter
      </button>
    </form>
  );
}
