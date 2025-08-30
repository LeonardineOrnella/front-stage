'use client';

import { useState, useEffect } from 'react';
import { AdminGuard } from '../../../components/backoOffice/AuthGuard';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Shield, 
  GraduationCap, 
  BookOpen, 
  Search, 
  Filter,
  MoreVertical,
  Eye,
  Mail,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function UtilisateursPage() {
  return (
    <AdminGuard>
      <UtilisateursContent />
    </AdminGuard>
  );
}

function UtilisateursContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);

  // Données de test (remplacer par l'API)
  useEffect(() => {
    const mockUsers = [
      { 
        id: 1, 
        nom: 'Principal', 
        prenom: 'Admin', 
        email: 'admin@elearn.com', 
        role: 'admin', 
        status: 'active', 
        createdAt: '2024-01-15',
        lastLogin: '2024-12-20',
        formations: 0,
        apprenants: 0
      },
      { 
        id: 2, 
        nom: 'Dupont', 
        prenom: 'Jean', 
        email: 'jean.dupont@elearn.com', 
        role: 'formateur', 
        status: 'active', 
        createdAt: '2024-01-20',
        lastLogin: '2024-12-19',
        formations: 3,
        apprenants: 25
      },
      { 
        id: 3, 
        nom: 'Martin', 
        prenom: 'Marie', 
        email: 'marie.martin@elearn.com', 
        role: 'formateur', 
        status: 'active', 
        createdAt: '2024-01-25',
        lastLogin: '2024-12-18',
        formations: 2,
        apprenants: 18
      },
      { 
        id: 4, 
        nom: 'Durand', 
        prenom: 'Pierre', 
        email: 'pierre.durand@elearn.com', 
        role: 'apprenant', 
        status: 'active', 
        createdAt: '2024-02-01',
        lastLogin: '2024-12-20',
        formations: 0,
        apprenants: 0
      },
      { 
        id: 5, 
        nom: 'Bernard', 
        prenom: 'Sophie', 
        email: 'sophie.bernard@elearn.com', 
        role: 'apprenant', 
        status: 'inactive', 
        createdAt: '2024-02-05',
        lastLogin: '2024-11-15',
        formations: 0,
        apprenants: 0
      },
      { 
        id: 6, 
        nom: 'Leroy', 
        prenom: 'Thomas', 
        email: 'thomas.leroy@elearn.com', 
        role: 'formateur', 
        status: 'active', 
        createdAt: '2024-02-10',
        lastLogin: '2024-12-17',
        formations: 1,
        apprenants: 12
      },
      { 
        id: 7, 
        nom: 'Moreau', 
        prenom: 'Julie', 
        email: 'julie.moreau@elearn.com', 
        role: 'apprenant', 
        status: 'active', 
        createdAt: '2024-02-15',
        lastLogin: '2024-12-20',
        formations: 0,
        apprenants: 0
      },
      { 
        id: 8, 
        nom: 'Petit', 
        prenom: 'Lucas', 
        email: 'lucas.petit@elearn.com', 
        role: 'apprenant', 
        status: 'active', 
        createdAt: '2024-02-20',
        lastLogin: '2024-12-19',
        formations: 0,
        apprenants: 0
      }
    ];
    
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-5 h-5 text-red-500" />;
      case 'formateur': return <GraduationCap className="w-5 h-5 text-blue-500" />;
      case 'apprenant': return <BookOpen className="w-5 h-5 text-green-500" />;
      default: return <User className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'formateur': return 'Formateur';
      case 'apprenant': return 'Apprenant';
      default: return 'Utilisateur';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'formateur': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'apprenant': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  // Calculs de pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const goToPage = (page) => setCurrentPage(page);
  const goToNextPage = () => currentPage < totalPages && goToPage(currentPage + 1);
  const goToPreviousPage = () => currentPage > 1 && goToPage(currentPage - 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Utilisateurs</h1>
              <p className="text-gray-600">Gérez les comptes utilisateurs et leurs permissions</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Ajouter un Formateur
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
                  <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administrateurs</p>
                  <p className="text-3xl font-bold text-red-600">{users.filter(u => u.role === 'admin').length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Formateurs</p>
                  <p className="text-3xl font-bold text-blue-600">{users.filter(u => u.role === 'formateur').length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Apprenants</p>
                  <p className="text-3xl font-bold text-green-600">{users.filter(u => u.role === 'apprenant').length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
              >
                <option value="">Tous les rôles</option>
                <option value="admin">Administrateur</option>
                <option value="formateur">Formateur</option>
                <option value="apprenant">Apprenant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Liste des Utilisateurs</h2>
          </div>
          
          {currentUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <User className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Aucun utilisateur trouvé</p>
              <p className="text-sm">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activité
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date de création
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-lg font-bold text-white">
                              {user.prenom.charAt(0).toUpperCase()}{user.nom.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {user.prenom} {user.nom}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Mail className="w-4 h-4" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRoleIcon(user.role)}
                          <span className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full border ${getRoleColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(user.status)}
                          <span className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(user.status)}`}>
                            {user.status === 'active' ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.role === 'formateur' ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-blue-500" />
                                <span>{user.formations} formation(s)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-green-500" />
                                <span>{user.apprenants} apprenant(s)</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>Dernière connexion: {new Date(user.lastLogin).toLocaleDateString('fr-FR')}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                            <Edit className="w-4 h-4" />
                          </button>
                          {user.role !== 'admin' && (
                            <button className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
                <span className="font-medium">
                  {Math.min(endIndex, filteredUsers.length)}
                </span>{' '}
                sur <span className="font-medium">{filteredUsers.length}</span> utilisateurs
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  Précédent
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        page === currentPage
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
