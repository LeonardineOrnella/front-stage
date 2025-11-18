"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Plus, Clock, User, Reply, Send, Smile, Paperclip, Search, Moon, Sun, Heart, ThumbsUp, Laugh, Users, X } from "lucide-react";
import { formateurService } from "@/service/formateur.service";
import { messageService } from "@/service/message.service";
import { toast } from "react-toastify";
 

export default function Page() {
  const locale = 'fr-FR';
  const tr = (_key, fallback) => fallback;
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showReactions, setShowReactions] = useState(null);
  const [showFormateurSelector, setShowFormateurSelector] = useState(false);
  const [formateurs, setFormateurs] = useState([]);
  const [selectedFormateur, setSelectedFormateur] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Charger les conversations depuis les messages reçus et envoyés
  const loadConversations = async (formateursList) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = currentUser.id;
      
      // Charger tous les messages reçus ET envoyés pour construire la liste des conversations
      const [receivedResponse, sentResponse] = await Promise.all([
        messageService.getAllReceivedMessages().catch(() => ({ data: { data: [] } })),
        // Pour les messages envoyés, on doit utiliser une autre méthode ou charger toutes les conversations
        // Pour l'instant, on se base sur les messages reçus et on complète avec les formateurs
        Promise.resolve({ data: { data: [] } })
      ]);
      
      const receivedMessages = receivedResponse.data?.data || receivedResponse.data || [];
      
      // Grouper par formateur (sender_id pour reçus, receiver_id pour envoyés)
      const conversationsMap = new Map();
      
      // Traiter les messages reçus
      for (const msg of receivedMessages) {
        const formateurId = msg.sender_id;
        if (!formateurId) continue; // Ignorer les messages système
        
        if (!conversationsMap.has(formateurId)) {
          const formateur = formateursList.find(f => f.id === formateurId);
          conversationsMap.set(formateurId, {
            id: formateurId,
            participantId: formateurId,
            participantName: formateur 
              ? `${formateur.prenom || ''} ${formateur.nom || ''}`.trim() || 'Formateur'
              : `${msg.sender_prenom || ''} ${msg.sender_nom || ''}`.trim() || 'Formateur',
            participantRole: "Formateur",
            lastMessage: msg.content || '',
            lastActivity: msg.created_at || new Date().toISOString(),
            unreadCount: msg.is_read === 0 ? 1 : 0,
            messages: []
          });
        } else {
          const conv = conversationsMap.get(formateurId);
          if (new Date(msg.created_at) > new Date(conv.lastActivity)) {
            conv.lastMessage = msg.content || '';
            conv.lastActivity = msg.created_at;
          }
          if (msg.is_read === 0) {
            conv.unreadCount += 1;
          }
        }
      }
      
      // Pour chaque formateur, charger les messages pour voir s'il y a des conversations
      // On va charger les conversations via getConversationMessages pour chaque formateur
      // Mais pour éviter trop d'appels, on se contente des messages reçus pour l'instant
      // Les messages envoyés seront chargés quand on ouvre la conversation
      
      const conversationsList = Array.from(conversationsMap.values());
      setConversations(conversationsList);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des conversations:', error);
      setConversations([]);
    }
  };

  // Charger les messages d'une conversation
  const loadMessages = async (formateurId) => {
    if (!formateurId) return;
    
    try {
      setLoadingMessages(true);
      const response = await messageService.getConversationMessages(formateurId);
      const apiMessages = response.data?.data || response.data || [];
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserName = `${currentUser.prenom || ''} ${currentUser.nom || ''}`.trim() || 'Utilisateur';
      
      // Transformer les messages au format attendu
      const formattedMessages = apiMessages.map(msg => {
        const isFromFormateur = msg.sender_id === formateurId;
        const senderName = isFromFormateur 
          ? `${msg.sender_prenom || ''} ${msg.sender_nom || ''}`.trim() || 'Formateur'
          : currentUserName;
        
        return {
          id: msg.id,
          content: msg.content || msg.message,
          author: senderName,
          authorRole: isFromFormateur ? 'Formateur' : 'Apprenant',
          createdAt: msg.created_at || msg.timestamp || new Date().toISOString(),
          isRead: msg.is_read === 1,
          reactions: {}
        };
      });
      
      // Mettre à jour la conversation dans la liste
      setConversations(prevConversations => {
        return prevConversations.map(c => {
          if (c.participantId === formateurId) {
            const updated = {
              ...c,
              messages: formattedMessages
            };
            // Mettre à jour aussi la conversation sélectionnée si c'est celle-ci
            if (selectedConversation?.participantId === formateurId) {
              setSelectedConversation(updated);
            }
            return updated;
          }
          return c;
        });
      });
    } catch (error) {
      console.error('❌ Erreur lors du chargement des messages:', error);
      toast.error('Impossible de charger les messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Charger les conversations et formateurs depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les formateurs
        console.log('🔍 Chargement des formateurs...');
        const formateursData = await formateurService.getAllFormateurs();
        console.log('📋 Formateurs récupérés:', formateursData);
        setFormateurs(formateursData);
        
        // Charger les conversations avec la liste des formateurs
        await loadConversations(formateursData);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        setConversations([]);
        setFormateurs([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (selectedConversation?.participantId && selectedConversation.messages.length === 0) {
      loadMessages(selectedConversation.participantId);
    }
  }, [selectedConversation?.participantId]);


  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setIsTyping(false);
    setSendingMessage(true);

    try {
      // Envoyer le message via l'API
      const response = await messageService.sendMessage({
        receiver_id: selectedConversation.participantId,
        content: messageContent,
        message_type: 'text'
      });

      const sentMessage = response.data?.data || response.data;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserName = `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur';

      // Ajouter le message à la conversation locale
      const newMessageObj = {
        id: sentMessage.id || Date.now(),
        content: messageContent,
        author: currentUserName,
      authorRole: "Apprenant",
        createdAt: sentMessage.created_at || new Date().toISOString(),
      isRead: false,
      reactions: {}
    };

    const updatedConversation = {
      ...selectedConversation,
        messages: [...selectedConversation.messages, newMessageObj],
        lastMessage: messageContent,
      lastActivity: new Date().toISOString(),
      unreadCount: 0
    };

    setSelectedConversation(updatedConversation);
      setConversations(conversations.map(c => 
        c.participantId === selectedConversation.participantId ? updatedConversation : c
      ));

      toast.success('Message envoyé avec succès');
    
    // Auto-scroll vers le bas
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
      toast.error('Impossible d\'envoyer le message');
      setNewMessage(messageContent); // Restaurer le message en cas d'erreur
    } finally {
      setSendingMessage(false);
    }
  };

  const startNewConversation = () => {
    setShowFormateurSelector(true);
  };

  const selectFormateur = async (formateur) => {
    setSelectedFormateur(formateur);
    setShowFormateurSelector(false);
    
    // Vérifier si une conversation existe déjà avec ce formateur
    const existingConv = conversations.find(c => c.participantId === formateur.id);
    
    if (existingConv) {
      // Si la conversation existe, la sélectionner et charger les messages
      setSelectedConversation(existingConv);
      if (existingConv.messages.length === 0) {
        await loadMessages(formateur.id);
      }
    } else {
      // Créer une nouvelle conversation
    const newConversation = {
        id: formateur.id,
      participantName: `${formateur.prenom} ${formateur.nom}`,
      participantRole: "Formateur",
      participantId: formateur.id,
      lastMessage: "",
      lastActivity: new Date().toISOString(),
      unreadCount: 0,
      messages: []
    };

    setConversations([newConversation, ...conversations]);
    setSelectedConversation(newConversation);
      // Charger les messages existants
      await loadMessages(formateur.id);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Simuler l'indicateur de frappe
    if (!isTyping) {
      setIsTyping(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleReaction = (messageId, emoji) => {
    if (!selectedConversation) return;
    
    const updatedMessages = selectedConversation.messages.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        if (reactions[emoji]) {
          reactions[emoji]++;
        } else {
          reactions[emoji] = 1;
        }
        return { ...msg, reactions };
      }
      return msg;
    });

    const updatedConversation = {
      ...selectedConversation,
      messages: updatedMessages
    };

    setSelectedConversation(updatedConversation);
    setConversations(conversations.map(c => c.id === selectedConversation.id ? updatedConversation : c));
    setShowReactions(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const filteredMessages = selectedConversation?.messages.filter(msg =>
    msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.author.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll quand de nouveaux messages arrivent
  useEffect(() => {
    if (selectedConversation) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedConversation?.messages]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const absMs = Math.abs(diffMs);
      const rtf = new Intl.RelativeTimeFormat(locale || 'fr', { numeric: 'auto' });

      const minutes = Math.round(absMs / (1000 * 60));
      const hours = Math.round(absMs / (1000 * 60 * 60));
      const days = Math.round(absMs / (1000 * 60 * 60 * 24));

      if (minutes < 60) return rtf.format(-minutes, 'minute');
      if (hours < 24) return rtf.format(-hours, 'hour');
      if (days < 7) return rtf.format(-days, 'day');
      return date.toLocaleDateString(locale || 'fr-FR');
    } catch {
      return new Date(dateString).toLocaleString();
    }
  };

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserName = `${currentUser.prenom || ''} ${currentUser.nom || ''}`.trim() || 'Utilisateur';

  if (loading) {
    return (
      <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r`}>
          <div className="p-4 animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Liste des conversations */}
      <div className={`w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
        {/* Header de la liste */}
        <div className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b px-4 py-4 flex items-center justify-between`}>
          <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {tr('student.discussions.title', 'Discussions')}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={startNewConversation}
              className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center">
              <MessageCircle className={`w-12 h-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-3`} />
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                {tr('student.discussions.none', 'Aucune conversation')}
              </p>
              <button
                onClick={startNewConversation}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
              >
                {tr('student.discussions.start', 'Commencer une discussion')}
              </button>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={async () => {
                  setSelectedConversation(conversation);
                  // Charger les messages si pas encore chargés
                  if (conversation.messages.length === 0 && conversation.participantId) {
                    await loadMessages(conversation.participantId);
                  }
                }}
                className={`p-4 border-b cursor-pointer hover:bg-opacity-50 ${
                  selectedConversation?.id === conversation.id
                    ? `${darkMode ? 'bg-gray-700' : 'bg-emerald-50'}`
                    : `${darkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-200'}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {conversation.participantName}
                      </h3>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(conversation.lastActivity)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {conversation.lastMessage || tr('student.discussions.new', 'Nouvelle conversation')}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <MessageCircle className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
                <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
                  {tr('student.discussions.select', 'Sélectionnez une conversation')}
              </h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  {tr('student.discussions.select_hint', 'Choisissez une discussion ou commencez-en une nouvelle')}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header de la conversation */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedConversation.participantName}
                  </h1>
                  <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>{selectedConversation.messages.length} {tr('student.discussions.messages', 'messages')}</span>
                    {isTyping && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600 animate-pulse">{tr('student.discussions.typing', "En train d'écrire...")}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className={`p-2 rounded-lg hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Barre de recherche */}
            {showSearch && (
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-3`}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={tr('student.discussions.search_placeholder', 'Rechercher dans les messages...')}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  />
                </div>
              </div>
            )}

            {/* Zone des messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : selectedConversation.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
                    {tr('student.discussions.no_messages', 'Aucun message')}
                  </h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {tr('student.discussions.start_with', 'Commencez la conversation avec')} {selectedConversation.participantName} !
                  </p>
                </div>
              ) : (
                (searchQuery ? filteredMessages : selectedConversation.messages).map((message, index) => {
                  const isCurrentUser = message.author === currentUserName;
                  const hasReactions = Object.keys(message.reactions || {}).length > 0;
                  
                  return (
                    <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCurrentUser ? 'bg-emerald-100' : 'bg-blue-100'
                          }`}>
                            <User className={`w-4 h-4 ${isCurrentUser ? 'text-emerald-600' : 'text-blue-600'}`} />
                          </div>
                          <div className="relative group">
                            <div 
                              className={`px-4 py-2 rounded-2xl cursor-pointer ${
                                isCurrentUser 
                                  ? `bg-emerald-600 text-white ${darkMode ? 'bg-emerald-500' : ''}` 
                                  : `${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border border-gray-200 text-gray-900'}`
                              }`}
                              onDoubleClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              {isCurrentUser && (
                                <div className={`text-xs mt-1 ${message.isRead ? 'text-emerald-200' : 'text-emerald-300'}`}>
                                  {message.isRead ? '✓✓' : '✓'}
                                </div>
                              )}
                            </div>
                            
                            {/* Réactions */}
                            {hasReactions && (
                              <div className={`flex gap-1 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                {Object.entries(message.reactions).map(([emoji, count]) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReaction(message.id, emoji)}
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700'
                                    } hover:bg-opacity-80 transition-colors`}
                                  >
                                    {emoji} {count}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Menu de réactions */}
                            {showReactions === message.id && (
                              <div className={`absolute ${isCurrentUser ? 'right-0' : 'left-0'} mt-2 p-2 ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              } border rounded-lg shadow-lg flex gap-2 z-10`}>
                                {['👍', '❤️', '😄', '😮', '😢', '😡'].map(emoji => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReaction(message.id, emoji)}
                                    className="text-lg hover:scale-125 transition-transform"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                          {message.author} • {formatDate(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t px-6 py-4`}>
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyPress={handleKeyPress}
                      placeholder={`${tr('student.discussions.write_to', 'Écrivez votre message à')} ${selectedConversation.participantName}...`}
                      className={`w-full px-4 py-3 pr-12 border rounded-2xl resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 max-h-32 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      rows="1"
                      style={{
                        minHeight: '44px',
                        height: 'auto'
                      }}
                    />
                    <div className="absolute right-3 top-3 flex items-center gap-2">
                      <button
                        type="button"
                        className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className="w-12 h-12 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  {sendingMessage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                  <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
              <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {tr('student.discussions.hint_send', 'Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne')}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de sélection de formateur */}
      {showFormateurSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden`}>
            <div className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b px-6 py-4 flex items-center justify-between`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {tr('student.discussions.pick_teacher', 'Choisir un formateur')}
              </h3>
              <button
                onClick={() => setShowFormateurSelector(false)}
                className={`p-2 rounded-lg hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                {tr('student.discussions.pick_teacher_hint', 'Sélectionnez le formateur avec qui vous souhaitez discuter :')}
              </p>
              
              {formateurs.length === 0 ? (
                <div className="text-center py-8">
                  <Users className={`w-12 h-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-3`} />
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tr('student.discussions.no_teachers', 'Aucun formateur disponible')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {formateurs.map((formateur) => (
                    <div
                      key={formateur.id}
                      onClick={() => selectFormateur(formateur)}
                      className={`p-4 rounded-lg border cursor-pointer hover:bg-opacity-50 transition-colors ${
                        darkMode 
                          ? 'border-gray-700 hover:bg-gray-700' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formateur.prenom} {formateur.nom}
                          </h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {tr('roles.teacher', 'Formateur')}
                          </p>
                          {formateur.email && (
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {formateur.email}
                            </p>
                          )}
                        </div>
                        <div className="text-emerald-600">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t px-6 py-4 flex justify-end`}>
              <button
                onClick={() => setShowFormateurSelector(false)}
                className={`px-4 py-2 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } transition-colors`}
              >
                {tr('common.cancel', 'Annuler')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



