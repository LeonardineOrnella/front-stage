'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { userService } from '@/service/user.service'
import { useUser } from '@/components/backoOffice/student/UserContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Eye, EyeOff } from 'lucide-react' // ✅ icônes pour afficher/masquer mdp

const API_USERS = "http://localhost:3001/api/users"

export default function Profil() {
  const { user: ctxUser, setUser: setCtxUser } = useUser()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [profileData, setProfileData] = useState({
    nom: "",
    email: ""
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Utilisateur non connecté")
        setLoading(false)
        return
      }

      try {
        const res = await userService.getMe()

        setUser(res.data)
        setCtxUser(res.data)
        setProfileData({
          nom: res.data.nom || "",
          email: res.data.email || ""
        })
        if (res.data.photo) setPreviewImage(`http://localhost:3001${res.data.photo}`)
      } catch (error) {
        toast.error("Erreur lors du chargement du profil ❌")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setProfileImage(file)
    setPreviewImage(URL.createObjectURL(file))
  }

  const handleUpdateProfile = async () => {
    setUpdating(true)

    try {
      const data = new FormData()
      data.append("nom", profileData.nom)
      data.append("email", profileData.email)
      if (profileImage) data.append("photo", profileImage)

      await userService.updateMe(data)

      toast.success("Profil mis à jour ✅")
      const updated = { ...user, nom: profileData.nom, email: profileData.email, photo: previewImage ? previewImage.replace('http://localhost:3001', '') : user.photo }
      setUser(updated)
      setCtxUser(updated)
    } catch (error) {
      toast.error("Échec de la mise à jour ❌")
    } finally {
      setUpdating(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('Les mots de passe ne correspondent pas ❌')
      return
    }
    try {
      await userService.changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })
      toast.success('Mot de passe mis à jour ✅')
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
    } catch (e) {
      toast.error("Échec de la mise à jour du mot de passe ❌")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 animate-pulse">Chargement du profil...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Mon profil</h2>

      {/* Photo de profil */}
      <div className="flex flex-col items-center mb-6">
        {previewImage ? (
          <div className="flex flex-col items-center gap-3">
            <img src={previewImage} alt="Photo Profil" className="w-24 h-24 rounded-full object-cover shadow" />
            <div className="flex gap-2">
              <label className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer">
                Changer la photo
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              <button type="button" onClick={() => { setProfileImage(null); setPreviewImage(null); }} className="inline-flex items-center px-3 py-1.5 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <label className="w-full">
            <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition cursor-pointer">
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">Aucune</div>
                <p className="text-sm">
                  Cliquez pour sélectionner une photo
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, GIF, WEBP (max 5MB)</p>
              </div>
            </div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        )}
      </div>

      {/* Informations de profil */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
        <input
          type="text"
          name="nom"
          value={profileData.nom}
          onChange={handleProfileChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={profileData.email}
          onChange={handleProfileChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <button onClick={handleUpdateProfile} disabled={updating} className={`w-full py-2 px-4 rounded text-white font-medium transition ${updating ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}>
        {updating ? "Mise à jour..." : "Mettre à jour le profil"}
      </button>

      {/* Changement de mot de passe */}
      <div className="mt-8 pt-6 border-t">
        <h3 className="text-lg font-semibold mb-4">Modifier le mot de passe</h3>

        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
          <input type={showPassword ? "text" : "password"} name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400 pr-10" placeholder="••••••••" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-9 text-gray-500">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
        </div>

        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
          <input type={showConfirmPassword ? "text" : "password"} name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400 pr-10" placeholder="••••••••" />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-9 text-gray-500">{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
          <input type="password" name="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={handlePasswordChange} className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400" placeholder="••••••••" />
        </div>

        <button onClick={handleChangePassword} className="w-full py-2 px-4 rounded text-white font-medium transition bg-emerald-600 hover:bg-emerald-700">Modifier le mot de passe</button>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  )
}
