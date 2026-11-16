import { HR, DAY, seenText } from "./format"

export const muteMs = { "8h": 8 * HR, "1w": 7 * DAY, always: -1 }
export const isMuted = c => c.muted === -1 || c.muted > Date.now()
export const muteLabel = c =>
  !isMuted(c) ? "Notifications are on" : c.muted === -1 ? "Muted until you turn it back on" : "Muted until " + new Date(c.muted).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })
export const presence = c => (c.blocked ? "" : c.typing ? "typing…" : c.online ? "Online" : seenText(c.lastSeen))
export const presenceClass = c => (!c.blocked && (c.typing || c.online) ? "on" : "")
