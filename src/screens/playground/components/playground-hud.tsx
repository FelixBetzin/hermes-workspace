import { useEffect, useState } from 'react'
import { useWorkspaceStore } from '@/stores/workspace-store'
import type { PlaygroundWorldId } from '../lib/playground-rpg'
import type { PlaygroundRpgState, RewardToast } from '../hooks/use-playground-rpg'
import { HUD_COLORS, getHudOrbAsset, getToastVariant } from './hud-skin'

type HudProps = {
  state: PlaygroundRpgState
  activeQuestTitle: string
  objectiveLabel: string
  objectiveHint?: string
  levelProgress: { current: number; needed: number; pct: number }
  currentWorld: PlaygroundWorldId
  worldAccent: string
  toasts: RewardToast[]
  objectiveTarget?: string | null
}

// Fixed positions for known targets (world coords). Used to compute the
// objective arrow direction from the player's current position.
const TARGET_POS: Record<string, Record<string, [number, number]>> = {
  training: {
    athena: [-10.5, 7.2],
    iris: [6.2, 0.4],
    pan: [11.2, -7.5],
    nike: [-4.8, -4.8],
    shopkeeper: [-14.5, -10.2],
    'archive-podium': [6, 0],
    'forge-gate': [14, -10],
    'training-blade': [-14.5, -10.2],
    'novice-cloak': [-14.5, -10.2],
    'hermes-sigil': [-14.5, -10.2],
    'build-demo': [11.2, -7.5],
    'glitch-wisp': [-4.8, -4],
    'wisp-core': [-4.8, -4],
  },
  agora: {
    athena: [-5, 2],
    apollo: [5, 3],
    iris: [-3, -5],
    nike: [6, -4],
    shopkeeper: [-3, 9.5],
    'awakening-agora': [-8, -3],
  },
  forge: { pan: [-4, 0], chronos: [4, 0], 'enter-forge': [0, -7], 'forge-shard': [0, -7] },
  grove: { pan: [-4, 1], apollo: [4, 0], artemis: [0, -5], 'grove-ritual': [-6, -4], 'song-fragment': [-6, -4] },
  oracle: { athena: [-3, -2], chronos: [3, -2], eros: [0, 4], 'oracle-riddle': [5, -3] },
  arena: { nike: [-3, 4], hermes: [3, 4], chronos: [0, -5], 'arena-duel': [0, 0], 'kimi-sigil': [0, 0] },
}

export function PlaygroundHud({
  state,
  activeQuestTitle,
  objectiveLabel,
  objectiveHint,
  levelProgress,
  worldAccent,
  toasts,
  currentWorld,
  objectiveTarget,
}: HudProps) {
  const { playerProfile } = state
  const sidebarCollapsed = useWorkspaceStore((s) => s.sidebarCollapsed)
  const isPublicPlayRoute = typeof window !== 'undefined' && /^\/play\/?$/.test(window.location.pathname)
  // Detect coarse-pointer / no-hover (phones & tablets) so we can flush the
  // player card to the actual top-left edge instead of leaving a gap for the
  // (non-existent) workspace nav rail.
  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)')
    const sync = () => setIsTouch(mq.matches || 'ontouchstart' in window)
    sync()
    mq.addEventListener?.('change', sync)
    return () => mq.removeEventListener?.('change', sync)
  }, [])
  const chromeLeft = isTouch ? '8px' : isPublicPlayRoute ? '20px' : sidebarCollapsed ? 'min(120px, 9vw)' : '320px'

  // Compute heading angle from player to objective target (in degrees, screen up = 0).
  // Throttled to ~10 Hz so we don't re-render the HUD on every animation frame.
  const [arrowDeg, setArrowDeg] = useState<number | null>(null)
  useEffect(() => {
    if (!objectiveTarget) { setArrowDeg(null); return }
    const target = TARGET_POS[currentWorld]?.[objectiveTarget]
    if (!target) { setArrowDeg(null); return }
    const compute = () => {
      const player = (window as any).__hermesPlaygroundPlayerPos as { x: number; z: number } | undefined
      const px = player?.x ?? 0
      const pz = player?.z ?? 0
      const dx = target[0] - px
      const dz = target[1] - pz
      // World uses (x, z) plane. Screen-up corresponds to -z. atan2(dx, -dz)
      // returns 0° when target is straight ahead (north).
      return Math.atan2(dx, -dz) * (180 / Math.PI)
    }
    setArrowDeg(compute())
    const id = window.setInterval(() => setArrowDeg(compute()), 100)
    return () => window.clearInterval(id)
  }, [objectiveTarget, currentWorld])
  return (
    <>
      {/* Combined player card: avatar portrait + name + level + title + HP/MP/SP/XP
          On phones, docks tight to the top-left edge with smaller dimensions. */}
      <div
        className="pointer-events-auto fixed z-[70] flex flex-col items-start gap-2"
        style={{
          top: isTouch ? 6 : 12,
          left: chromeLeft,
          maxWidth: isTouch ? 168 : 360,
        }}
      >
        <div
          className="rounded-2xl border text-white shadow-2xl backdrop-blur-xl"
          style={{
            padding: isTouch ? '6px 8px 7px 8px' : '10px 12px',
            borderColor: `${worldAccent}38`,
            background: `linear-gradient(180deg, rgba(16,22,31,.92), rgba(3,7,18,.88)), radial-gradient(circle at 20% 0%, ${worldAccent}24, transparent 55%)`,
            boxShadow: `0 0 18px ${worldAccent}28, inset 0 1px 0 rgba(255,255,255,.08), 0 8px 28px rgba(0,0,0,.5)`,
          }}
        >
          <div className="flex items-center" style={{ gap: isTouch ? 8 : 12 }}>
            {/* Avatar portrait + level badge */}
            <div className="relative">
              <div
                className="overflow-hidden rounded-full border-2"
                style={{
                  width: isTouch ? 38 : 56,
                  height: isTouch ? 38 : 56,
                  borderColor: worldAccent,
                  background: `linear-gradient(180deg, ${playerProfile.avatarConfig.outfitAccent || worldAccent}33, ${playerProfile.avatarConfig.outfit || '#0f172a'})`,
                  boxShadow: `0 0 10px ${worldAccent}55`,
                }}
              >
                <img
                  src={`/avatars/${playerProfile.avatarConfig.portrait || 'hermes'}.png`}
                  alt={playerProfile.displayName || 'Builder'}
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
              </div>
              <div
                className="absolute flex items-center justify-center rounded-full border-2 font-bold"
                style={{
                  right: -3,
                  bottom: -3,
                  width: isTouch ? 16 : 24,
                  height: isTouch ? 16 : 24,
                  fontSize: isTouch ? 8 : 10,
                  borderColor: '#0b1320',
                  background: worldAccent,
                  color: '#0b1320',
                }}
              >
                {playerProfile.level}
              </div>
            </div>
            <div className="leading-tight min-w-0">
              <div
                className="truncate font-bold"
                style={{ fontSize: isTouch ? 11 : 13, maxWidth: isTouch ? 130 : 220 }}
              >
                {playerProfile.displayName || 'New Builder'}
              </div>
              <div
                className="truncate uppercase tracking-[0.14em] text-white/45"
                style={{ fontSize: isTouch ? 7 : 9, maxWidth: isTouch ? 130 : 220 }}
              >
                {playerProfile.titlesUnlocked.at(-1) || 'Builder'}
              </div>
              {!isTouch && (
                <div className="mt-0.5 text-[9px] text-white/40">
                  XP {playerProfile.xp} · next {Math.max(0, levelProgress.needed - levelProgress.current)}
                </div>
              )}
            </div>
          </div>
          <div
            className="flex items-center justify-between"
            style={{ marginTop: isTouch ? 6 : 10, gap: isTouch ? 4 : 6 }}
          >
            <Orb label="HP" v={state.hp} m={state.hpMax} color="#ef4444" compact={isTouch} />
            <Orb label="MP" v={state.mp} m={state.mpMax} color="#3b82f6" compact={isTouch} />
            <Orb label="SP" v={state.sp} m={state.spMax} color="#10b981" compact={isTouch} />
            <Orb label="XP" v={levelProgress.current} m={levelProgress.needed} color="#22d3ee" compact={isTouch} />
          </div>
        </div>
      </div>

      {/* Current Objective — stacked under the player card (top-left).
          Compact, single-line on mobile so the world stays visible. */}
      <div
        className="pointer-events-auto fixed z-[71] flex flex-col items-start"
        style={{
          left: isTouch ? 8 : chromeLeft,
          top: isTouch ? 70 : 130,
          width: isTouch ? 'min(72vw, 260px)' : 'min(92vw, 360px)',
        }}
      >
        <div
          className="flex w-full items-center gap-2 rounded-3xl border text-white shadow-2xl backdrop-blur-xl"
          style={{
            padding: isTouch ? '5px 8px' : '8px 12px',
            borderColor: `${worldAccent}42`,
            background: `linear-gradient(180deg, rgba(16,22,31,.94), rgba(3,7,18,.9)), radial-gradient(circle at 0% 0%, ${worldAccent}22, transparent 55%)`,
            boxShadow: `0 0 18px ${worldAccent}28, inset 0 1px 0 rgba(255,255,255,.08), 0 8px 28px rgba(0,0,0,.5)`,
          }}
        >
          <div
            className="flex shrink-0 items-center justify-center rounded-xl border"
            style={{
              width: isTouch ? 22 : 32,
              height: isTouch ? 22 : 32,
              borderColor: `${worldAccent}65`,
              background: `linear-gradient(180deg, ${worldAccent}24, rgba(255,255,255,.04))`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,.08), 0 0 12px ${worldAccent}22`,
            }}
            title={arrowDeg != null ? 'Pointing toward objective' : 'Objective'}
          >
            <span
              style={{
                fontSize: isTouch ? 10 : 14,
                lineHeight: 1,
                color: worldAccent,
                transform: `rotate(${arrowDeg != null ? arrowDeg - 90 : -45}deg)`,
                transition: 'transform 220ms cubic-bezier(.2,.8,.2,1)',
                filter: arrowDeg != null ? `drop-shadow(0 0 5px ${worldAccent})` : undefined,
              }}
              aria-hidden
            >➤</span>
          </div>
          <div className="min-w-0 flex-1">
            {/* Desktop shows OBJECTIVE label + title + body. Mobile just
                shows quest title + the active step body, single-line. */}
            {!isTouch && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
                  Objective
                </span>
                <span
                  className="truncate text-[12px] font-bold"
                  style={{ color: worldAccent }}
                >
                  {activeQuestTitle}
                </span>
              </div>
            )}
            <div
              className="truncate leading-snug text-white/90"
              style={{ fontSize: isTouch ? 10 : 11 }}
            >
              {isTouch ? `➜ ${objectiveLabel}` : objectiveLabel}
            </div>
            {objectiveHint && !isTouch && (
              <div className="truncate text-[10px] text-white/55">{objectiveHint}</div>
            )}
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed left-1/2 top-[154px] z-[80] flex max-h-[30vh] w-[min(92vw,440px)] -translate-x-1/2 flex-col gap-2 overflow-visible md:top-[96px] md:max-h-[36vh]">
        {toasts.map((toast) => {
          const variant = getToastVariant(toast.kind)
          return (
            <div
              key={toast.id}
              className="relative overflow-hidden rounded-[20px] border px-5 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-xl"
              style={{
                borderColor: variant.borderColor,
                backgroundColor: `${HUD_COLORS.obsidian}f0`,
                backgroundImage: `linear-gradient(180deg, rgba(10,13,18,.84), rgba(10,13,18,.94)), url(${variant.asset})`,
                backgroundPosition: `center, ${variant.backgroundPosition}`,
                backgroundRepeat: 'no-repeat, no-repeat',
                backgroundSize: 'auto, 200% auto',
                boxShadow: `0 0 22px ${variant.glow}, inset 0 0 0 1px rgba(244,233,211,.08)`,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: HUD_COLORS.parchment }}>{variant.label}</div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/78">{toast.title}</div>
                  <div className="mt-0.5 text-[13px] font-semibold text-white">{toast.body}</div>
                </div>
                <div
                  className="mt-0.5 h-2.5 w-2.5 rounded-full"
                  style={{ background: variant.borderColor, boxShadow: `0 0 12px ${variant.glow}` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function Orb({
  label,
  v,
  m,
  color,
  secondary,
  compact,
}: {
  label: 'HP' | 'MP' | 'SP' | 'XP'
  v: number
  m: number
  color: string
  secondary?: string
  compact?: boolean
}) {
  const pct = Math.max(0, Math.min(1, v / Math.max(1, m)))
  const orbAsset = getHudOrbAsset(label)
  const size = compact ? 44 : 64
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage: `url(${orbAsset})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          filter: `drop-shadow(0 0 12px ${color}55)`,
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
        style={{
          background: `linear-gradient(180deg, ${color}bb 0%, ${color}44 64%, rgba(10,13,18,.18) 100%)`,
          clipPath: `inset(${(1 - pct) * 100}% 0 0 0 round 999px)`,
          mixBlendMode: 'screen',
          opacity: 0.72,
          transition: 'clip-path 220ms ease',
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-1 text-center text-white">
        <div className="font-black uppercase leading-none tracking-[0.18em]" style={{ color: HUD_COLORS.parchment, fontSize: compact ? 7 : 10 }}>
          {label}
        </div>
        <div className="mt-1 font-black leading-none" style={{ fontSize: compact ? 9 : 13, textShadow: '0 1px 8px rgba(0,0,0,.8)' }}>
          {Math.round(v)}
        </div>
        {!compact && (
          <div className="mt-1 h-1.5 w-9 overflow-hidden rounded-full bg-black/45 ring-1 ring-white/10">
            <div
              className="h-full rounded-full"
              style={{ width: `${pct * 100}%`, background: color, boxShadow: `0 0 10px ${color}` }}
            />
          </div>
        )}
        {secondary && !compact && <div className="mt-0.5 text-[8px] font-bold leading-none text-white/55">{secondary}</div>}
      </div>
    </div>
  )
}
