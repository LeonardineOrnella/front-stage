'use client';

import { useState, useEffect } from 'react';
import { transactionService, PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '@/service/transaction.service';
import { userService } from '@/service/user.service';
import { useNotification } from '@/hooks/useNotification';

const PaymentModal = ({ isOpen, onClose, formation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS.CARTE_BANCAIRE);
  const [user, setUser] = useState(null);
  const { showNotification } = useNotification();

  // Récupérer les informations de l'utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userService.getMe();
        setUser(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      }
    };
    
    if (isOpen) {
      fetchUser();
    }
  }, [isOpen]);

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showNotification('Erreur: Utilisateur non connecté', 'error');
      return;
    }

    setLoading(true);
    
    try {
      // Empêcher la double inscription
      try {
        const hasAccess = await transactionService.checkFormationAccess(formation.id_form, user.id);
        if (hasAccess) {
          showNotification('Vous êtes déjà inscrit à cette formation', 'info');
          onClose();
          // Rediriger vers le contenu
          if (typeof window !== 'undefined') {
            window.location.href = `/dasboard/apprenant/formation/${formation.id_form}/contenu`;
          }
          return;
        }
      } catch {}

      const transactionData = {
        formationId: formation.id_form,
        userId: user.id,
        frais_form: formation.frais_form,
        methode_paiement: selectedMethod
      };

      const response = await transactionService.inscriptionFormation(transactionData);
      
      showNotification('Transaction créée avec succès! En attente de validation.', 'success');
      
      // Appeler la fonction de succès avec les détails de la transaction
      if (onSuccess) {
        onSuccess(response.data.data);
      }
      
      onClose();
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la création de la transaction';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Inscription à la formation
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Formation Info */}
        <div className="p-6 bg-gray-50">
          <div className="flex items-start space-x-4">
            {formation.image_couverture && (
              <img
                src={`http://localhost:3001/uploads/couvertures/${formation.image_couverture}`}
                alt={formation.titre_form}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">{formation.titre_form}</h4>
              <p className="text-sm text-gray-600 mb-2">{formation.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Durée: {formation.duree_form}</span>
                <span className="text-lg font-bold text-blue-600">
                  {formation.frais_form ? `${formation.frais_form} €` : 'Gratuit'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePayment} className="p-6">
          {/* User Info */}
          {user && (
            <div className="mb-6">
              <h5 className="font-medium text-gray-900 mb-3">Informations de l'apprenant</h5>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Nom:</span> {user.nom} {user.prenom}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="mb-6">
            <h5 className="font-medium text-gray-900 mb-3">Méthode de paiement</h5>
            <div className="space-y-3">
              {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={selectedMethod === value}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    {value === PAYMENT_METHODS.CARTE_BANCAIRE && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM2 10v4a2 2 0 002 2h12a2 2 0 002-2v-4H2z"/>
                      </svg>
                    )}
                    {value === PAYMENT_METHODS.VIREMENT && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm5 5a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2zm3 0a1 1 0 100-2 1 1 0 000 2z"/>
                      </svg>
                    )}
                    {value === PAYMENT_METHODS.MOBILE_MONEY && (
                      <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {PAYMENT_METHOD_LABELS[value]}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Total à payer:</span>
              <span className="text-xl font-bold text-blue-600">
                {formation.frais_form ? `${formation.frais_form} €` : '0 €'}
              </span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h6 className="font-medium text-yellow-800 mb-1">Information importante</h6>
                <p className="text-sm text-yellow-700">
                  Votre transaction sera créée avec le statut "En attente". 
                  Un administrateur validera votre paiement sous 24-48h.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !formation.frais_form}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement...
                </div>
              ) : (
                `Payer ${formation.frais_form} €`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
