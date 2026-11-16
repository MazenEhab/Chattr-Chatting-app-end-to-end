export const MIN = 6e4
export const HR = 36e5
export const DAY = 864e5
export const wait = ms => new Promise(r => setTimeout(r, ms))
export const validEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
export const time = t => new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
export const dayKey = t => new Date(t).toDateString()
export const dayLabel = t => {
  const diff = Math.round((new Date(new Date().toDateString()) - new Date(dayKey(t))) / DAY)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  return new Date(t).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })
}
export const listTime = t => dayLabel(t) === "Today" ? time(t) : dayLabel(t)
export const seenText = t => {
  const l = dayLabel(t)
  return "Last seen " + (l === "Today" || l === "Yesterday" ? l.toLowerCase() : l) + " at " + time(t)
}

