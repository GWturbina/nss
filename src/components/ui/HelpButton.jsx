'use client'
import { useState } from 'react'
import { HELP_DATA } from '@/lib/helpData'

/**
 * HelpButton — глобальная кнопка "?" 
 * Встраивается в Header, автоматически определяет нужную инструкцию по activeTab
 * 
 * Использование в Header:
 *   <HelpButton activeTab={activeTab} />
 * 
 * Маппинг activeTab → helpData section выполняется автоматически
 */

// Маппинг activeTab из store → ключ в HELP_DATA
const TAB_TO_SECTION = {
  mine: 'mine',
  staking: 'business',
  home: 'home',
  loan: 'loan',
  chtExchange: 'chtExchange',
  levels: 'levels',
  houses: 'houses',
  exchange: 'exchange',
  team: 'team',
  links: 'links',
  vault: 'vault',
  admin: 'admin',
}

export default function HelpButton({ activeTab }) {
  const [open, setOpen] = useState(false)

  const section = TAB_TO_SECTION[activeTab] || 'overview'
  const data = HELP_DATA[section] || HELP_DATA.overview

  if (!data) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center rounded-lg text-sm"
        style={{
          width: 32,
          height: 32,
          background: 'var(--bg-card-light)',
          border: '1px solid var(--border)',
          color: '#ffd700',
          fontSize: 14,
          fontWeight: 900,
          lineHeight: 1,
          flexShrink: 0,
        }}
        title="Помощь"
      >
        ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="max-w-[420px] w-full max-h-[85vh] flex flex-col rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1a1040, #0a0a20)',
              border: '1px solid rgba(255,215,0,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-[15px] font-black text-white flex items-center gap-2">
                <span>{data.icon}</span> {data.title}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 text-lg"
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-3">
              <div className="space-y-2">
                {data.sections.map((sec, idx) => (
                  <AccordionItem key={idx} item={sec} defaultOpen={idx === 0} />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-2">
              <button
                onClick={() => setOpen(false)}
                className="w-full py-3.5 rounded-2xl text-[14px] font-black"
                style={{ background: 'linear-gradient(135deg, #ffd700, #f5a623)', color: '#000', border: 'none', cursor: 'pointer' }}
              >
                ✅ Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function AccordionItem({ item, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: open ? 'rgba(255,255,255,0.04)' : 'transparent',
        border: '1px solid',
        borderColor: open ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.06)',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span className="text-[13px] font-bold text-white flex items-center gap-2">
          <span>{item.emoji}</span> {item.title}
        </span>
        <span
          className="text-[11px] transition-transform"
          style={{
            color: '#ffd700',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="px-4 pb-3">
          <div className="text-[12px] text-slate-300 leading-relaxed whitespace-pre-line">
            {item.content}
          </div>
        </div>
      )}
    </div>
  )
}
