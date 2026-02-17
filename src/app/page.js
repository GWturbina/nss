'use client'
import { useEffect } from 'react'
import useGameStore from '@/lib/store'
import { LEVELS } from '@/lib/gameData'
import { useBlockchainInit } from '@/lib/useBlockchain'
import { useTelegram } from '@/lib/useTelegram'
import Header from '@/components/ui/Header'
import BottomNav from '@/components/ui/BottomNav'
import MineTab from '@/components/game/MineTab'
import LevelsTab from '@/components/game/LevelsTab'
import { GemsTab, StakingTab, ExchangeTab, HomeTab, TeamTab } from '@/components/pages/ContentPages'
import { LinksTab, VaultTab } from '@/components/pages/ExtraPages'
import AdminPanel from '@/components/admin/AdminPanel'

export default function Home() {
  const { activeTab, level, dayMode } = useGameStore()
  const themeClass = LEVELS[level]?.themeClass || 'theme-0'

  // Инициализация — ОДИН РАЗ
  useBlockchainInit()
  const { isInTelegram, startParam } = useTelegram()

  // Если пришли с реферальной ссылки из Telegram
  useEffect(() => {
    if (startParam) {
      // Сохраняем реферальный код
      localStorage.setItem('nss_ref', startParam)
    }
  }, [startParam])

  return (
    <div className={`max-w-[430px] mx-auto min-h-screen flex flex-col ${themeClass} ${dayMode ? 'day-mode' : ''}`}
      style={{ background: dayMode ? '#e8e0c8' : '#2b2a1a', boxShadow: '0 0 60px rgba(255,215,0,0.04)' }}>
      <Header />
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'mine' && <MineTab />}
        {activeTab === 'gems' && <GemsTab />}
        {activeTab === 'staking' && <StakingTab />}
        {activeTab === 'exchange' && <ExchangeTab />}
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'team' && <TeamTab />}
        {activeTab === 'links' && <LinksTab />}
        {activeTab === 'vault' && <VaultTab />}
        {activeTab === 'admin' && <AdminPanel />}
        {activeTab === 'levels' && <LevelsTab />}
      </div>
      <BottomNav />
    </div>
  )
}
