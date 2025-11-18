'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formationService } from '../../../../service/formation.service';
import { ArrowLeft, Plus, X, Upload, FileText, Video, File, Image, Trash2 } from 'lucide-react';
import ConfirmModal from '../../../../components/backoOffice/ConfirmModal';

export default function CreateFormationPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [imageCouverture, setImageCouverture] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });
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

  // Charger les catégories au montage
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await formationService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      alert('Erreur lors du chargement des catégories');
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

  const handleImageCouvertureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Image de couverture invalide');
        return;
      }
      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image trop volumineuse (max 5 Mo)');
        return;
      }
      setImageCouverture(file);
    }
  };

  const removeImageCouverture = () => {
    setImageCouverture(null);
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
                  fileIndex: '' // Sera sélectionné par l'utilisateur
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
    const chapitre = formData.chapitres[index];
    setConfirmState({
      open: true,
      title: 'Supprimer le chapitre',
      message: `Voulez-vous supprimer le chapitre « ${chapitre.titre_chap || `Chapitre ${chapitre.ordre}`} » ?`,
      onConfirm: () => {
    setFormData(prev => ({
      ...prev,
      chapitres: prev.chapitres.filter((_, i) => i !== index)
    }));
        setConfirmState((s)=>({ ...s, open:false }));
      }
    });
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
      alert('Le titre de la formation est requis');
      return;
    }
    if (!formData.id_categ) {
      alert('La catégorie est requise');
      return;
    }
    if (formData.chapitres.length === 0) {
      alert('Ajoutez au moins un chapitre');
      return;
    }

    try {
      setLoading(true);
      
      // Créer FormData pour l'envoi des fichiers
      const formDataToSend = new FormData();
      
      // Ajouter l'image de couverture si elle existe
      if (imageCouverture) {
        formDataToSend.append('image_couverture', imageCouverture);
      }
      
      // Ajouter les fichiers de ressources
      files.forEach((file, index) => {
        formDataToSend.append('ressources', file);
      });
      
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
      
      // Ajouter les données de formation
      formDataToSend.append('formation', JSON.stringify(formationData));

      await formationService.createFormation(formDataToSend);
      alert('Formation créée avec succès');
      router.push('/dasboard/formation');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.type.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
    if (file.type.includes('video')) return <Video className="w-4 h-4 text-blue-500" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const getFileTypeLabel = (file) => {
    if (file.type.includes('pdf')) return 'PDF';
    if (file.type.includes('video')) return 'Vidéo';
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
            <h1 className="text-3xl font-bold text-gray-900">Créer une formation</h1>
            <p className="text-gray-600">Renseignez les informations de base et les chapitres</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations de base */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Informations de base</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Intitulé de la formation *</label>
              <input
                type="text"
                name="titre_form"
                value={formData.titre_form}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={'Ex. Initiation à JavaScript'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée (heures)</label>
              <input
                type="number"
                name="duree_form"
                value={formData.duree_form}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={'ex. 12'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frais (€)</label>
              <input
                type="number"
                step="0.01"
                name="frais_form"
                value={formData.frais_form}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={'ex. 99.00'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                name="date_form"
                value={formData.date_form}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={'Décrivez brièvement votre formation'}
            />
          </div>
        </div>

        {/* Image de couverture */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Image de couverture</h2>
          
          <div className="space-y-4">
            {!imageCouverture ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageCouvertureChange}
                  className="hidden"
                  id="image-couverture-upload"
                />
                <label htmlFor="image-couverture-upload" className="cursor-pointer">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2"><span className="font-medium text-blue-600">Cliquez pour choisir</span> une image</p>
                  <p className="text-sm text-gray-500">PNG/JPG, 5 Mo max</p>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Image className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900">{imageCouverture.name}</p>
                    <p className="text-sm text-gray-500">
                      {(imageCouverture.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeImageCouverture}
                  className="p-2 hover:bg-red-100 rounded text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        

        {/* Gestion des chapitres */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Chapitres</h2>
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
              <p>Aucun chapitre pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.chapitres.map((chapitre, chapitreIndex) => (
                <div key={chapitreIndex} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Chapitre {chapitre.ordre}</h3>
                    <button
                      type="button"
                      onClick={() => removeChapitre(chapitreIndex)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                      <input
                        type="text"
                        value={chapitre.titre_chap}
                        onChange={(e) => updateChapitre(chapitreIndex, 'titre_chap', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={'Ex. Introduction'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ordre</label>
                      <input
                        type="number"
                        value={chapitre.ordre}
                        onChange={(e) => updateChapitre(chapitreIndex, 'ordre', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Durée</label>
                      <input
                        type="text"
                        value={chapitre.duree}
                        onChange={(e) => updateChapitre(chapitreIndex, 'duree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={'ex. 2h30'}
                      />
                    </div>
                  </div>

                  {/* Ressources du chapitre */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">Ressources</h4>
                      <div className="flex items-center gap-2">
                        <label className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center space-x-2 transition-colors cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>Importer un fichier</span>
                          <input
                            type="file"
                            accept=".pdf,.mp4,.avi,.mov,.mkv"
                            onChange={handleFileChange}
                            className="hidden"
                            multiple
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => addRessource(chapitreIndex)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center space-x-2 transition-colors"
                        >
                          <File className="w-4 h-4" />
                          <span>Ajouter une ressource</span>
                        </button>
                      </div>
                    </div>

                    {/* Liste des fichiers importés */}
                    {files.length > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Fichiers importés ({files.length})</p>
                        <div className="space-y-1">
                          {files.map((file, fileIndex) => (
                            <div key={fileIndex} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                {getFileIcon(file)}
                                <span className="text-gray-700">{file.name}</span>
                                <span className="text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(fileIndex)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lien Drive/URL (optionnel) au niveau du chapitre - affiché une seule fois */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lien Drive/URL (optionnel)</label>
                      <input
                        type="url"
                        value={chapitre.lien || ''}
                        onChange={(e) => updateChapitre(chapitreIndex, 'lien', e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Lien vers des ressources externes</p>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fichier *</label>
                                {files.length === 0 ? (
                                  <div className="w-full px-3 py-2 border border-yellow-300 rounded-md bg-yellow-50 text-yellow-800 text-sm">
                                    Aucun fichier importé. Cliquez sur "Importer un fichier" ci-dessus.
                                  </div>
                                ) : (
                                  <select
                                    value={ressource.fileIndex !== undefined && ressource.fileIndex !== null && ressource.fileIndex !== '' ? ressource.fileIndex : ''}
                                    onChange={(e) => updateRessource(chapitreIndex, ressourceIndex, 'fileIndex', e.target.value === '' ? undefined : parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  >
                                    <option value="">Sélectionner un fichier importé</option>
                                    {files.map((file, fileIndex) => (
                                      <option key={fileIndex} value={fileIndex}>
                                        {file.name} ({getFileTypeLabel(file)})
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>

                            </div>
                            

                            {ressource.fileIndex !== undefined && ressource.fileIndex !== null && ressource.fileIndex !== '' && typeof ressource.fileIndex === 'number' && files[ressource.fileIndex] ? (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  <strong>Fichier sélectionné : </strong>{files[ressource.fileIndex].name} 
                                  ({getFileTypeLabel(files[ressource.fileIndex])}) - 
                                  {(files[ressource.fileIndex].size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            ) : null}
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? 'Création…' : 'Créer'}
          </button>
        </div>
      </form>
      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((s)=>({ ...s, open:false }))}
      />
    </div>
  );
}
