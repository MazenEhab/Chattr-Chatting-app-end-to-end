import { MIN, HR, DAY, wait } from "./format"

export const MOCK = import.meta.env.VITE_MOCK === "true";

const t0 = Date.now()
let uid = 100
export const nextId = () => ++uid
const msg = (from, text, ago, status) => ({ id: ++uid, from, text, at: t0 - ago, status })
const art = i => {
  const p = ["#E07A5F", "#3D5A80", "#F2CC8F", "#81B29A", "#B5838D", "#6D6875"]
  const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${p[i % 6]}"/><circle cx="${30 + (i * 7) % 40}" cy="74" r="38" fill="${p[(i + 2) % 6]}"/><circle cx="68" cy="${26 + (i * 5) % 20}" r="16" fill="${p[(i + 4) % 6]}"/></svg>`
  return "data:image/svg+xml," + encodeURIComponent(s)
}
const db = {
  chats: [
    {
      id: 1, name: "Nour Hassan", username: "nour_h", photo: art(1), online: true, lastSeen: t0, unread: 2,
      messages: [
        msg("me", "Did you get the design files?", DAY + 3 * HR, "seen"),
        msg("them", "Yes, looking at them now. The logo is great 🧡", DAY + 2 * HR),
        msg("me", "Haha thanks, it took me forever", DAY + 2 * HR - 4 * MIN, "seen"),
        msg("them", "Can we talk through the colours tomorrow?", 12 * MIN),
        msg("them", "I’m free after 3", 11 * MIN)
      ]
    },
    {
      id: 2, name: "Omar Khaled", username: "omar_k", muted: t0 + 5 * HR, muteKey: "8h", photo: art(2), online: false, lastSeen: t0 - 20 * HR, unread: 0,
      messages: [
        msg("them", "Server is back up", DAY + 5 * HR),
        msg("me", "Thanks, checking the logs", DAY + 4 * HR, "seen"),
        msg("me", "All clear on my side", 40 * MIN, "sent")
      ]
    },
    {
      id: 3, name: "Salma Adel", username: "salma_a", photo: art(3), online: false, lastSeen: t0 - 3 * HR, unread: 0,
      messages: [
        msg("me", "Lunch on Thursday?", 4 * DAY, "seen"),
        msg("them", "Thursday works. Same place?", 4 * DAY - 5 * MIN),
        msg("me", "Same place, 1pm", 4 * DAY - 8 * MIN, "seen"),
        msg("them", "Perfect, I’ll book a table ☕", 4 * DAY - 12 * MIN)
      ]
    },
    {
      id: 4, name: "Youssef Tarek", username: "youssef_t", photo: art(4), online: true, lastSeen: t0, unread: 0,
      messages: [
        msg("them", "Did you watch the match last night? ⚽", 2 * DAY + HR),
        msg("me", "Obviously. That last goal 🔥", 2 * DAY + HR - 2 * MIN, "seen"),
        msg("them", "Unreal. Same time next week?", 2 * DAY + HR - 3 * MIN),
        msg("me", "Count me in", 2 * DAY, "seen"),
        msg("me", "Booked the table for 8", 25 * MIN, "delivered")
      ]
    },
    {
      id: 5, name: "Mariam Fathy", username: "mariam_f", photo: art(5), online: true, lastSeen: t0, unread: 1,
      messages: [
        msg("me", "Can you send the final invoice today?", HR, "seen"),
        msg("them", "Morning! Sent it, check your email 📩", 8 * MIN)
      ]
    },
    {
      id: 6, name: "Karim Mostafa", username: "karim_m", blocked: true, photo: art(6), online: false, lastSeen: t0 - 2 * DAY, unread: 0,
      messages: [
        msg("me", "Thanks again for the help with the deployment", 3 * DAY, "seen"),
        msg("them", "Anytime. Ping me if it breaks again 😅", 3 * DAY - 10 * MIN),
        msg("me", "Will do. Coffee on me next time", 3 * DAY - 12 * MIN, "seen")
      ]
    },
    {
      id: 7, name: "Laila Samir", username: "laila_s", muted: -1, muteKey: "always", photo: art(7), online: false, lastSeen: t0 - 6 * HR, unread: 3,
      messages: [
        msg("them", "Hey, are you coming tonight?", 7 * HR),
        msg("them", "Everyone’s asking about you", 7 * HR - MIN),
        msg("them", "Call me when you see this", 6 * HR + 30 * MIN)
      ]
    }
  ]
}

db.people = [
  { id: 8, name: "Hana Ali", username: "hana_ali", photo: art(8), online: true },
  { id: 9, name: "Tamer Sherif", username: "tamer_s", photo: art(9), online: false },
  { id: 10, name: "Dina Magdy", username: "dina_m", photo: art(10), online: true },
  { id: 11, name: "Ziad Osama", username: "ziad_o", photo: art(11), online: false },
  { id: 12, name: "Farah Nabil", username: "farah_n", photo: art(12), online: true }
]

const talk = ["Morning! ☀️", "Did you see that?", "Haha no way", "Send me the link", "On it", "Give me a sec", "Sounds good", "Wait, what?", "Okay, deal", "Thanks!", "Let me check", "Same here"]
for (const c of db.chats.filter(x => x.id === 1 || x.id === 4)) {
  const first = c.messages[0].at
  const older = Array.from({ length: 48 }, (_, i) => {
    const from = i % 3 === 1 ? "me" : "them"
    return { id: ++uid, from, text: talk[(i * 5 + c.id) % talk.length], at: first - (48 - i) * 53 * MIN, status: from === "me" ? "seen" : undefined }
  })
  c.messages.unshift(...older)
}

let signup = {}
const me = () => ({ id: "me", name: signup.name || "Demo user", username: signup.username || "demo_user", nick: signup.nick || "", photo: signup.photo || "", lastSeen: true, receipts: true })

async function mock(path, body) {
  if (path === "/auth/me") return {}
  await wait(path === "/messages" ? 900 : path === "/chats" && !body ? 1400 : path.includes("/messages?") ? 800 : 450)
  if (path === "/auth/signup") signup = body
  if (path === "/auth/verify" && body.code === "XXXXXX") throw new Error("That code isn’t right. Check your email and try again.")
  if (path === "/auth/login" || (path === "/auth/verify" && body.mode === "signup")) return { user: me() }
  if (path === "/auth/verify") return { token: "demo-token" }
  if (path === "/chats" && !body) return { chats: db.chats.map(c => ({ ...c, messages: c.messages.slice(-1) })) }
  if (path === "/chats") {
    const p = db.people.find(u => u.username === body.username)
    if (!p) throw new Error("No one goes by @" + body.username + ".")
    const c = { ...p, lastSeen: Date.now() - 5 * MIN, unread: 0, messages: [] }
    db.chats.push(c)
    return c
  }
  if (path.startsWith("/users?q=")) {
    const q = decodeURIComponent(path.slice(9)).toLowerCase().replace(/^@/, "")
    const have = db.chats.map(c => c.username)
    return { users: db.people.filter(u => u.username.includes(q) && !have.includes(u.username)).slice(0, 5) }
  }
  const page = path.match(/^\/chats\/(\d+)\/messages\?limit=(\d+)&before=(\d*)$/)
  if (page) {
    const c = db.chats.find(x => x.id === Number(page[1]))
    const all = page[3] ? c.messages.filter(x => x.at < Number(page[3])) : c.messages
    const msgs = all.slice(-Number(page[2]))
    return { messages: msgs, more: all.length > msgs.length }
  }
  if (path === "/messages") {
    if (body.text.includes("#fail")) throw new Error("Network error")
    return { id: Date.now(), at: Date.now(), status: "sent" }
  }
  return {}
}

export async function api(path, body, method) {
  if (MOCK) return mock(path, body)
  const res = await fetch("/api" + path, {
    method: method || (body ? "POST" : "GET"),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(data.message || "Something went wrong. Try again.")
    error.status = res.status
    error.data = data
    throw error
  }
  return data
}

