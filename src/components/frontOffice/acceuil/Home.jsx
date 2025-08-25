import React from 'react';

export default function Home() {
 

  return (
    <div className="px-6 py-10 bg-gradient-to-br from-blue-800 via-emerald-600 to-emerald-700  shadow-2xl p-8 text-white">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Bienvenue sur notre plateforme</h1>
        <p className="mt-4 text-gray-600 text-lg">
          Découvrez nos formations et développez vos compétences.
        </p>
        <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-600 ">
          Voir les formations
        </button>
      </section>
    </div>
  );
}
