'use client';

import { useEffect } from 'react';

export default function ConfirmModal({ open, title, message, confirmText = 'Confirmer', cancelText = 'Annuler', onConfirm, onCancel, confirmButtonClass = 'bg-red-600 hover:bg-red-700 text-white', cancelButtonClass = 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50' }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && open) {
        onCancel?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-gray-700">{message}</p>
        </div>
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
          <button onClick={onCancel} className={`px-4 py-2 rounded-lg transition-colors ${cancelButtonClass}`}>{cancelText}</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-lg transition-colors ${confirmButtonClass}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}


