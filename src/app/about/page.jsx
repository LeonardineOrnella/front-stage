import React from "react";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-emerald-400 text-white flex flex-col p-6">
        <h1 className="text-2xl font-bold mb-10">E-Learn</h1>
        <nav className="space-y-4">
          <a href="/" className="block py-2 px-4 rounded hover:bg-blue-500"> Accueil</a>
          <a href="" className="block py-2 px-4 rounded hover:bg-blue-500">Mes Formations</a>
          <a href="" className="block py-2 px-4 rounded hover:bg-blue-500"> Profil</a>
          <a href="" className="block py-2 px-4 rounded hover:bg-red-500"> Déconnexion</a>
        </nav>
      </div>
    </div>
  );
}
