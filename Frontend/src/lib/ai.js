import { useCallback, useEffect, useRef, useState } from "react"
import { api } from "./api"

export const AI_ID = "ai"
export const MAX_FILES = 4
export const MAX_IMAGE = 15 * 1024 * 1024
export const MAX_PDF = 4 * 1024 * 1024
export const MAX_TEXT = 200 * 1024
export const MAX_TOTAL = 12 * 1024 * 1024
export const ACCEPT = "image/png,image/jpeg,image/webp,application/pdf,text/*,.md,.csv,.json,.js,.jsx,.ts,.tsx,.py,.html,.css,.java,.c,.cpp,.cs,.go,.rs,.php,.sql,.xml,.yml,.yaml,.log"

const IMAGES = ["image/png", "image/jpeg", "image/webp"]
const TEXT_EXT = /\.(txt|md|csv|json|js|jsx|ts|tsx|py|html|css|java|c|cpp|cs|go|rs|php|sql|xml|yml|yaml|log)$/i
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export const kindOf = f =>
  IMAGES.includes(f.type) ? "image" : f.type === "application/pdf" ? "pdf" : f.type.startsWith("text/") || TEXT_EXT.test(f.name) ? "text" : null

const toBase64 = file =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result).split(",")[1])
    r.onerror = () => reject(new Error("Couldn’t read " + file.name))
    r.readAsDataURL(file)
  })

async function rasterize(file) {
  const bmp = await createImageBitmap(file)
  const draw = max => {
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height))
    const c = document.createElement("canvas")
    c.width = Math.round(bmp.width * k)
    c.height = Math.round(bmp.height * k)
    const g = c.getContext("2d")
    g.fillStyle = "#fff"
    g.fillRect(0, 0, c.width, c.height)
    g.drawImage(bmp, 0, 0, c.width, c.height)
    return c
  }
  const data = draw(1600).toDataURL("image/jpeg", 0.85).split(",")[1]
  const thumb = draw(220).toDataURL("image/jpeg", 0.7)
  bmp.close?.()
  return { data, thumb }
}

export async function prepare(files, have = 0, haveBytes = 0) {
  const out = []
  let error = ""
  let total = haveBytes
  for (const f of files) {
    if (have + out.length >= MAX_FILES) {
      error = `You can attach up to ${MAX_FILES} files.`
      break
    }
    const kind = kindOf(f)
    if (!kind) {
      error = `${f.name} isn’t supported. Attach images (PNG, JPG, WebP), PDFs, or text and code files.`
      continue
    }
    const limit = kind === "image" ? MAX_IMAGE : kind === "pdf" ? MAX_PDF : MAX_TEXT
    if (f.size > limit) {
      error = `${f.name} is too large. The limit is ${Math.round(limit / 1024 / 1024 * 10) / 10 || 0.2} MB for this file type.`
      continue
    }
    if (total + (kind === "image" ? 0 : f.size) > MAX_TOTAL) {
      error = "Those files add up to too much. Try fewer or smaller ones."
      continue
    }
    try {
      if (kind === "text") {
        out.push({ id: uid(), name: f.name, mime: f.type || "text/plain", size: f.size, kind, content: await f.text() })
      } else if (kind === "image") {
        const r = await rasterize(f)
        out.push({ id: uid(), name: f.name, mime: "image/jpeg", size: f.size, kind, data: r.data, thumb: r.thumb })
      } else {
        out.push({ id: uid(), name: f.name, mime: f.type, size: f.size, kind, data: await toBase64(f) })
      }
      if (kind !== "image") total += f.size
    } catch (e) {
      error = e.message || `Couldn’t read ${f.name}.`
    }
  }
  return { out, error }
}

const storeKey = key => "chattr-ai:" + key

const load = key => {
  try {
    const list = JSON.parse(localStorage.getItem(storeKey(key))) || []
    return list.map(m => (m.status === "sending" ? { ...m, status: "failed", error: "This message didn’t finish sending." } : m))
  } catch {
    return []
  }
}

const save = (key, messages) => {
  try {
    localStorage.setItem(storeKey(key), JSON.stringify(messages.slice(-150)))
  } catch {
    try {
      localStorage.setItem(storeKey(key), JSON.stringify(messages.slice(-150).map(({ attachments, ...m }) => m)))
    } catch {}
  }
}

const note = m => (m.attachments?.length ? `${m.text || ""}\n[Attached: ${m.attachments.map(a => a.name).join(", ")}]`.trim() : m.text || "")

export function useAiChat(key) {
  const [messages, setMessages] = useState(() => load(key))
  const [busy, setBusy] = useState(false)
  const blobs = useRef(new Map())
  const list = useRef(messages)
  list.current = messages

  useEffect(() => {
    save(key, messages)
  }, [key, messages])

  const ask = useCallback(async mid => {
    const upto = list.current.findIndex(m => m.id === mid)
    const recent = list.current
      .slice(0, upto + 1)
      .filter(m => m.id === mid || m.status !== "failed")
      .slice(-20)
    const history = recent.map(m => {
      const out = { role: m.from === "me" ? "user" : "model", text: m.id === mid ? m.text || "" : note(m) }
      if (m.id === mid && blobs.current.has(mid)) out.attachments = blobs.current.get(mid)
      return out
    })
    setMessages(ms => ms.map(m => (m.id === mid ? { ...m, status: "sending", error: "" } : m)))
    setBusy(true)
    try {
      const r = await api("/ai/chat", { messages: history })
      blobs.current.delete(mid)
      setMessages(ms => [...ms.map(m => (m.id === mid ? { ...m, status: "seen" } : m)), { id: uid(), from: "them", text: r.text || "", at: Date.now() }])
    } catch (e) {
      setMessages(ms => ms.map(m => (m.id === mid ? { ...m, status: "failed", error: e.message } : m)))
    } finally {
      setBusy(false)
    }
  }, [])

  const send = useCallback(
    (text, files = []) => {
      if (busy) return
      const mid = uid()
      if (files.length) blobs.current.set(mid, files.map(({ name, mime, data, content }) => ({ name, mime, data, content })))
      const attachments = files.map(({ name, mime, size, kind, thumb }) => ({ name, mime, size, kind, thumb: thumb || "" }))
      const msg = { id: mid, from: "me", text, at: Date.now(), status: "sending", ...(attachments.length ? { attachments } : {}) }
      list.current = [...list.current, msg]
      setMessages(list.current)
      ask(mid)
    },
    [busy, ask]
  )

  const retry = useCallback(
    m => {
      if (!busy) ask(m.id)
    },
    [busy, ask]
  )

  const clear = useCallback(() => {
    blobs.current.clear()
    setMessages([])
  }, [])

  return { messages, busy, send, retry, clear }
}
