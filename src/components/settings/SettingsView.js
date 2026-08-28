'use client'

import { useState } from 'react'
import SecurityTab from './SecurityTab'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { IconLock, IconSun } from '@/components/icons'

export default function SettingsView({ email }) {
  const [tab, setTab] = useState('seguranca')

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Configurações</h1>
          <p>Gerencie sua senha e preferências de aparência</p>
        </div>
      </div>

      <div className="tab-bar mb-xl">
        <button
          type="button"
          className={`btn ${tab === 'seguranca' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('seguranca')}
        >
          <IconLock size={16} /> Segurança
        </button>
        <button
          type="button"
          className={`btn ${tab === 'visual' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('visual')}
        >
          <IconSun size={16} /> Visual
        </button>
      </div>

      <div className="glass-card panel" style={{ maxWidth: 480 }}>
        {tab === 'seguranca' ? (
          <SecurityTab email={email} />
        ) : (
          <div>
            <h3 className="mb-xs">Tema</h3>
            <p className="text-secondary mb-lg" style={{ fontSize: '0.875rem' }}>
              Escolha entre o tema escuro ou claro. A preferência fica salva neste navegador.
            </p>
            <ThemeToggle />
          </div>
        )}
      </div>
    </>
  )
}
