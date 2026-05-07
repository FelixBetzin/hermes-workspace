import type { RewardToast } from '../hooks/use-playground-rpg'
import type { PlaygroundWorldId } from '../lib/playground-rpg'

export const HUD_COLORS = {
  gold: '#F1C56D',
  bronze: '#B8862B',
  parchment: '#F4E9D3',
  verdigris: '#2E6A63',
  obsidian: '#0A0D12',
} as const

const HUD_ASSET_ROOT = '/assets/hermesworld/hud/wave-a'
const HUD_CHAT_ASSET_ROOT = '/assets/hermesworld/hud/wave-chat'

export type OrbLabel = 'HP' | 'MP' | 'SP' | 'XP'
export type RemoteNametagVariant = 'friendly' | 'enemy' | 'guildmate'
export type ToastVariant = {
  asset: string
  backgroundPosition: string
  label: 'Quest' | 'Loot' | 'Level Up'
  borderColor: string
  glow: string
}

export const HUD_ORB_ASSETS: Record<OrbLabel, string> = {
  HP: `${HUD_ASSET_ROOT}/A02a-hp-orb.png`,
  MP: `${HUD_ASSET_ROOT}/A02b-mp-orb.png`,
  SP: `${HUD_ASSET_ROOT}/A02c-sp-orb.png`,
  XP: `${HUD_CHAT_ASSET_ROOT}/A02d-xp-orb.png`,
}

export function getHudOrbAsset(label: OrbLabel) {
  return HUD_ORB_ASSETS[label]
}

export const MINIMAP_CHROME_ASSET = `${HUD_ASSET_ROOT}/A04-minimap-chrome.png`
export const ACTION_BAR_ASSET = `${HUD_ASSET_ROOT}/A06-ability-bar.png`
export const ACTION_SLOT_STATES_ASSET = `${HUD_CHAT_ASSET_ROOT}/A06-ability-slot-states.png`
export const RIGHT_RAIL_ICONS_ASSET = `${HUD_CHAT_ASSET_ROOT}/A07-right-rail-icons.png`
export const ACTION_ICON_SET_ASSET = `${HUD_ASSET_ROOT}/A07-icon-set.png`

export const NAMETAG_ASSETS: Record<RemoteNametagVariant, string> = {
  friendly: `${HUD_ASSET_ROOT}/A08-nametag-friendly.png`,
  enemy: `${HUD_ASSET_ROOT}/A08-nametag-enemy.png`,
  guildmate: `${HUD_ASSET_ROOT}/A08-nametag-guildmate.png`,
}

export function getRemoteNametagVariant(remote: {
  world?: PlaygroundWorldId | string
  name: string
}) : RemoteNametagVariant {
  if (/\[(guild|claw|crew)\]/i.test(remote.name) || / guild /i.test(` ${remote.name} `)) {
    return 'guildmate'
  }
  if (remote.world === 'arena' || /enemy|rival|raider|hostile/i.test(remote.name)) {
    return 'enemy'
  }
  return 'friendly'
}

export function getRemoteNametagAsset(remote: {
  world?: PlaygroundWorldId | string
  name: string
}) {
  return NAMETAG_ASSETS[getRemoteNametagVariant(remote)]
}

export function getNametagStyle(variant: RemoteNametagVariant) {
  if (variant === 'enemy') {
    return {
      text: '#FCA5A5',
      border: '#EF4444',
      glow: 'rgba(239,68,68,0.35)',
    }
  }
  if (variant === 'guildmate') {
    return {
      text: HUD_COLORS.gold,
      border: HUD_COLORS.gold,
      glow: 'rgba(241,197,109,0.38)',
    }
  }
  return {
    text: '#67E8F9',
    border: '#22D3EE',
    glow: 'rgba(34,211,238,0.35)',
  }
}

export function getAbilitySlotStateBackground(state: 'ready' | 'cooldown' | 'disabled') {
  return {
    asset: ACTION_SLOT_STATES_ASSET,
    backgroundPosition:
      state === 'ready' ? '8% 48%'
      : state === 'cooldown' ? '51% 48%'
      : '92% 48%',
  }
}

export function getActionIconBackground(index: number) {
  const positions = ['10% 14%', '36% 14%', '63% 14%', '88% 14%', '10% 64%', '36% 64%', '63% 64%']
  return {
    asset: ACTION_ICON_SET_ASSET,
    backgroundPosition: positions[index % positions.length],
  }
}

export function getRightRailIconBackground(index: number) {
  const positions = ['10% 12%', '32% 12%', '54% 12%', '76% 12%', '10% 62%', '32% 62%', '54% 62%']
  return {
    asset: RIGHT_RAIL_ICONS_ASSET,
    backgroundPosition: positions[index % positions.length],
  }
}

export function getToastVariant(kind: RewardToast['kind']): ToastVariant {
  if (kind === 'item') {
    return {
      asset: `${HUD_CHAT_ASSET_ROOT}/A09-toast-variants.png`,
      backgroundPosition: '50% 24%',
      label: 'Loot',
      borderColor: HUD_COLORS.verdigris,
      glow: 'rgba(46,106,99,0.42)',
    }
  }
  if (kind === 'xp' || kind === 'title') {
    return {
      asset: `${HUD_CHAT_ASSET_ROOT}/A09-toast-variants.png`,
      backgroundPosition: '82% 24%',
      label: 'Level Up',
      borderColor: HUD_COLORS.gold,
      glow: 'rgba(241,197,109,0.44)',
    }
  }
  return {
    asset: `${HUD_CHAT_ASSET_ROOT}/A09-toast-variants.png`,
    backgroundPosition: '18% 24%',
    label: 'Quest',
    borderColor: HUD_COLORS.bronze,
    glow: 'rgba(184,134,43,0.4)',
  }
}
