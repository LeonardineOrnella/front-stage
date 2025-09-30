'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { User, Shield, GraduationCap, BookOpen, Mail, Trash2, Search, X } from 'lucide-react'
import RequireRole from '@/components/backoOffice/RequireRole'

const API_USERS = "http://localhost:3001/api/users"

export default function Utilisateurs() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const itemsPerPage = 5

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(API_USERS)
        setUsers(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchUsers()
  }, [])

  const roleCounts = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    formateur: users.filter(u => u.role === 'formateur').length,
    apprenant: users.filter(u => u.role === 'apprenant').length,
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = (
      u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const matchesRole = selectedRole === 'all' ? true : u.role === selectedRole
    return matchesSearch && matchesRole
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedRole])

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-5 h-5 text-red-500" />
      case 'formateur': return <GraduationCap className="w-5 h-5 text-blue-500" />
      case 'apprenant': return <BookOpen className="w-5 h-5 text-green-500" />
      default: return <User className="w-5 h-5 text-gray-500" />
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    try {
      await axios.delete(`${API_USERS}/${selectedUser.id}`)
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id))
      setShowModal(false)
      setSelectedUser(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <RequireRole roles={['admin']}>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Liste des Utilisateurs</h1>
            <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          </div>

          {/* Compteurs & Filtres par rôle */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setSelectedRole('all')}
              className={`flex items-center justify-between gap-2 border rounded-lg px-4 py-3 ${selectedRole === 'all' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'} hover:bg-gray-100`}
            >
              <span className="flex items-center gap-2 text-gray-700"><User className="w-5 h-5 text-gray-500" /> Tous</span>
              <span className="text-sm font-semibold text-gray-900">{roleCounts.total}</span>
            </button>
            <button
              onClick={() => setSelectedRole('admin')}
              className={`flex items-center justify-between gap-2 border rounded-lg px-4 py-3 ${selectedRole === 'admin' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'} hover:bg-gray-100`}
            >
              <span className="flex items-center gap-2 text-gray-700"><Shield className="w-5 h-5 text-red-500" /> Admins</span>
              <span className="text-sm font-semibold text-gray-900">{roleCounts.admin}</span>
            </button>
            <button
              onClick={() => setSelectedRole('formateur')}
              className={`flex items-center justify-between gap-2 border rounded-lg px-4 py-3 ${selectedRole === 'formateur' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'} hover:bg-gray-100`}
            >
              <span className="flex items-center gap-2 text-gray-700"><GraduationCap className="w-5 h-5 text-blue-500" /> Formateurs</span>
              <span className="text-sm font-semibold text-gray-900">{roleCounts.formateur}</span>
            </button>
            <button
              onClick={() => setSelectedRole('apprenant')}
              className={`flex items-center justify-between gap-2 border rounded-lg px-4 py-3 ${selectedRole === 'apprenant' ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'} hover:bg-gray-100`}
            >
              <span className="flex items-center gap-2 text-gray-700"><BookOpen className="w-5 h-5 text-green-500" /> Apprenants</span>
              <span className="text-sm font-semibold text-gray-900">{roleCounts.apprenant}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom & Prénom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.prenom} {user.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" /> {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-red-100 text-red-700' : user.role === 'formateur' ? 'bg-blue-100 text-blue-700' : user.role === 'apprenant' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {getRoleIcon(user.role)}
                      {user.role || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => { setSelectedUser(user); setShowModal(true) }}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">Aucun utilisateur trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Précédent
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : ''}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* Modal de confirmation */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirmer la suppression</h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer <span className="font-semibold">{selectedUser?.prenom} {selectedUser?.nom}</span> ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </RequireRole>
  )
}
