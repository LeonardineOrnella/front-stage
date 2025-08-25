import Link from 'next/link';
import React from 'react';

export default function Header() {
  return (
    <header className="flex justify-between items-center px-8 py-4 shadow-md bg-white">
      <div className="text-2xl font-bold text-blue-800">LOGO</div>

      <nav className="flex gap-6 items-center">
        <Link href="/" className="hover:text-blue-600">Accueil</Link>
        <Link href="/about" className="hover:text-blue-600">À propos</Link>
        <Link href="/contact" className="hover:text-blue-600">Contact</Link>
        <div className="flex gap-4">
          <Link href="/connexion" className="px-3 py-1 border text-blue-500 rounded hover:bg-blue-600 hover:text-white ">
            Connexion
          </Link>
          <Link href="/inscription" className="px-3 py-1 text-blue-500 border rounded hover:text-white hover:bg-blue-600 ">
            Inscription
          </Link>
        </div>
      </nav>
    </header>
  );
}

