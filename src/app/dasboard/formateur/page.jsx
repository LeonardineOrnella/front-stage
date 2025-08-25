'use client'
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Search, X, Save, Users, Phone, Mail } from 'lucide-react';
import { userService } from '@/service/user.service';
import { toast } from 'react-toastify';

const Formateur = () => {
  const [formateurs, setFormateurs] = useState([]);
  const [filteredFormateurs, setFilteredFormateurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFormateur, setEditingFormateur] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mdp: '',
    role: 'formateur',
    specialite: ''
  });

  // Exemple de données
  useEffect(() => {
    const formateursExemples = [
      {
        id: 1,
        nom: 'Jean Martin',
        email: 'jean.martin@example.com',
        telephone: '034 12 345 67',
        specialite: 'JavaScript / React',
        statut: 'Actif',
        nbFormations: 5
      },
      {
        id: 2,
        nom: 'Sophie Bernard',
        email: 'sophie.bernard@example.com',
        telephone: '032 45 678 90',
        specialite: 'Bases de données',
        statut: 'Inactif',
        nbFormations: 3
      }
    ];
    setFormateurs(formateursExemples);
    setFilteredFormateurs(formateursExemples);
  }, []);

  // Filtrage
  useEffect(() => {
    const filtered = formateurs.filter(f =>
      f.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.specialite.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFormateurs(filtered);
  }, [formateurs, searchTerm]);

  const openModal = (formateur = null) => {
    if (formateur) {
      setEditingFormateur(formateur);
      setFormData(formateur);
    } else {
      setEditingFormateur(null);
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        mdp: '',
        role: 'formateur',
        specialite: '',

      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFormateur(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.nom || !formData.email || !formData.specialite) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    if (editingFormateur) {
      setFormateurs(prev => prev.map(f =>
        f.id === editingFormateur.id ? { ...formData, id: editingFormateur.id } : f
      ));
    } else {

      //setFormateurs(prev => [...prev, { ...formData, id: Date.now() }]);
      console.log(formData);
      userService.register(formData).then(res=>{
        console.log(res);
        toast.success(res.data.message)
        closeModal();
        
      }).catch(err=>{
        console.log(err);
        
      })

    }

  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer ce formateur ?')) {
      setFormateurs(prev => prev.filter(f => f.id !== id));
    }
  };

  const getStatutColor = (statut) => {
    return statut === 'Actif'
      ? 'bg-green-100 text-green-700 border border-green-300'
      : 'bg-red-100 text-red-700 border border-red-300';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Gestion des Formateurs</h1>
          <p className="text-gray-600">Administrez vos formateurs avec une interface moderne</p>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un formateur..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-5 h-5" />
            Nouveau Formateur
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-6 rounded-2xl shadow-md">
            <p className="text-gray-500 text-sm">Total</p>
            <p className="text-3xl font-bold text-gray-900">{formateurs.length}</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-6 rounded-2xl shadow-md">
            <p className="text-gray-500 text-sm">Actifs</p>
            <p className="text-3xl font-bold text-green-600">{formateurs.filter(f => f.statut === 'Actif').length}</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-6 rounded-2xl shadow-md">
            <p className="text-gray-500 text-sm">Inactifs</p>
            <p className="text-3xl font-bold text-red-600">{formateurs.filter(f => f.statut === 'Inactif').length}</p>
          </motion.div>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Nom</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Spécialité</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFormateurs.map((f) => (
                <motion.tr
                  key={f.id}
                  className="border-b hover:bg-gray-50 transition"
                  whileHover={{ scale: 1.01 }}
                >
                  <td className="py-4 px-6 font-medium">{f.nom}</td>
                  <td className="py-4 px-6  items-center gap-2 text-gray-600 ">{f.email}</td>

                  <td className="py-4 px-6 text-gray-700">{f.specialite}</td>

                  <td className="py-4 px-6 text-gray-800">{f.nbFormations}</td>
                  <td className="py-4 px-6 flex gap-2">
                    <button onClick={() => openModal(f)} className="text-blue-600 hover:text-blue-800">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(f.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredFormateurs.length === 0 && (
            <div className="text-center py-8 text-gray-500">Aucun formateur trouvé</div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
            >
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h2 className="text-xl font-bold text-gray-900">{editingFormateur ? 'Modifier' : 'Nouveau'} Formateur</h2>
                <button onClick={closeModal}><X className="w-6 h-6 text-gray-500" /></button>
              </div>

              <div className="space-y-4">
                <input type="text" name="nom" placeholder="Nom " value={formData.nom} onChange={handleInputChange} className="w-full border px-3 py-2 rounded-lg" />
                <input type="text" name="prenom" placeholder="Prénom " value={formData.prenom} onChange={handleInputChange} className="w-full border px-3 py-2 rounded-lg" />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="w-full border px-3 py-2 rounded-lg" />
                <input type="password" name="mdp" placeholder="Mot de passe" value={formData.mdp} onChange={handleInputChange} className="w-full border px-3 py-2 rounded-lg" />
                <input type="text" name="specialite" placeholder="Spécialité" value={formData.specialite} onChange={handleInputChange} className="w-full border px-3 py-2 rounded-lg" />

              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Annuler</button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex gap-2 items-center hover:bg-blue-700">
                  {editingFormateur ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Formateur;
