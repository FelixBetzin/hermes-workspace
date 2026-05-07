import { describe, expect, it } from 'vitest'

import {
  HUD_COLORS,
  getHudOrbAsset,
  getRemoteNametagVariant,
  getToastVariant,
} from './hud-skin'

describe('HermesWorld HUD skin mappings', () => {
  it('maps HP/MP/SP/XP orb art to the shipped wave assets', () => {
    expect(getHudOrbAsset('HP')).toContain('A02a-hp-orb.png')
    expect(getHudOrbAsset('MP')).toContain('A02b-mp-orb.png')
    expect(getHudOrbAsset('SP')).toContain('A02c-sp-orb.png')
    expect(getHudOrbAsset('XP')).toContain('A02d-xp-orb.png')
  })

  it('resolves remote nametag variants for friendly, enemy, and guildmate states', () => {
    expect(getRemoteNametagVariant({ world: 'agora', name: 'Aurora' })).toBe('friendly')
    expect(getRemoteNametagVariant({ world: 'arena', name: 'Rival' })).toBe('enemy')
    expect(getRemoteNametagVariant({ world: 'agora', name: '[Guild] Selene' })).toBe('guildmate')
  })

  it('maps quest, loot, and level-up toast kinds onto distinct themed variants', () => {
    expect(getToastVariant('quest').asset).toContain('A09-toast-variants.png')
    expect(getToastVariant('item').label).toBe('Loot')
    expect(getToastVariant('xp').label).toBe('Level Up')
    expect(getToastVariant('title').label).toBe('Level Up')
  })

  it('locks the exported palette to the approved HUD colors', () => {
    expect(HUD_COLORS.gold).toBe('#F1C56D')
    expect(HUD_COLORS.bronze).toBe('#B8862B')
    expect(HUD_COLORS.parchment).toBe('#F4E9D3')
    expect(HUD_COLORS.verdigris).toBe('#2E6A63')
    expect(HUD_COLORS.obsidian).toBe('#0A0D12')
  })
})
