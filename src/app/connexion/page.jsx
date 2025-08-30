"use client";
import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { userService } from "@/service/user.service";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";




export default function Connexion() {
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [erreurs, setErreurs] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter()

  const validerFormulaire = () => {
    const nouvellesErreurs = {};

    // Email obligatoire + format
    if (!email.trim()) {
      nouvellesErreurs.email = "L'email est obligatoire";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nouvellesErreurs.email = "Format d'email invalide";
    }

    // Mot de passe obligatoire + longueur minimale
    if (!mdp.trim()) {
      nouvellesErreurs.mdp = "Le mot de passe est obligatoire";
    } else if (mdp.length < 6) {
      nouvellesErreurs.mdp = "Minimum 6 caractères";
    }

    setErreurs(nouvellesErreurs);

    // Si pas d'erreurs, retourne true
    return Object.keys(nouvellesErreurs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validerFormulaire()) return;

    try {
      userService.login({ email: email, mdp: mdp }).then(res => {
        if (res.data.status == 201) {
          console.log(res.data.message);
          //setMessage(res.data.message)
          toast.error(res.data.message)

        } else {
          toast.success(res.data.message)
          localStorage.setItem('token', res.data.token)
          localStorage.setItem("user", JSON.stringify(res.data.user)); 
          // Définir aussi un cookie lisible par le middleware côté serveur
          // 7 jours d'expiration, SameSite=Lax pour éviter les problèmes de redirection
          document.cookie = `token=${res.data.token}; path=/; max-age=604800; samesite=Lax`;
           router.push('/dasboard')

        }
      })

    } catch (erreur) {
      console.error(erreur);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl transform hover:scale-105 transition-all duration-300">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Connexion</h1>
          <p className="text-gray-600">Accédez à votre espace personnel</p>
        </div>

        {/* Carte principale */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">
          {message && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center space-x-3 transition-all duration-300 ${message.startsWith("")
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
              }`}>
              {message.startsWith("") ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-medium">{message}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 rounded-2xl focus:outline-none focus:bg-white transition-all duration-300 ${erreurs.email
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    }`}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {erreurs.email && (
                <div className="flex items-center space-x-2 text-red-500 text-sm mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{erreurs.email}</span>
                </div>
              )}
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Mot de passe
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={mdp}
                  className={`w-full pl-12 pr-12 py-4 bg-gray-50/50 border-2 rounded-2xl focus:outline-none focus:bg-white transition-all duration-300 ${erreurs.mdp
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    }`}
                  onChange={(e) => setMdp(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {erreurs.mdp && (
                <div className="flex items-center space-x-2 text-red-500 text-sm mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{erreurs.mdp}</span>
                </div>
              )}
            </div>

            {/* Options supplémentaires */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                  Se souvenir de moi
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Se connecter
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">ou continuer avec</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50/50 transition-all duration-200 group"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800">Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50/50 transition-all duration-200 group"
            >
              <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800">Facebook</span>
            </button>
          </div>

          {/* Lien inscription */}
          <p className="text-center text-gray-600 mt-8">
            Pas encore de compte ?{" "}
            <button
              type="button"
              onClick={() => {
                router.push('/inscription')
              }}
              className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-colors"
            >
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}