"use client";
import React, { useState } from 'react';
import { X, Clock, BookOpen, FileText, Play, Download, Eye } from 'lucide-react';

export default function FormationDetail({ formation, onClose }) {
  const [selectedChapter, setSelectedChapter] = useState(null);

  if (!formation) return null;

  const getImageUrl = (imagePath) => {
    if (imagePath && imagePath.startsWith('/uploads')) {
      return `http://localhost:3001${imagePath}`;
    }
    return null;
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500 resource-icon" />;
      case 'video':
        return <Play className="w-5 h-5 text-blue-500 resource-icon" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500 resource-icon" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const imageUrl = getImageUrl(formation.image_couverture);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 detail-modal">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar detail-content">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {formation.titre_form}
            </h2>
            <p className="text-gray-600">{formation.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors action-button"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Image de couverture */}
        {imageUrl && (
          <div className="p-6 border-b border-gray-200">
            <img
              src={imageUrl}
              alt={formation.titre_form}
              className="w-full h-64 object-cover rounded-xl"
            />
          </div>
        )}

        {/* Informations générales */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-500">Durée totale</p>
                <p className="font-semibold">{formation.duree_form} heures</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-500">Chapitres</p>
                <p className="font-semibold">{formation.chapitres ? formation.chapitres.length : 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-500">Ressources</p>
                <p className="font-semibold">
                  {formation.chapitres ? 
                    formation.chapitres.reduce((total, chapitre) => {
                      return total + (chapitre.ressources ? chapitre.ressources.length : 0);
                    }, 0) : 0
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chapitres */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Contenu de la formation</h3>
          <div className="space-y-4">
            {formation.chapitres && formation.chapitres.map((chapitre, index) => (
              <div key={chapitre.id_chap} className="border border-gray-200 rounded-lg p-4 chapter-item">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setSelectedChapter(selectedChapter === chapitre.id_chap ? null : chapitre.id_chap)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{chapitre.titre_chap}</h4>
                      <p className="text-sm text-gray-500">{chapitre.duree} • {chapitre.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {chapitre.ressources && chapitre.ressources.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {chapitre.ressources.length} ressource{chapitre.ressources.length > 1 ? 's' : ''}
                      </span>
                    )}
                    <BookOpen className={`w-5 h-5 text-gray-400 transition-transform ${
                      selectedChapter === chapitre.id_chap ? 'rotate-90' : ''
                    }`} />
                  </div>
                </div>

                {/* Ressources du chapitre */}
                {selectedChapter === chapitre.id_chap && chapitre.ressources && chapitre.ressources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Ressources disponibles :</h5>
                    <div className="space-y-2">
                      {chapitre.ressources.map((ressource) => (
                        <div key={ressource.id_res} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg resource-item">
                          <div className="flex items-center space-x-3">
                            {getResourceIcon(ressource.type)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {ressource.nom_fichier}
                              </p>
                              <p className="text-xs text-gray-500">
                                {ressource.type.toUpperCase()} • {formatFileSize(ressource.taille_fichier)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors action-button" title="Voir">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors action-button" title="Télécharger">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer avec prix et inscription */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Prix de la formation</p>
              <p className="text-3xl font-bold text-emerald-600">
                {parseFloat(formation.frais_form).toFixed(2)}€
              </p>
            </div>
            <button className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 action-button">
              S'inscrire maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
