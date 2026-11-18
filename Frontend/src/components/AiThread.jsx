import { useLayoutEffect, useRef, useState } from "react"
import Tick from "./Tick"
import Markdown from "./Markdown"
import { Back, FileIcon, Paperclip, Send, Sparkle, Trash, XSmall } from "./Icons"
import { ACCEPT, prepare } from "../lib/ai"
import { dayKey, dayLabel, listTime, time } from "../lib/format"

const ideas = ["Explain something in simple words", "Help me write a message", "Review my code", "Summarize a file"]

const preview = m => {
  if (!m) return "Ask anything, attach files"
  const t = (m.text || "").replace(/[`*#>_|]/g, "").replace(/\s+/g, " ").trim()
  return t || (m.attachments?.length ? `📎 ${m.attachments[0].name}` : "")
}

export function AiRow({ ai, on, onOpen }) {
  const m = ai.messages.at(-1)
  return (
    <li>
      <button className={`row${on ? " on" : ""}`} aria-current={on || undefined} onClick={onOpen}>
        <span className="av ai" aria-hidden="true"><Sparkle /></span>
        <span className="rb">
          <span className="rt">
            <strong>Gemini<span className="tag">AI</span></strong>
            <span className="rtime"><time>{m ? listTime(m.at) : ""}</time></span>
          </span>
          <span className="rp">
            <span className="pv">
              {ai.busy ? <span className="pt on">thinking…</span> : <>{m?.from === "me" && <Tick s={m.status} />}<span className="pt">{preview(m)}</span></>}
            </span>
          </span>
        </span>
      </button>
    </li>
  )
}

function Copy({ text }) {
  const [done, setDone] = useState(false)
  return (
    <button
      className="copy"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        })
      }}
    >
      {done ? "Copied" : "Copy"}
    </button>
  )
}

function Attachments({ list }) {
  return (
    <div className="atts">
      {list.map((a, i) =>
        a.thumb ? (
          <img className="att-img" src={a.thumb} alt={a.name} key={i} />
        ) : (
          <span className="att-file" key={i}><FileIcon /><span>{a.name}</span></span>
        )
      )}
    </div>
  )
}

export default function AiThread({ ai, onBack, onClear }) {
  const [text, setText] = useState("")
  const [files, setFiles] = useState([])
  const [error, setError] = useState("")
  const [drag, setDrag] = useState(false)
  const box = useRef()
  const ta = useRef()
  const pick = useRef()
  const depth = useRef(0)
  const { messages, busy } = ai
  const ready = !!text.trim() || files.length > 0

  useLayoutEffect(() => {
    box.current.scrollTop = box.current.scrollHeight
  }, [messages.length, busy])

  useLayoutEffect(() => {
    ta.current.style.height = "auto"
    ta.current.style.height = Math.min(ta.current.scrollHeight, 120) + "px"
  }, [text])

  async function add(list) {
    const picked = [...list]
    if (!picked.length) return
    const bytes = files.reduce((n, f) => n + (f.kind === "image" ? 0 : f.size), 0)
    const { out, error: e } = await prepare(picked, files.length, bytes)
    setError(e)
    if (out.length) setFiles(f => [...f, ...out])
  }

  function submit(e) {
    e?.preventDefault()
    if (!ready || busy) return
    const t = text.trim()
    const f = files
    setText("")
    setFiles([])
    setError("")
    ai.send(t, f)
  }

  let prev = ""
  const items = []
  for (const m of messages) {
    const k = dayKey(m.at)
    if (k !== prev) {
      items.push(<div className="day" key={"d" + k}>{dayLabel(m.at)}</div>)
      prev = k
    }
    items.push(
      <div className={`m ${m.from}${m.from === "them" ? " ai" : ""}${m.status === "sending" ? " sending" : ""}`} key={m.id}>
        <div className="bubble">
          {m.attachments?.length > 0 && <Attachments list={m.attachments} />}
          {m.from === "them" ? <Markdown text={m.text} /> : m.text && <span className="txt">{m.text}</span>}
          <span className="meta">
            <time>{time(m.at)}</time>
            {m.from === "me" && <Tick s={m.status} />}
            {m.from === "them" && <Copy text={m.text} />}
            {m.status === "failed" && <button className="retry" onClick={() => ai.retry(m)}>Tap to retry</button>}
          </span>
          {m.status === "failed" && m.error && <span className="aierr" role="alert">{m.error}</span>}
        </div>
      </div>
    )
  }

  return (
    <section
      className={`thread${drag ? " dragging" : ""}`}
      onDragEnter={e => {
        if (!e.dataTransfer?.types?.includes("Files")) return
        depth.current++
        setDrag(true)
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1)
        if (!depth.current) setDrag(false)
      }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault()
        depth.current = 0
        setDrag(false)
        add(e.dataTransfer.files)
      }}
    >
      <header className="bar">
        <button className="ghost back" onClick={onBack} aria-label="Back to chats"><Back /></button>
        <div className="who static">
          <span className="av ai" aria-hidden="true"><Sparkle /></span>
          <div className="title">
            <strong>Gemini</strong>
            <small className={busy ? "on" : ""}>{busy ? "thinking…" : "AI assistant"}</small>
          </div>
        </div>
        <button className="ghost icon" onClick={onClear} aria-label="Clear conversation" disabled={!messages.length}><Trash /></button>
      </header>
      <div className="msgs" ref={box} tabIndex={0}>
        {!messages.length && (
          <div className="aihello">
            <span className="av ai big" aria-hidden="true"><Sparkle /></span>
            <h2>Ask Gemini anything</h2>
            <p>Get answers without leaving Chattr. Attach images, PDFs, text or code files and ask about them.</p>
            <div className="sugg">
              {ideas.map(t => (
                <button className="chip" key={t} onClick={() => { setText(t); ta.current.focus() }}>{t}</button>
              ))}
            </div>
          </div>
        )}
        {items}
        {busy && (
          <div className="m them">
            <p className="typing" role="status" aria-label="Gemini is thinking"><i /><i /><i /></p>
          </div>
        )}
      </div>
      {(files.length > 0 || error) && (
        <div className="trayWrap">
          {error && <p className="error" role="alert">{error}</p>}
          {files.length > 0 && (
            <div className="tray">
              {files.map(f => (
                <div className="chip-file" key={f.id}>
                  {f.thumb ? <img src={f.thumb} alt="" /> : <span className="fi"><FileIcon /></span>}
                  <span className="nm">{f.name}</span>
                  <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles(l => l.filter(x => x.id !== f.id))}><XSmall /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <form className="composer ai" onSubmit={submit} data-ready={ready || undefined}>
        <input ref={pick} type="file" hidden multiple accept={ACCEPT} onChange={e => { add(e.target.files); e.target.value = "" }} />
        <button className="attach" type="button" aria-label="Attach files" title="Attach images, PDFs or text files" onClick={() => pick.current.click()}><Paperclip /></button>
        <label className="sr" htmlFor="aitext">Message Gemini</label>
        <textarea
          id="aitext"
          ref={ta}
          rows={1}
          maxLength={8000}
          placeholder="Ask Gemini"
          value={text}
          onChange={e => setText(e.target.value)}
          onPaste={e => {
            if (e.clipboardData.files.length) {
              e.preventDefault()
              add(e.clipboardData.files)
            }
          }}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e)
          }}
        />
        <button className="send" type="submit" aria-label="Send message" disabled={busy}><Send /></button>
      </form>
    </section>
  )
}
