'use client'

import React from 'react'
import CardFormation from '@/components/frontOffice/acceuil/CardFormation'

export default function MesCoursPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes cours</h1>
          <p className="text-gray-600">Parcourez et gérez vos formations.</p>
        </div>
        <CardFormation />
      </div>
    </div>
  )
}


