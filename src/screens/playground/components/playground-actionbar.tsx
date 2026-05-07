import { useEffect, useState } from 'react'

import {
  ACTION_BAR_ASSET,
  HUD_COLORS,
  getAbilitySlotStateBackground,
  getActionIconBackground,
} from './hud-skin'

export type ActionSlot = {
  id: string
  key: string
  label: string
  icon: string
  cost: number
  cooldownMs: number
  description: string
  color: string
}

const ACTIONS: ActionSlot[] = [
  {
    id: 'strike',
    key: '1',
    label: 'Strike',
    icon: '⚔️',
    cost: 0,
    cooldownMs: 900,
    description: 'Basic melee attack for nearby targets.',
    color: '#fb7185',
  },
  {
    id: 'dash',
    key: '2',
    label: 'Dash',
    icon: '💨',
    cost: 8,
    cooldownMs: 4000,
    description: 'Short movement burst. Costs 8 MP.',
    color: '#22d3ee',
  },
  {
    id: 'bolt',
    key: '3',
    label: 'Bolt',
    icon: '⚡',
    cost: 15,
    cooldownMs: 5200,
    description: 'Ranged bolt that hits the test enemy from a distance.',
    color: '#facc15',
  },
  {
    id: 'summon',
    key: '4',
    label: 'Summon',
    icon: '✨',
    cost: 20,
    cooldownMs: 30000,
    description: 'Summon a temporary Hermes familiar that walks beside you for 60s. (Hermes Summoning skill)',
    color: '#a78bfa',
  },
]

type Props = {
  onCast: (id: string) => boolean
  hp: number
  hpMax: number
  mp: number
  mpMax: number
  sp: number
  spMax: number
}

export function PlaygroundActionBar({ onCast, hp, hpMax, mp, mpMax, sp, spMax }: Props) {
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({})
  const [tipFor, setTipFor] = useState<string | null>(null)

  useEffect(() => {
    const tick = window.setInterval(() => {
      setCooldowns((prev) => {
        const now = Date.now()
        const next: Record<string, number> = {}
        for (const [id, until] of Object.entries(prev)) {
          if (until > now) next[id] = until
        }
        return next
      })
    }, 100)
    return () => window.clearInterval(tick)
  }, [])

  const tryCast = (action: ActionSlot) => {
    const now = Date.now()
    const cdEnd = cooldowns[action.id] ?? 0
    if (cdEnd > now) return
    if (mp < action.cost) return
    const ok = onCast(action.id)
    if (ok) {
      setCooldowns((prev) => ({ ...prev, [action.id]: now + action.cooldownMs }))
    }
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      const slot = ACTIONS.find((action) => action.key === event.key)
      if (slot) tryCast(slot)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div
      className="hermes-desktop-only pointer-events-auto fixed bottom-3 left-1/2 z-[70] flex w-[min(94vw,480px)] -translate-x-1/2 items-center justify-center gap-2 rounded-[26px] border px-3 py-3 text-white shadow-2xl md:w-auto md:gap-3"
      style={{
        borderColor: HUD_COLORS.bronze,
        backgroundColor: HUD_COLORS.obsidian,
        backgroundImage: `linear-gradient(180deg, rgba(10,13,18,.95), rgba(10,13,18,.92)), url(${ACTION_BAR_ASSET})`,
        backgroundPosition: 'center, center',
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundSize: 'auto, cover',
        boxShadow: `0 0 26px rgba(46,106,99,.22), inset 0 0 0 1px rgba(241,197,109,.1), 0 14px 40px rgba(0,0,0,.6)`,
      }}
    >
      <div className="mr-1 hidden flex-col gap-1.5 md:flex">
        <Pip label="HP" v={hp} m={hpMax} c="#ef4444" />
        <Pip label="MP" v={mp} m={mpMax} c="#3b82f6" />
        <Pip label="SP" v={sp} m={spMax} c="#10b981" />
      </div>
      {ACTIONS.map((action, index) => {
        const cdEnd = cooldowns[action.id] ?? 0
        const now = Date.now()
        const cdRemaining = Math.max(0, cdEnd - now)
        const cdPct = cdRemaining > 0 ? (cdRemaining / action.cooldownMs) * 100 : 0
        const noMp = mp < action.cost
        const castable = cdRemaining === 0 && !noMp
        const slotState = cdRemaining > 0 ? 'cooldown' : noMp ? 'disabled' : 'ready'
        const slotBackground = getAbilitySlotStateBackground(slotState)
        const iconBackground = getActionIconBackground(index)
        return (
          <div
            key={action.id}
            className="relative"
            onMouseEnter={() => setTipFor(action.id)}
            onMouseLeave={() => setTipFor((current) => (current === action.id ? null : current))}
          >
            <button
              onClick={() => tryCast(action)}
              disabled={cdRemaining > 0 || noMp}
              className="relative h-14 w-14 overflow-hidden rounded-[18px] border transition-transform hover:scale-105 disabled:hover:scale-100"
              style={{
                borderColor: castable ? HUD_COLORS.gold : `${HUD_COLORS.parchment}22`,
                backgroundColor: 'rgba(10,13,18,0.88)',
                backgroundImage: `linear-gradient(180deg, rgba(10,13,18,.54), rgba(10,13,18,.84)), url(${slotBackground.asset})`,
                backgroundPosition: `center, ${slotBackground.backgroundPosition}`,
                backgroundRepeat: 'no-repeat, no-repeat',
                backgroundSize: 'auto, 220% auto',
                boxShadow: castable
                  ? `0 0 18px ${action.color}44, inset 0 0 0 1px rgba(241,197,109,.12)`
                  : 'inset 0 0 0 1px rgba(244,233,211,.08)',
              }}
            >
              <div
                className="absolute left-1/2 top-[45%] h-8 w-8 -translate-x-1/2 -translate-y-1/2"
                style={{
                  backgroundImage: `url(${iconBackground.asset})`,
                  backgroundPosition: iconBackground.backgroundPosition,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '420% auto',
                  filter: castable ? `drop-shadow(0 0 10px ${action.color}88)` : 'grayscale(0.25) opacity(0.72)',
                }}
                aria-hidden
              />
              <span className="sr-only">{action.icon}</span>
              {cdRemaining > 0 && (
                <div
                  className="absolute inset-0 bg-black/65"
                  style={{
                    clipPath: `polygon(0 0, 100% 0, 100% ${100 - cdPct}%, 0 ${100 - cdPct}%)`,
                  }}
                />
              )}
              {cdRemaining > 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black" style={{ color: HUD_COLORS.parchment }}>
                  {Math.ceil(cdRemaining / 1000)}s
                </div>
              )}
              <span
                className="absolute bottom-1 left-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-black"
                style={{
                  color: HUD_COLORS.obsidian,
                  background: castable ? HUD_COLORS.gold : `${HUD_COLORS.parchment}50`,
                }}
              >
                {action.key}
              </span>
              {action.cost > 0 && (
                <span className="absolute right-1.5 top-1 rounded-full px-1.5 py-0.5 text-[8px] font-black" style={{ color: HUD_COLORS.parchment, background: `${HUD_COLORS.verdigris}cc` }}>
                  {action.cost}
                </span>
              )}
            </button>
            {tipFor === action.id && (
              <div
                className="absolute bottom-[70px] left-1/2 w-48 -translate-x-1/2 rounded-[18px] border px-3 py-2 text-[10px] leading-tight shadow-2xl"
                style={{
                  borderColor: HUD_COLORS.bronze,
                  background: 'linear-gradient(180deg, rgba(10,13,18,.96), rgba(10,13,18,.9))',
                  boxShadow: `0 0 18px ${action.color}35`,
                }}
              >
                <div className="text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: HUD_COLORS.gold }}>
                  {action.label}
                </div>
                <div className="mt-1 text-white/78">{action.description}</div>
                {noMp && <div className="mt-1 text-[10px] font-bold" style={{ color: HUD_COLORS.parchment }}>Not enough MP</div>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Pip({ label, v, m, c }: { label: string; v: number; m: number; c: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.16em]" style={{ color: HUD_COLORS.parchment }}>
      <span style={{ color: HUD_COLORS.gold }}>{label}</span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ background: 'rgba(244,233,211,0.1)' }}>
        <div className="h-full rounded-full" style={{ width: `${(v / m) * 100}%`, background: c, boxShadow: `0 0 10px ${c}` }} />
      </div>
    </div>
  )
}
