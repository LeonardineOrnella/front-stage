'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { formationService } from '../../../../../service/formation.service';
import { ArrowLeft, Plus, X, Upload, FileText, Video, File, Save } from 'lucide-react';

export default function EditFormationPage() {
  const router = useRouter();
  const params = useParams();
  const formationId = params.id;
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [formData, setFormData] = useState({
    titre_form: '',
    description: '',
    statut_form: 'Active',
    duree_form: '',
    frais_form: '',
    date_form: '',
    id_categ: '',
    chapitres: []
  });

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, [formationId]);

  const loadData = async () => {
    try {
      setInitialLoading(true);
      const [categoriesData, formationData] = await Promise.all([
        formationService.getCategories(),
        formationService.getFormationById(formationId)
      ]);
      
      setCategories(categoriesData);
      
      // Préparer les données de la formation
      setFormData({
        titre_form: formationData.titre_form || '',
        description: formationData.description || '',
        statut_form: formationData.statut_form || 'Active',
        duree_form: formationData.duree_form || '',
        frais_form: formationData.frais_form || '',
        date_form: formationData.date_form ? formationData.date_form.split('T')[0] : '',
        id_categ: formationData.id_categ || '',
        chapitres: formationData.chapitres || []
      });

      // Si la formation a des fichiers existants, les stocker
      if (formationData.files) {
        setExistingFiles(formationData.files);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      alert('Erreur lors du chargement de la formation');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addChapitre = () => {
    setFormData(prev => ({
      ...prev,
      chapitres: [
        ...prev.chapitres,
        {
          titre_chap: '',
          ordre: prev.chapitres.length + 1,
          type: 'Publié',
          duree: '',
          id_categ: prev.id_categ,
          ressources: []
        }
      ]
    }));
  };

  const updateChapitre = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      chapitres: prev.chapitres.map((chap, i) => 
        i === index ? { ...chap, [field]: value } : chap
      )
    }));
  };

  const addRessource = (chapitreIndex) => {
    setFormData(prev => ({
      ...prev,
      chapitres: prev.chapitres.map((chap, i) => 
        i === chapitreIndex 
          ? { 
              ...chap, 
              ressources: [
                ...chap.ressources,
                { 
                  type: 'pdf', // Type par défaut
                  fileIndex: existingFiles.length + files.length // Index du prochain fichier
                }
              ]
            }
          : chap
      )
    }));
  };

  const updateRessource = (chapitreIndex, ressourceIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      chapitres: prev.chapitres.map((chap, i) => 
        i === chapitreIndex 
          ? {
              ...chap,
              ressources: chap.ressources.map((res, j) => 
                j === ressourceIndex 
                  ? { ...res, [field]: value }
                  : res
              )
            }
          : chap
      )
    }));
  };

  const removeChapitre = (index) => {
    setFormData(prev => ({
      ...prev,
      chapitres: prev.chapitres.filter((_, i) => i !== index)
    }));
  };

  const removeRessource = (chapitreIndex, ressourceIndex) => {
    setFormData(prev => ({
      ...prev,
      chapitres: prev.chapitres.map((chap, i) => 
        i === chapitreIndex 
          ? {
              ...chap,
              ressources: chap.ressources.filter((_, j) => j !== ressourceIndex)
            }
          : chap
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.titre_form.trim()) {
      alert('Le titre de la formation est obligatoire');
      return;
    }
    if (!formData.id_categ) {
      alert('Veuillez sélectionner une catégorie');
      return;
    }
    if (formData.chapitres.length === 0) {
      alert('Veuillez ajouter au moins un chapitre');
      return;
    }

    try {
      setLoading(true);
      
      // Préparer les données pour l'API
      const formationData = {
        ...formData,
        chapitres: formData.chapitres.map((chap, chapIndex) => ({
          ...chap,
          ressources: chap.ressources.map((res, resIndex) => {
            // Pour les fichiers uploadés, on envoie le type et fileIndex
            return {
              type: res.type, // 'pdf' ou 'video'
              fileIndex: res.fileIndex
            };
          })
        }))
      };

      await formationService.updateFormation(formationId, formationData, files);
      alert('Formation mise à jour avec succès !');
      router.push('/dasboard/formation');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour de la formation');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.type && file.type.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    if (file.type && file.type.includes('video')) return <Video className="w-4 h-4 text-blue-500" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const getFileTypeLabel = (file) => {
    if (file.type && file.type.includes('pdf')) return 'PDF';
    if (file.type && file.type.includes('video')) return 'Vidéo';
    return 'Fichier';
  };

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'video': return <Video className="w-4 h-4 text-blue-500" />;
      default: return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const getResourceTypeLabel = (type) => {
    switch (type) {
      case 'pdf': return 'PDF';
      case 'video': return 'Vidéo';
      default: return 'Fichier';
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la formation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifier la Formation</h1>
            <p className="text-gray-600">Modifiez les informations de la formation et ses chapitres</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations de base */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Informations de Base</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de la formation *
              </label>
              <input
                type="text"
                name="titre_form"
                value={formData.titre_form}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Formation React Avancé"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                name="id_categ"
                value={formData.id_categ}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(cat => (
                  <option key={cat.id_categ} value={cat.id_categ}>{cat.nom_categ}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                name="statut_form"
                value={formData.statut_form}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Brouillon">Brouillon</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée (heures)
              </label>
              <input
                type="number"
                name="duree_form"
                value={formData.duree_form}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frais (€)
              </label>
              <input
                type="number"
                step="0.01"
                name="frais_form"
                value={formData.frais_form}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 299.99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de formation
              </label>
              <input
                type="date"
                name="date_form"
                value={formData.date_form}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Décrivez le contenu et les objectifs de cette formation..."
            />
          </div>
        </div>

        {/* Fichiers existants */}
        {existingFiles.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Fichiers Existants</h2>
            <div className="space-y-2">
              {existingFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file)}
                    <div>
                      <p className="font-medium text-gray-900">{file.name || `Fichier ${index + 1}`}</p>
                      <p className="text-sm text-gray-500">
                        {getFileTypeLabel(file)} • Fichier existant
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">Index: {index}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ajout de nouveaux fichiers */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Ajouter de Nouveaux Fichiers</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ajouter des fichiers (PDF, Vidéos)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.mp4,.avi,.mov,.mkv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium text-blue-600">Cliquez pour sélectionner</span> ou glissez-déposez
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, MP4, AVI, MOV, MKV (max 100MB par fichier)
                  </p>
                </label>
              </div>
            </div>

            {/* Liste des nouveaux fichiers sélectionnés */}
            {files.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Nouveaux fichiers sélectionnés</h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {getFileTypeLabel(file)} • {(file.size / 1024 / 1024).toFixed(2)} MB • Index: {existingFiles.length + index}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gestion des chapitres */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Chapitres de la Formation</h2>
            <button
              type="button"
              onClick={addChapitre}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un chapitre</span>
            </button>
          </div>

          {formData.chapitres.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun chapitre trouvé. Ajoutez votre premier chapitre.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.chapitres.map((chapitre, chapitreIndex) => (
                <div key={chapitreIndex} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Chapitre {chapitre.ordre}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeChapitre(chapitreIndex)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Supprimer le chapitre
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre du chapitre
                      </label>
                      <input
                        type="text"
                        value={chapitre.titre_chap}
                        onChange={(e) => updateChapitre(chapitreIndex, 'titre_chap', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Introduction à React"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ordre
                      </label>
                      <input
                        type="number"
                        value={chapitre.ordre}
                        onChange={(e) => updateChapitre(chapitreIndex, 'ordre', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durée
                      </label>
                      <input
                        type="text"
                        value={chapitre.duree}
                        onChange={(e) => updateChapitre(chapitreIndex, 'duree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 2h30"
                      />
                    </div>
                  </div>

                  {/* Ressources du chapitre */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">Ressources du chapitre</h4>
                      <button
                        type="button"
                        onClick={() => addRessource(chapitreIndex)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center space-x-2 transition-colors"
                      >
                        <File className="w-4 h-4" />
                        <span>Ajouter une ressource</span>
                      </button>
                    </div>

                    {chapitre.ressources.length === 0 ? (
                      <p className="text-gray-500 text-sm">Aucune ressource ajoutée à ce chapitre.</p>
                    ) : (
                      <div className="space-y-3">
                        {chapitre.ressources.map((ressource, ressourceIndex) => (
                          <div key={ressourceIndex} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                {getResourceTypeIcon(ressource.type)}
                                <span className="text-sm font-medium text-gray-700">
                                  Ressource {ressourceIndex + 1}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeRessource(chapitreIndex, ressourceIndex)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Supprimer
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Type de ressource *
                                </label>
                                <select
                                  value={ressource.type}
                                  onChange={(e) => updateRessource(chapitreIndex, ressourceIndex, 'type', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                >
                                  <option value="pdf">PDF</option>
                                  <option value="video">Vidéo</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Index du fichier *
                                </label>
                                <select
                                  value={ressource.fileIndex}
                                  onChange={(e) => updateRessource(chapitreIndex, ressourceIndex, 'fileIndex', parseInt(e.target.value))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required
                                >
                                  <option value="">Sélectionner un fichier</option>
                                  {/* Fichiers existants */}
                                  {existingFiles.map((file, fileIndex) => (
                                    <option key={`existing-${fileIndex}`} value={fileIndex}>
                                      {file.name || `Fichier ${fileIndex + 1}`} ({getFileTypeLabel(file)}) - Existant
                                    </option>
                                  ))}
                                  {/* Nouveaux fichiers */}
                                  {files.map((file, fileIndex) => (
                                    <option key={`new-${fileIndex}`} value={existingFiles.length + fileIndex}>
                                      {file.name} ({getFileTypeLabel(file)}) - Nouveau
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>Note :</strong> Cette ressource utilisera le fichier à l'index {ressource.fileIndex} 
                                et sera traitée comme un fichier {getResourceTypeLabel(ressource.type)} par le backend.
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Mise à jour...' : 'Mettre à jour'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
