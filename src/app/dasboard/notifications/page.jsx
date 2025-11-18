'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/backoOffice/student/UserContext';
import { messageService } from '@/service/message.service';
import { useNotification } from '@/hooks/useNotification';
import { 
  Bell, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Mail, 
  MailOpen, 
  Filter,
  RefreshCw,
  User,
  Clock,
  Search,
  MessageSquare
} from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { showSuccess, showError } = useNotification();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);

  // Charger les notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await messageService.getAllReceivedMessages();
      if (response.data.success) {
        setNotifications(response.data.data || []);
      } else {
        showError('Erreur lors du chargement des notifications');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      showError('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Filtrer les notifications
  useEffect(() => {
    let filtered = [...notifications];

    // Filtrer par statut (lu/non lu)
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.is_read);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.content?.toLowerCase().includes(query) ||
        `${n.sender_nom || ''} ${n.sender_prenom || ''}`.toLowerCase().includes(query) ||
        n.sender_email?.toLowerCase().includes(query)
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter, searchQuery]);

  // Marquer comme lu
  const markAsRead = async (messageId) => {
    try {
      await messageService.markAsRead(messageId);
      setNotifications(prev => 
        prev.map(n => n.id === messageId ? { ...n, is_read: 1 } : n)
      );
      showSuccess('Notification marquée comme lue');
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors du marquage de la notification');
    }
  };

  // Marquer plusieurs comme lus
  const markMultipleAsRead = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      await messageService.markMultipleAsRead(selectedIds);
      setNotifications(prev => 
        prev.map(n => selectedIds.includes(n.id) ? { ...n, is_read: 1 } : n)
      );
      setSelectedIds([]);
      setIsSelecting(false);
      showSuccess(`${selectedIds.length} notification(s) marquée(s) comme lue(s)`);
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors du marquage des notifications');
    }
  };

  // Supprimer une notification
  const deleteNotification = async (messageId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      return;
    }

    try {
      await messageService.deleteMessage(messageId);
      setNotifications(prev => prev.filter(n => n.id !== messageId));
      setSelectedIds(prev => prev.filter(id => id !== messageId));
      showSuccess('Notification supprimée');
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors de la suppression de la notification');
    }
  };

  // Supprimer plusieurs notifications
  const deleteMultiple = async () => {
    if (selectedIds.length === 0) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} notification(s) ?`)) {
      return;
    }

    try {
      await Promise.all(selectedIds.map(id => messageService.deleteMessage(id)));
      setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setSelectedIds([]);
      setIsSelecting(false);
      showSuccess(`${selectedIds.length} notification(s) supprimée(s)`);
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur lors de la suppression des notifications');
    }
  };

  // Toggle sélection
  const toggleSelect = (messageId) => {
    setSelectedIds(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  // Sélectionner tout
  const selectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Obtenir le nom de l'expéditeur
  const getSenderName = (notification) => {
    if (notification.sender_nom || notification.sender_prenom) {
      return `${notification.sender_prenom || ''} ${notification.sender_nom || ''}`.trim();
    }
    return notification.sender_email || 'Expéditeur inconnu';
  };

  // Obtenir le rôle de l'expéditeur
  const getSenderRole = (notification) => {
    const role = notification.sender_role;
    if (role === 'system') return 'Système';
    if (role === 'admin') return 'Administrateur';
    if (role === 'formateur') return 'Formateur';
    if (role === 'apprenant') return 'Apprenant';
    return role || 'Utilisateur';
  };

  // Rediriger vers la discussion avec l'apprenant
  const openDiscussion = async (notification) => {
    const senderId = notification.sender_id;
    
    // Si c'est un message système, ne pas rediriger
    if (!senderId || notification.sender_role === 'system') {
      return;
    }

    // Marquer comme lu si non lu
    if (!notification.is_read) {
      try {
        await messageService.markAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: 1 } : n)
        );
      } catch (error) {
        console.error('Erreur lors du marquage comme lu:', error);
      }
    }

    // Rediriger vers la page de progression avec l'apprenant sélectionné
    // On passe l'ID de l'apprenant dans l'URL pour ouvrir directement la discussion
    router.push(`/dasboard/formateur/progression?learnerId=${senderId}`);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.filter(n => n.is_read).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Bell className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500">
                {notifications.length} notification(s) • {unreadCount} non lue(s)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadNotifications}
              disabled={loading}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Actualiser"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {isSelecting && selectedIds.length > 0 && (
              <>
                <button
                  onClick={markMultipleAsRead}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                >
                  Marquer comme lu ({selectedIds.length})
                </button>
                <button
                  onClick={deleteMultiple}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Supprimer ({selectedIds.length})
                </button>
              </>
            )}
            <button
              onClick={() => {
                setIsSelecting(!isSelecting);
                setSelectedIds([]);
              }}
              className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                isSelecting 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isSelecting ? 'Annuler' : 'Sélectionner'}
            </button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
                filter === 'unread'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Mail className="w-4 h-4" />
              Non lues ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
                filter === 'read'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MailOpen className="w-4 h-4" />
              Lues ({readCount})
            </button>
          </div>
        </div>
      </div>

      {/* Liste des notifications */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchQuery || filter !== 'all' 
              ? 'Aucune notification ne correspond à vos critères' 
              : 'Aucune notification'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Sélectionner tout */}
          {isSelecting && (
            <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={selectAll}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">
                  {selectedIds.length === filteredNotifications.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                </span>
              </label>
              <span className="text-sm text-gray-500">
                {selectedIds.length} sélectionnée(s)
              </span>
            </div>
          )}

          {/* Notifications */}
          {filteredNotifications.map((notification) => {
            const isMessageFromApprenant = notification.sender_role === 'apprenant' && notification.sender_id;
            
            return (
            <div
              key={notification.id}
              className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all ${
                !notification.is_read 
                  ? 'border-l-4 border-l-emerald-500 bg-emerald-50/30' 
                  : 'border-gray-200'
                } ${selectedIds.includes(notification.id) ? 'ring-2 ring-emerald-500' : ''} ${
                  isMessageFromApprenant ? 'cursor-pointer' : ''
                }`}
                onClick={(e) => {
                  // Ne pas déclencher le clic si on clique sur un bouton ou checkbox
                  if (e.target.closest('button') || e.target.closest('input')) {
                    return;
                  }
                  if (isMessageFromApprenant) {
                    openDiscussion(notification);
                  }
                }}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox de sélection */}
                {isSelecting && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(notification.id)}
                    onChange={() => toggleSelect(notification.id)}
                      onClick={(e) => e.stopPropagation()}
                    className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                )}

                {/* Icône */}
                <div className={`p-2 rounded-full ${
                  !notification.is_read 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {!notification.is_read ? (
                    <Mail className="w-5 h-5" />
                  ) : (
                    <MailOpen className="w-5 h-5" />
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {getSenderName(notification)}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {getSenderRole(notification)}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap break-words">
                        {notification.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(notification.created_at)}
                      </div>
                        {isMessageFromApprenant && (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <MessageSquare className="w-3 h-3" />
                            <span className="font-medium">Cliquez pour répondre</span>
                          </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {isMessageFromApprenant && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDiscussion(notification);
                            }}
                            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                            title="Ouvrir la discussion"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Répondre
                          </button>
                        )}
                      {!notification.is_read && (
                        <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Marquer comme lu"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

