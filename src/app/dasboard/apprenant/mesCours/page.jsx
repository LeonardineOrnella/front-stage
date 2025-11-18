'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, Play, CheckCircle, Award, Download, Eye, BarChart3 } from 'lucide-react';
import { formationService } from '@/service/formation.service';
import { transactionService } from '@/service/transaction.service';
import axios from '@/lib/axios';
import { toast } from 'react-toastify';
 

export default function MesCoursPage() {
  const router = useRouter();
  const [mesFormations, setMesFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('en-cours');
  const [qcmsByFormation, setQcmsByFormation] = useState({});

  useEffect(() => {
    loadMesFormations();
    loadQcmsDeep();
  }, []);

  const loadMesFormations = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      // Récupérer les transactions de l'utilisateur (formats robustes)
      const transRes = await transactionService.getUserTransactions(user.id);
      const raw = transRes?.data;
      const transactions = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : Array.isArray(raw?.results) ? raw.results : []);

      // IDs des formations avec statut validé
      const validatedIds = new Set(
        transactions
          .filter(t => String(t.statut_trans || '').toLowerCase() === 'validee')
          .map(t => Number(t.id_form))
          .filter(Boolean)
      );

      // Sécurité: si aucune n'est détectée comme validée, vérifier via check-payment pour toutes les formations présentes dans les transactions
      if (validatedIds.size === 0 && transactions.length > 0) {
        const candidateIds = [...new Set(transactions.map(t => Number(t.id_form)).filter(Boolean))];
        for (const fid of candidateIds) {
          try {
            const hasPaid = await transactionService.checkFormationAccess(fid, user.id);
            if (hasPaid) validatedIds.add(fid);
          } catch {}
        }
      }

      // Charger les détails de chaque formation validée
      const formations = [];
      for (const formId of validatedIds) {
        try {
          const data = await formationService.getFormationById(formId);
          const src = Array.isArray(data?.formation) ? data.formation[0] : (data?.formation || data?.data || data);
          if (src) {
            formations.push({
              id_form: src.id_form ?? src.id,
              titre_form: src.titre_form ?? src.titre ?? 'Formation',
              description: src.description ?? '',
              progression: 0,
              statut: 'en-cours',
              duree_form: src.duree_form ?? null,
              chapitres_termines: 0,
              chapitres_total: Array.isArray(src.chapitres) ? src.chapitres.length : (Array.isArray(src.mchapitres) ? src.mchapitres.length : 0),
              date_inscription: validated.find(v => Number(v.id_form) === Number(formId))?.date_trans || new Date().toISOString(),
              derniere_activite: null,
              certificat_disponible: false
            });
          }
        } catch (e) {
          // ignore formation fetch error and continue
        }
      }

      // Fallback: si aucune formation détectée via transactions, vérifier via toutes les formations
      if (formations.length === 0) {
        try {
          const all = await formationService.getAllFormations();
          const list = Array.isArray(all?.data) ? all.data : (Array.isArray(all?.formations) ? all.formations : (Array.isArray(all) ? all : []));
          for (const f of list) {
            const fid = Number(f.id_form ?? f.id);
            if (!fid) continue;
            try {
              const hasPaid = await transactionService.checkFormationAccess(fid, user.id);
              if (hasPaid) {
                formations.push({
                  id_form: fid,
                  titre_form: f.titre_form ?? f.titre ?? 'Formation',
                  description: f.description ?? '',
                  progression: 0,
                  statut: 'en-cours',
                  duree_form: f.duree_form ?? null,
                  chapitres_termines: 0,
                  chapitres_total: Array.isArray(f.chapitres) ? f.chapitres.length : (Array.isArray(f.mchapitres) ? f.mchapitres.length : 0),
                  date_inscription: new Date().toISOString(),
                  derniere_activite: null,
                  certificat_disponible: false
                });
              }
            } catch {}
          }
        } catch {}
      }

      setMesFormations(formations);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
      toast.error('Erreur lors du chargement de vos formations');
    } finally {
      setLoading(false);
    }
  };

  const loadQcmsDeep = async () => {
    try {
      const { data } = await axios.get('/qcm/deep');
      // Regrouper les QCM par id_form de la formation liée
      const grouped = (data || []).reduce((acc, qcm) => {
        const formId = qcm?.formation?.id_form;
        if (!formId) return acc;
        if (!acc[formId]) acc[formId] = [];
        acc[formId].push(qcm);
        return acc;
      }, {});
      setQcmsByFormation(grouped);
    } catch (err) {
      console.error('Erreur lors du chargement des QCM:', err);
      setQcmsByFormation({});
    }
  };

  const handleContinuerFormation = async (formationId) => {
    try {
      toast.success('Redirection vers le contenu...');
      router.push(`/dasboard/apprenant/formation/${formationId}/contenu`);
    } catch (error) {
      console.error('Erreur lors de l\'accès à la formation:', error);
      toast.error('Erreur d\'accès au contenu');
    }
  };

  const handleTelechargerCertificat = async (formationId) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const certificat = await userService.telechargerCertificat(user.id, formationId);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([certificat]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificat-formation-${formationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Certificat téléchargé avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error(t('student.my_courses.certificate_error'));
    }
  };

  const getProgressColor = (progression) => {
    if (progression >= 80) return 'bg-green-500';
    if (progression >= 50) return 'bg-blue-500';
    if (progression >= 25) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'termine':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'en-cours':
        return <Play className="w-5 h-5 text-blue-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredFormations = mesFormations.filter(formation => {
    if (selectedTab === 'en-cours') return formation.statut === 'en-cours';
    if (selectedTab === 'terminees') return formation.statut === 'termine';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes formations</h1>
          <p className="text-gray-600">Retrouvez vos cours et votre progression</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{mesFormations.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-3xl font-bold text-blue-600">
                  {mesFormations.filter(f => f.statut === 'en-cours').length}
                </p>
              </div>
              <Play className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-3xl font-bold text-green-600">
                  {mesFormations.filter(f => f.statut === 'termine').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certificats</p>
                <p className="text-3xl font-bold text-purple-600">
                  {mesFormations.filter(f => f.certificat_disponible).length}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setSelectedTab('toutes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'toutes'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Toutes ({mesFormations.length})
              </button>
              <button
                onClick={() => setSelectedTab('en-cours')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'en-cours'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                En cours ({mesFormations.filter(f => f.statut === 'en-cours').length})
              </button>
              <button
                onClick={() => setSelectedTab('terminees')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'terminees'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Terminées ({mesFormations.filter(f => f.statut === 'termine').length})
              </button>
            </nav>
          </div>
        </div>

        {/* Liste des formations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFormations.map((formation) => (
            <div key={formation.id_form} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header de la carte */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(formation.statut)}
                      <h3 className="text-xl font-bold text-gray-900">
                        {formation.titre_form}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4">{formation.description}</p>
               
                   
                  </div>
                </div>
              </div>

              {/* Contenu de la carte */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{formation.duree_form}h de contenu</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{formation.chapitres_termines}/{formation.chapitres_total} chapitres</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BarChart3 className="w-4 h-4" />
                    <span>Inscrit le {new Date(formation.date_inscription).toLocaleDateString()}</span>
                  </div>
                  {formation.derniere_activite && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Eye className="w-4 h-4" />
                      <span>Vu le {new Date(formation.derniere_activite).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* QCM liés à la formation */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">QCM</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {(qcmsByFormation[formation.id_form]?.length) || 0}
                    </span>
                  </div>
                  {(qcmsByFormation[formation.id_form]?.length > 0) ? (
                    <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                      {qcmsByFormation[formation.id_form].slice(0, 3).map((q) => (
                        <li key={q.id_qcm}>{q.titre_qcm}</li>
                      ))}
                      {qcmsByFormation[formation.id_form].length > 3 && (
                        <li className="text-gray-500">+ {qcmsByFormation[formation.id_form].length - 3} autres</li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Aucun QCM pour cette formation</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleContinuerFormation(formation.id_form)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      Voir le contenu
                    </button>
                    <button
                      onClick={() => {
                        const firstQcm = (qcmsByFormation[formation.id_form] || [])[0];
                        if (firstQcm?.id_qcm) {
                          window.location.href = `/dasboard/apprenant/quiz/${firstQcm.id_qcm}`;
                        }
                      }}
                      disabled={!(qcmsByFormation[formation.id_form]?.length > 0)}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${qcmsByFormation[formation.id_form]?.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Faire un QCM
                    </button>
                    {formation.statut === 'termine' && (
                      <button
                        onClick={() => handleContinuerFormation(formation.id_form)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Revoir
                      </button>
                    )}
                  </div>
                  
                  {formation.certificat_disponible && (
                    <button
                      onClick={() => handleTelechargerCertificat(formation.id_form)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Certificat
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Aucun message si aucune formation (suppression de l'état vide) */}
      </div>
    </div>
  );
}