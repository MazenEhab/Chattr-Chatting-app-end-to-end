import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Avatar from "./Avatar"
import Tick from "./Tick"
import { Back, MuteIcon, Send } from "./Icons"
import { dayKey, dayLabel, time } from "../lib/format"
import { isMuted, presence, presenceClass } from "../lib/chat"
import { displayName } from "../lib/profile"

const skeleton = n =>
  Array.from({ length: n }, (_, i) => (
    <div key={"s" + i} className={`m ${i % 2 ? "me" : "them"}`} aria-hidden="true">
      <p className="sk" style={{ width: [190, 130, 230, 100][i % 4] }} />
    </div>
  ))

function Composer({ name, onSend }) {
  const [text, setText] = useState("")
  const ta = useRef()

  useLayoutEffect(() => {
    ta.current.style.height = "auto"
    ta.current.style.height = Math.min(ta.current.scrollHeight, 120) + "px"
  }, [text])

  useEffect(() => {
    if (matchMedia("(min-width: 821px)").matches) ta.current.focus()
  }, [])

  function submit(e) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    setText("")
    onSend(t)
  }

  return (
    <form className="composer" onSubmit={submit}>
      <label className="sr" htmlFor="text">Message {name}</label>
      <textarea
        id="text"
        ref={ta}
        rows={1}
        maxLength={2000}
        placeholder="Write a message"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e)
        }}
      />
      <button className="send" type="submit" aria-label="Send message"><Send /></button>
    </form>
  )
}

export default function Thread({ c, onBack, onInfo, onSend, onRetry, onLoadOlder, onUnblock, children }) {
  const box = useRef()
  const snap = useRef(null)
  const stick = useRef(true)
  const msgs = c.messages
  const lastFromMe = msgs.at(-1)?.from === "me"

  useLayoutEffect(() => {
    const b = box.current
    if (snap.current) {
      if (c.loading) return
      b.scrollTop = b.scrollHeight - snap.current.h + snap.current.top
      snap.current = null
    } else if (stick.current || lastFromMe) {
      b.scrollTop = b.scrollHeight
    }
  }, [msgs.length, c.typing, c.loaded, c.loading])

  function scroll(e) {
    const b = e.currentTarget
    stick.current = b.scrollHeight - b.scrollTop - b.clientHeight < 80
    if (b.scrollTop < 60 && c.loaded && c.more && !c.loading) {
      snap.current = { h: b.scrollHeight, top: b.scrollTop }
      onLoadOlder()
    }
  }

  let prev = ""
  const items = []
  for (const m of msgs) {
    const k = dayKey(m.at)
    if (k !== prev) {
      items.push(<div className="day" key={"d" + k}>{dayLabel(m.at)}</div>)
      prev = k
    }
    items.push(
      <div className={`m ${m.from}${m.status === "sending" ? " sending" : ""}`} key={m.id}>
        <p>{m.text}</p>
        <span className="meta">
          <time>{time(m.at)}</time>
          {m.from === "me" && <Tick s={m.status} />}
          {m.status === "failed" && <button className="retry" onClick={() => onRetry(m)}>Tap to retry</button>}
        </span>
      </div>
    )
  }

  return (
    <section className="thread">
      <header className="bar">
        <button className="ghost back" onClick={onBack} aria-label="Back to chats"><Back /></button>
        <button className="who" id="who" onClick={onInfo} aria-label={`Contact info for ${displayName(c)}`}>
          <Avatar c={c} />
          <div className="title">
            <strong>{displayName(c)}</strong>
            {isMuted(c) && <span className="mi" title="Muted"><MuteIcon /></span>}
            <small className={presenceClass(c)}>{presence(c)}</small>
          </div>
        </button>
      </header>
      <div className="msgs" ref={box} onScroll={scroll} tabIndex={0}>
        {!c.loaded ? skeleton(5) : (
          <>
            {c.loading && skeleton(2)}
            {items}
            {c.typing && (
              <div className="m them">
                <p className="typing" role="status" aria-label={`${displayName(c)} is typing`}><i /><i /><i /></p>
              </div>
            )}
            {!msgs.length && !c.loading && <p className="empty">Say hello to {displayName(c)}.</p>}
          </>
        )}
      </div>
      {c.blocked ? (
        <div className="blocked">
          You blocked <strong>{displayName(c)}</strong>. <button className="linkbtn" onClick={onUnblock}>Unblock</button> to send messages.
        </div>
      ) : (
        <Composer name={displayName(c)} onSend={onSend} />
      )}
      {children}
    </section>
  )
}
