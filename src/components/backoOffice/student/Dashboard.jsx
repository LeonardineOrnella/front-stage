import React from 'react'
import { BookOpen, Trophy, Clock, TrendingUp } from 'lucide-react';
export default function Dashboard() {
  return (
    <div>
         {/* Stats Grid */}
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Formations inscrites</p>
                <p className="text-2xl font-bold text-gray-900">{2}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Formations terminées</p>
                <p className="text-2xl font-bold text-gray-900">{1}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progression moyenne</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(2)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Temps d'étude</p>
                <p className="text-2xl font-bold text-gray-900">42h</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
    </div>
  )
}
