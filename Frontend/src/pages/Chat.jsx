import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api, MOCK, nextId } from "../lib/api"
import { useSession } from "../lib/session"
import { listTime } from "../lib/format"
import { displayName, normalizePerson } from "../lib/profile"
import { isMuted, muteMs } from "../lib/chat"
import Avatar from "../components/Avatar"
import Tick from "../components/Tick"
import Thread from "../components/Thread"
import ContactInfo from "../components/ContactInfo"
import ContextMenu from "../components/ContextMenu"
import Confirm from "../components/Confirm"
import { MuteIcon, Pin } from "../components/Icons"

const replies = ["Haha, exactly 😄", "Give me five minutes", "Sounds good to me", "Wait, really? Tell me more", "On my way ✨", "Let’s do it 👍"]

const rowSort = (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.messages.at(-1)?.at || 0) - (a.messages.at(-1)?.at || 0)

const SkRows = ({ n }) =>
  Array.from({ length: n }, (_, i) => (
    <li className="row sk-row" key={i} aria-hidden="true">
      <span className="sk av" />
      <span className="rb"><span className="sk line w60" /><span className="sk line w90" /></span>
    </li>
  ))

function ChatRow({ c, on, onOpen, onInfo, onMenu }) {
  const m = c.messages.at(-1)
  const lp = useRef()
  const fired = useRef(false)
  const cancel = () => clearTimeout(lp.current)
  return (
    <li>
      <button
        className={`row${on ? " on" : ""}`}
        aria-current={on || undefined}
        onClick={e => {
          if (fired.current) return (fired.current = false)
          e.target.closest(".av") ? onInfo() : onOpen()
        }}
        onContextMenu={e => {
          e.preventDefault()
          if (e.clientX || e.clientY) return onMenu(e.clientX, e.clientY)
          const r = e.currentTarget.getBoundingClientRect()
          onMenu(r.left + 48, r.bottom)
        }}
        onTouchStart={e => {
          const t = e.touches[0]
          lp.current = setTimeout(() => {
            fired.current = true
            onMenu(t.clientX, t.clientY)
          }, 550)
        }}
        onTouchEnd={cancel}
        onTouchMove={cancel}
        onTouchCancel={cancel}
      >
        <Avatar c={c} />
        <span className="rb">
          <span className="rt">
            <strong>{displayName(c)}{c.blocked && <span className="tag">Blocked</span>}</strong>
            <span className="rtime">
              {c.pinned && <span className="mi" title="Pinned"><Pin /></span>}
              {isMuted(c) && <span className="mi" title="Muted"><MuteIcon /></span>}
              <time>{m ? listTime(m.at) : ""}</time>
            </span>
          </span>
          <span className="rp">
            <span className="pv">
              {c.typing ? <span className="pt on">typing…</span> : m ? <>{m.from === "me" && <Tick s={m.status} />}<span className="pt">{m.text}</span></> : <span className="pt">No messages yet</span>}
            </span>
            {c.unread > 0 && <b className={`badge${isMuted(c) ? " muted" : ""}`} aria-label={`${c.unread} unread`}>{c.unread}</b>}
          </span>
        </span>
      </button>
    </li>
  )
}

export default function Chat() {
  const nav = useNavigate()
  const { user } = useSession()
  const [chats, setChats] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [view, setView] = useState("list")
  const [info, setInfo] = useState(false)
  const [menu, setMenu] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [q, setQ] = useState("")
  const [filter, setFilter] = useState("all")
  const [people, setPeople] = useState([])
  const [searching, setSearching] = useState(false)
  const ref = useRef([])
  const activeRef = useRef(null)
  ref.current = chats || []
  activeRef.current = activeId
  const active = chats?.find(c => c.id === activeId)
  const find = id => ref.current.find(c => c.id === id)
  const closeMenu = useCallback(() => setMenu(null), [])
  const term = q.trim().toLowerCase().replace(/^@/, "")

  const patch = (id, change) =>
    setChats(cs => cs.map(c => (c.id === id ? { ...c, ...(typeof change === "function" ? change(c) : change) } : c)))

  const undoable = (id, fields, path, body) => {
    const snap = Object.fromEntries(Object.keys(fields).map(k => [k, find(id)[k]]))
    patch(id, fields)
    api(path, body).catch(() => patch(id, snap))
  }

  useEffect(() => {
    api("/chats").then(r => setChats((r.chats || []).map(normalizePerson)))
  }, [])

  useEffect(() => {
    const t = term.length > 1 ? term : ""
    setPeople([])
    setSearching(!!t)
    if (!t) return
    let stale = false
    const timer = setTimeout(async () => {
      const r = await api("/users?q=" + encodeURIComponent(t)).catch(() => ({ users: [] }))
      if (stale) return
      setPeople((r.users || []).map(normalizePerson))
      setSearching(false)
    }, 300)
    return () => {
      stale = true
      clearTimeout(timer)
    }
  }, [term])

  useEffect(() => {
    const onKey = e => {
      if (e.key !== "Escape") return
      if (menu) setMenu(null)
      else if (confirm) setConfirm(null)
      else if (info) closeInfo()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [menu, confirm, info])

  const rows = useMemo(
    () => (chats || []).filter(c => (displayName(c).toLowerCase().includes(term) || (c.username || "").toLowerCase().includes(term)) && (filter === "all" || c.unread)).sort(rowSort),
    [chats, term, filter]
  )

  function closeInfo() {
    setInfo(false)
    document.getElementById("who")?.focus()
  }

  function open(id) {
    setActiveId(id)
    setView("thread")
    setInfo(false)
    const c = find(id)
    if (!c) return
    if (c.unread) {
      patch(id, { unread: 0 })
      api("/chats/seen", { chatId: id }).catch(() => {})
    }
    if (!c.loaded) load(id, false)
  }

  async function load(id, older) {
    const c = find(id)
    if (c.loading) return
    patch(id, { loading: true })
    const r = await api(`/chats/${id}/messages?limit=20&before=${older ? c.messages[0].at : ""}`).catch(() => null)
    patch(id, cur => {
      if (!r) return { loading: false, loaded: true }
      const lastAt = r.messages.at(-1)?.at ?? 0
      return { loading: false, loaded: true, more: r.more, messages: older ? [...r.messages, ...cur.messages] : [...r.messages, ...cur.messages.filter(m => m.at > lastAt)] }
    })
  }

  async function start(username) {
    const c = normalizePerson(await api("/chats", { username }))
    setChats(cs => [...cs, { ...c, loaded: true }])
    setQ("")
    open(c.id)
  }

  function simulate(id, mid) {
    const c = find(id)
    if (!MOCK || !c?.online || c.blocked) return
    const mark = status => patch(id, cur => ({ messages: cur.messages.map(m => (m.id === mid ? { ...m, status } : m)) }))
    setTimeout(() => mark("delivered"), 900)
    setTimeout(() => mark("seen"), 2200)
    setTimeout(() => patch(id, { typing: true }), 3200)
    setTimeout(() => patch(id, cur => ({
      typing: false,
      messages: [...cur.messages, { id: nextId(), from: "them", text: replies[Math.floor(Math.random() * replies.length)], at: Date.now() }],
      unread: activeRef.current === id ? cur.unread : cur.unread + 1
    })), 5200)
  }

  async function send(id, text, retryId) {
    const mid = retryId ?? nextId()
    const set = change => patch(id, cur => ({ messages: cur.messages.map(m => (m.id === mid ? { ...m, ...change } : m)) }))
    if (retryId) set({ status: "sending" })
    else patch(id, cur => ({ messages: [...cur.messages, { id: mid, from: "me", text, at: Date.now(), status: "sending" }] }))
    try {
      const r = await api("/messages", { chatId: id, text })
      set({ id: r.id, at: r.at, status: r.status })
      simulate(id, r.id)
    } catch {
      set({ status: "failed" })
    }
  }

  const mute = (id, key) => {
    const ms = muteMs[key]
    const muted = !ms ? 0 : ms === -1 ? -1 : Date.now() + ms
    undoable(id, { muted, muteKey: ms ? key : "" }, "/chats/mute", { chatId: id, muted })
  }
  const block = (id, blocked) => undoable(id, { blocked, typing: false }, "/chats/block", { chatId: id, blocked })
  const pin = id => undoable(id, { pinned: !find(id).pinned }, "/chats/pin", { chatId: id, pinned: !find(id).pinned })
  const toggleUnread = id => undoable(id, { unread: find(id).unread ? 0 : 1 }, "/chats/unread", { chatId: id, unread: !find(id).unread })
  const clear = id => undoable(id, { messages: [], more: false, loaded: true }, "/chats/clear", { chatId: id })

  function remove(id) {
    const snap = ref.current
    setChats(cs => cs.filter(c => c.id !== id))
    if (activeId === id) {
      setActiveId(null)
      setView("list")
      setInfo(false)
    }
    api(`/chats/${id}`, undefined, "DELETE").catch(() => setChats(snap))
  }

  function confirmed() {
    const { kind, id } = confirm
    setConfirm(null)
    if (kind === "delete") remove(id)
    else if (kind === "clear") clear(id)
    else block(id, true)
  }

  function menuItems(c) {
    return [
      { label: "Open chat", onClick: () => open(c.id) },
      { label: c.pinned ? "Unpin chat" : "Pin chat", onClick: () => pin(c.id) },
      { label: c.unread ? "Mark as read" : "Mark as unread", onClick: () => toggleUnread(c.id) },
      ...(isMuted(c)
        ? [{ label: "Unmute", onClick: () => mute(c.id, "off") }]
        : [{ label: "Mute for 8 hours", onClick: () => mute(c.id, "8h") }, { label: "Mute always", onClick: () => mute(c.id, "always") }]),
      { label: "Contact info", onClick: () => { open(c.id); setInfo(true) } },
      { sep: true },
      { label: "Clear messages", onClick: () => setConfirm({ kind: "clear", id: c.id }) },
      c.blocked ? { label: "Unblock", onClick: () => block(c.id, false) } : { label: "Block", onClick: () => setConfirm({ kind: "block", id: c.id }) },
      { label: "Delete chat", danger: true, onClick: () => setConfirm({ kind: "delete", id: c.id }) }
    ]
  }

  const menuChat = menu && find(menu.id)
  const confirmChat = confirm && find(confirm.id)

  return (
    <div className="chat" data-view={view}>
      <aside className="side">
        <header className="top">
          <img src="/logo.png" alt="" />
          <span className="brand">Chattr</span>
          <button className="mine" onClick={() => nav("/settings")} aria-label="Settings" title="Settings">
            <Avatar c={{ id: 0, nickname: displayName(user), username: user.username, photo: user.photo }} />
          </button>
        </header>
        <div className="rail" aria-label="Online now">
          {chats?.filter(c => c.online && !c.blocked).map(c => (
            <button key={c.id} className="story" aria-label={`Open chat with ${displayName(c)}`} onClick={() => open(c.id)}>
              <span className="ring"><Avatar c={c} /></span>
              <span className="n">{displayName(c).split(" ")[0]}</span>
            </button>
          ))}
        </div>
        <label className="search">
          <span className="sr">Search chats or find people by username</span>
          <input type="search" placeholder="Search chats or find @username" autoComplete="off" value={q} onChange={e => setQ(e.target.value)} />
        </label>
        <div className="chips">
          {["all", "unread"].map(f => (
            <button key={f} className="chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f === "all" ? "All" : "Unread"}</button>
          ))}
        </div>
        <ul className="list" aria-busy={!chats}>
          {!chats && <SkRows n={7} />}
          {rows.map(c => (
            <ChatRow key={c.id} c={c} on={c.id === activeId} onOpen={() => open(c.id)} onInfo={() => { open(c.id); setInfo(true) }} onMenu={(x, y) => setMenu({ x, y, id: c.id })} />
          ))}
          {chats && term && (
            <>
              <li className="none head">Find people</li>
              {searching ? <SkRows n={2} /> : people.length ? people.map(u => (
                <li key={u.id}>
                  <button className="row" onClick={() => start(u.username)}>
                    <Avatar c={u} />
                    <span className="rb"><strong>{displayName(u)}</strong><span className="pv"><span className="pt">@{u.username}</span></span></span>
                    <span className="go">Chat</span>
                  </button>
                </li>
              )) : term.length > 1 && <li className="none">No one goes by @{term}.</li>}
            </>
          )}
          {chats && !term && !rows.length && <li className="none">{filter === "unread" ? "You’re all caught up." : "No conversations yet. Search a @username to start one."}</li>}
        </ul>
      </aside>
      {active ? (
        <Thread
          key={active.id}
          c={active}
          onBack={() => setView("list")}
          onInfo={() => setInfo(true)}
          onSend={t => send(active.id, t)}
          onRetry={m => send(active.id, m.text, m.id)}
          onLoadOlder={() => load(active.id, true)}
          onUnblock={() => block(active.id, false)}
        >
          {info && <ContactInfo c={active} onClose={closeInfo} onMute={k => mute(active.id, k)} onAsk={kind => setConfirm({ kind, id: active.id })} onBlock={v => block(active.id, v)} />}
        </Thread>
      ) : (
        <section className="thread">
          <div className="idle">
            <img src="/logo.png" alt="" />
            <h2>Your conversations</h2>
            <p>Select a chat to read it, or search a @username to start a new one.</p>
          </div>
        </section>
      )}
      {menuChat && <ContextMenu x={menu.x} y={menu.y} items={menuItems(menuChat)} onClose={closeMenu} />}
      {confirmChat && <Confirm kind={confirm.kind} name={displayName(confirmChat)} onYes={confirmed} onNo={() => setConfirm(null)} />}
    </div>
  )
}
