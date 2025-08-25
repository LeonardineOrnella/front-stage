"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from "lucide-react"
import { userService } from '@/service/user.service'
import { toast } from 'react-toastify'

export default function Inscription() {
    const router = useRouter()
    const [email, setMail] = useState("")
    const [nom, setNom] = useState("")
    const [prenom, setPrenom] = useState("")
    const [mdp, setMdp] = useState("")
    const [confirmMdp, setConfirmMdp] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [showMdp, setShowMdp] = useState(false) // 👁 mot de passe
    const [showConfirmMdp, setShowConfirmMdp] = useState(false) // 👁 confirmation


    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(email)
    }
    const handleSubmit = (e) => {
        e.preventDefault()

        if (!nom || !prenom || !email || !mdp || !confirmMdp) {
            setError("Tous les champs sont obligatoires.")
            setSuccess("")
            return
        }

        if (!validateEmail(email)) {
            setError("L'adresse email n'est pas valide.")
            setSuccess("")
            return
        }

        if (mdp.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.")
            setSuccess("")
            return
        }

        if (mdp !== confirmMdp) {
            setError("Les mots de passe ne correspondent pas.")
            setSuccess("")
            return
        }


        setError("")

        userService.register({
            email,
            nom,
            prenom,
            mdp,
            role: "apprenant"
        }).then(res => {

            toast.success(res.data.message)
            router.push('/connexion')

        }).catch(err => {
            console.log(err);

        })


    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Inscription</h2>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                {success && <p className="text-green-500 text-center mb-4">{success}</p>}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Nom</label>
                        <input
                            type="text"
                            placeholder="Entrez votre nom"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onChange={(e) => setNom(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Prénom</label>
                        <input
                            type="text"
                            placeholder="Entrez votre prénom"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onChange={(e) => setPrenom(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Entrez votre email"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            onChange={(e) => setMail(e.target.value)}
                        />
                    </div>

                    {/* Mot de passe */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Mot de passe</label>
                        <div className="relative">
                            <input
                                type={showMdp ? "text" : "password"}
                                placeholder="Entrez votre mot de passe"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                                onChange={(e) => setMdp(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-2.5 text-gray-500"
                                onClick={() => setShowMdp(!showMdp)}
                            >
                                {showMdp ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirmation mot de passe */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-1">Confirmer le mot de passe</label>
                        <div className="relative">
                            <input
                                type={showConfirmMdp ? "text" : "password"}
                                placeholder="Confirmez votre mot de passe"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                                onChange={(e) => setConfirmMdp(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-2.5 text-gray-500"
                                onClick={() => setShowConfirmMdp(!showConfirmMdp)}
                            >
                                {showConfirmMdp ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        S'inscrire
                    </button>
                </form>
            </div>
        </div>
    )
}
