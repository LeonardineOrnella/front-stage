"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Mail, Lock, BookOpen, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { userService } from '@/service/user.service';
import { toast } from 'react-toastify';
import Link from 'next/link';
 

export default function Inscription() {
    const router = useRouter();
    const [email, setMail] = useState("");
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [mdp, setMdp] = useState("");
    const [confirmMdp, setConfirmMdp] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showMdp, setShowMdp] = useState(false);
    const [showConfirmMdp, setShowConfirmMdp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nom || !prenom || !email || !mdp || !confirmMdp) {
            setError("Tous les champs sont obligatoires.");
            setSuccess("");
            return;
        }

        if (!validateEmail(email)) {
            setError("L'adresse email n'est pas valide.");
            setSuccess("");
            return;
        }

        if (mdp.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            setSuccess("");
            return;
        }

        if (mdp !== confirmMdp) {
            setError("Les mots de passe ne correspondent pas.");
            setSuccess("");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const res = await userService.register({
                email,
                nom,
                prenom,
                mdp,
                role: "apprenant"
            });

            toast.success(res.data.message);
            router.push('/connexion');
        } catch (err) {
            console.log(err);
            toast.error("Une erreur s'est produite lors de l'inscription");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative">
            {/* Image de fond */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80')"
                }}
            >
                {/* Overlay pour améliorer la lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-emerald-800/50 to-emerald-900/60"></div>
            </div>
            
            {/* Contenu principal */}
            <div className="relative z-10 min-h-screen">
                {/* Header avec retour */}
                <div className="absolute top-6 left-6">
                    <Link 
                        href="/"
                        className="flex items-center space-x-2 text-white hover:text-emerald-200 transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Accueil</span>
                    </Link>
                </div>

                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="w-full max-w-md">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl transform hover:scale-105 transition-all duration-300 border border-white/30">
                                <User className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Créer un compte</h1>
                            <p className="text-white/90 drop-shadow-md">Rejoignez la plateforme et commencez à apprendre</p>
                        </div>

                        {/* Carte principale */}
                        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">
                        {error && (
                            <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 flex items-center space-x-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">{success}</span>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Nom et Prénom */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 ml-1">Prénom</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder={'Votre prénom'}
                                            value={prenom}
                                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 text-gray-900 placeholder:text-gray-400"
                                            onChange={(e) => setPrenom(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 ml-1">Nom</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder={'Votre nom'}
                                            value={nom}
                                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 text-gray-900 placeholder:text-gray-400"
                                            onChange={(e) => setNom(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="email@example.com"
                                        value={email}
                                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 text-gray-900 placeholder:text-gray-400"
                                        onChange={(e) => setMail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Mot de passe */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 ml-1">Mot de passe</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type={showMdp ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={mdp}
                                        className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 text-gray-900 placeholder:text-gray-400"
                                        onChange={(e) => setMdp(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowMdp(!showMdp)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 focus:outline-none transition-colors"
                                    >
                                        {showMdp ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirmation mot de passe */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 ml-1">Confirmer le mot de passe</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type={showConfirmMdp ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmMdp}
                                        className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 text-gray-900 placeholder:text-gray-400"
                                        onChange={(e) => setConfirmMdp(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmMdp(!showConfirmMdp)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 focus:outline-none transition-colors"
                                    >
                                        {showConfirmMdp ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Bouton */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-emerald-600 text-white font-semibold py-4 rounded-2xl hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Création en cours…</span>
                                    </div>
                                ) : (
                                    'Créer un compte'
                                )}
                            </button>
                        </form>

                        {/* Lien connexion */}
                        <p className="text-center text-gray-600 mt-8">
                            Vous avez déjà un compte ? {" "}
                            <Link
                                href="/connexion"
                                className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
                            >
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}
