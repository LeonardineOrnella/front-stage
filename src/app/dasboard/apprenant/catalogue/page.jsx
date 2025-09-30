'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, Filter, Search, Star, Eye } from 'lucide-react';
import { formationService } from '@/service/formation.service';
import { toast } from 'react-toastify';

export default function CataloguePage() {
  const router = useRouter();
  const [formations, setFormations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('pertinence'); // pertinence | prix-asc | prix-desc | duree-asc | duree-desc

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    loadCatalogue();
  }, []);

  const loadCatalogue = async () => {
    try {
      setLoading(true);
      const [formationsData, categoriesData] = await Promise.all([
        formationService.getAllFormations(),
        formationService.getCategories(),
      ]);
      setFormations(Array.isArray(formationsData) ? formationsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors du chargement du catalogue");
    } finally {
      setLoading(false);
    }
  };

  const handleInscription = (formation) => {
    try {
      // Log debug demandé
      // eslint-disable-next-line no-console
      console.log('Inscription formation:', formation);
      // Stockage statique pour la page checkout
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('checkoutFormation', JSON.stringify(formation));
        } catch {}
      }
    } catch {}
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!userData) {
      toast.error('Vous devez être connecté pour vous inscrire');
      return;
    }
    router.push(`/dasboard/apprenant/checkout/${formation.id_form}`);
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = formations.filter((f) => {
      const matchesSearch = !term
        ? true
        : (f.titre_form || '').toLowerCase().includes(term) || (f.description || '').toLowerCase().includes(term);
      const matchesCategory = !selectedCategory || String(f.id_categ) === String(selectedCategory);
      return matchesSearch && matchesCategory;
    });
    // Sort
    switch (sortBy) {
      case 'prix-asc':
        list = [...list].sort((a, b) => Number(a.frais_form || 0) - Number(b.frais_form || 0));
        break;
      case 'prix-desc':
        list = [...list].sort((a, b) => Number(b.frais_form || 0) - Number(a.frais_form || 0));
        break;
      case 'duree-asc':
        list = [...list].sort((a, b) => Number(a.duree_form || 0) - Number(b.duree_form || 0));
        break;
      case 'duree-desc':
        list = [...list].sort((a, b) => Number(b.duree_form || 0) - Number(a.duree_form || 0));
        break;
      default:
        break;
    }
    return list;
  }, [formations, searchTerm, selectedCategory, sortBy]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFormations = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    // reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Catalogue des Formations</h1>
          <p className="text-gray-600">Parcourez le catalogue, lisez les descriptions et aperçus, puis inscrivez-vous.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher une formation…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c.id_categ} value={c.id_categ}>{c.nom_categ}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="pertinence">Tri: Pertinence</option>
                <option value="prix-asc">Prix: croissant</option>
                <option value="prix-desc">Prix: décroissant</option>
                <option value="duree-asc">Durée: croissante</option>
                <option value="duree-desc">Durée: décroissante</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="text-sm text-gray-700">{filtered.length} formation(s) trouvée(s)</div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune formation trouvée</h3>
            <p className="text-gray-600">Essayez d'élargir vos critères de recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentFormations.map((f) => (
              <div key={f.id_form} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-44 bg-emerald-600 flex items-center justify-center">
                  {f.image_couverture ? (
                    <img src={`http://localhost:3001${f.image_couverture}`} alt={f.titre_form} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-14 h-14 text-white opacity-80" />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(f.statut_form)}`}>{f.statut_form}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{f.titre_form}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{f.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{f.duree_form}h</span></div>
                    <div className="flex items-center gap-1"><BookOpen className="w-4 h-4" /><span>{f.chapitres?.length || 0} chapitres</span></div>
                    <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /><span>4.5</span></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-emerald-600">{parseFloat(f.frais_form || 0).toFixed(2)}€</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/dasboard/apprenant/formation/${f.id_form}`)}
                        className="p-2 text-gray-500 hover:text-emerald-600"
                        title="Voir détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleInscription(f)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        S'inscrire
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="mt-8 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-700">
              Affichage de <span className="font-medium">{startIndex + 1}</span> à <span className="font-medium">{Math.min(startIndex + itemsPerPage, filtered.length)}</span> sur <span className="font-medium">{filtered.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-medium rounded-lg border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                Précédent
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border ${p === currentPage ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm font-medium rounded-lg border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



