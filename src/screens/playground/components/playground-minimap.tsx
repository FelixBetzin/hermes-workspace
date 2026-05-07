import { useEffect, useState } from 'react'

import type { PlaygroundWorldId } from '../lib/playground-rpg'
import { botsFor } from '../lib/playground-bots'
import { HUD_COLORS, MINIMAP_CHROME_ASSET } from './hud-skin'

const NPC_POSITIONS: Record<PlaygroundWorldId, Array<{ x: number; z: number; color: string }>> = {
  training: [
    { x: -9, z: 7, color: '#a78bfa' },
    { x: -3, z: 0, color: '#22d3ee' },
    { x: 8, z: -4, color: '#f59e0b' },
  ],
  agora: [
    { x: -5, z: 2, color: '#a78bfa' },
    { x: 5, z: 3, color: '#f59e0b' },
    { x: -3, z: -5, color: '#22d3ee' },
    { x: 6, z: -4, color: '#fb7185' },
  ],
  forge: [
    { x: -4, z: 0, color: '#34d399' },
    { x: 4, z: 0, color: '#facc15' },
  ],
  grove: [
    { x: -4, z: 1, color: '#34d399' },
    { x: 4, z: 0, color: '#f59e0b' },
    { x: 0, z: -5, color: '#9ca3af' },
  ],
  oracle: [
    { x: -3, z: -2, color: '#a78bfa' },
    { x: 3, z: -2, color: '#facc15' },
    { x: 0, z: 4, color: '#f472b6' },
  ],
  arena: [
    { x: -3, z: 4, color: '#fb7185' },
    { x: 3, z: 4, color: '#2dd4bf' },
    { x: 0, z: -5, color: '#facc15' },
  ],
}

const PORTAL_POSITION: Record<PlaygroundWorldId, { x: number; z: number }> = {
  training: { x: 14, z: -10 },
  agora: { x: 10, z: -2 },
  forge: { x: 10, z: -2 },
  grove: { x: 10, z: -2 },
  oracle: { x: 10, z: -2 },
  arena: { x: 10, z: -2 },
}

type Props = {
  worldId: PlaygroundWorldId
  worldName: string
  worldAccent: string
}

export function PlaygroundMinimap({ worldId, worldName, worldAccent }: Props) {
  const npcs = NPC_POSITIONS[worldId] ?? []
  const bots = botsFor(worldId)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const media = window.matchMedia('(pointer: coarse)')
    const update = () => setIsTouch(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  const size = isTouch ? 118 : 148
  const center = size / 2
  const map = (v: number) => center + (v / 30) * (size * 0.44)

  return (
    <div
      className="pointer-events-auto fixed right-3 top-3 z-[70] overflow-hidden rounded-[28px] border px-3 pb-3 pt-4 text-white shadow-2xl"
      style={{
        width: isTouch ? 188 : 214,
        borderColor: HUD_COLORS.bronze,
        backgroundColor: HUD_COLORS.obsidian,
        backgroundImage: `linear-gradient(180deg, rgba(10,13,18,.95), rgba(10,13,18,.92)), url(${MINIMAP_CHROME_ASSET})`,
        backgroundPosition: 'center, center',
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundSize: 'auto, cover',
        boxShadow: `0 0 22px ${worldAccent}22, 0 14px 36px rgba(0,0,0,.62), inset 0 0 0 1px rgba(241,197,109,.1)`,
      }}
    >
      <div className="mb-2 flex items-center justify-between px-2">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: HUD_COLORS.parchment }}>
            Minimap
          </div>
          <div className="text-[12px] font-black uppercase tracking-[0.12em]" style={{ color: worldAccent }}>
            {worldName}
          </div>
        </div>
        <span className="rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em]" style={{ borderColor: `${HUD_COLORS.gold}55`, color: HUD_COLORS.gold }}>
          M
        </span>
      </div>
      <div
        className="relative mx-auto overflow-hidden rounded-[22px] border"
        style={{
          width: size,
          height: size,
          borderColor: `${HUD_COLORS.parchment}20`,
          background:
            'radial-gradient(circle at 50% 46%, rgba(46,106,99,.24), rgba(10,13,18,.94) 70%), repeating-linear-gradient(0deg, rgba(244,233,211,.05) 0 1px, transparent 1px 18px), repeating-linear-gradient(90deg, rgba(244,233,211,.05) 0 1px, transparent 1px 18px)',
        }}
      >
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{ left: center, top: center, width: isTouch ? 12 : 14, height: isTouch ? 12 : 14, borderColor: `${HUD_COLORS.gold}aa` }}
        />
        <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: center, top: center, width: isTouch ? 8 : 10, height: isTouch ? 8 : 10, background: HUD_COLORS.gold, boxShadow: `0 0 12px ${HUD_COLORS.gold}` }} />
        {npcs.map((n, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: map(n.x),
              top: map(n.z),
              width: isTouch ? 5 : 6,
              height: isTouch ? 5 : 6,
              background: n.color,
              boxShadow: `0 0 4px ${n.color}`,
            }}
          />
        ))}
        {bots.map((b, i) => (
          <div
            key={`b-${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-sm"
            style={{
              left: map(b.spawn[0]),
              top: map(b.spawn[2]),
              width: isTouch ? 4 : 5,
              height: isTouch ? 4 : 5,
              background: b.color,
              boxShadow: `0 0 4px ${b.color}`,
            }}
          />
        ))}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            left: map(PORTAL_POSITION[worldId].x),
            top: map(PORTAL_POSITION[worldId].z),
            width: isTouch ? 10 : 12,
            height: isTouch ? 10 : 12,
            borderColor: worldAccent,
            background: `${worldAccent}22`,
            boxShadow: `0 0 8px ${worldAccent}`,
          }}
        />
      </div>
      {!isTouch && (
        <div className="mt-2 flex justify-between px-2 text-[8px] uppercase tracking-[0.14em] text-white/58">
          <span style={{ color: HUD_COLORS.parchment }}>● You</span>
          <span style={{ color: worldAccent }}>○ Portal</span>
        </div>
      )}
    </div>
  )
}
