import Avatar from "./Avatar"
import { Close } from "./Icons"
import { isMuted, muteLabel, presence } from "../lib/chat"
import { displayName } from "../lib/profile"

export default function ContactInfo({ c, onClose, onMute, onAsk, onBlock }) {
  const muted = isMuted(c)
  return (
    <aside className="info" role="dialog" aria-label="Contact info">
      <header className="ih">
        <button className="ghost" onClick={onClose} aria-label="Close contact info" autoFocus><Close /></button>
        <strong>Contact info</strong>
      </header>
      <div className="ip">
        <Avatar c={{ ...c, online: false }} big />
        <h2>{displayName(c)}</h2>
        <p className="handle">@{c.username}</p>
        {!c.blocked && <p className="seen">{presence(c)}</p>}
      </div>
      <section className="is">
        <h3>Mute notifications</h3>
        <p className="hint">{muteLabel(c)}</p>
        <div className="chips">
          {[["8h", "8 hours"], ["1w", "1 week"], ["always", "Always"]].map(([k, l]) => (
            <button key={k} className="chip" aria-pressed={muted && c.muteKey === k} onClick={() => onMute(k)}>{l}</button>
          ))}
          {muted && <button className="chip" onClick={() => onMute("off")}>Unmute</button>}
        </div>
      </section>
      <section className="is">
        <button className="act" onClick={() => onAsk("clear")}>Clear messages</button>
        {c.blocked
          ? <button className="act" onClick={() => onBlock(false)}>Unblock {displayName(c)}</button>
          : <button className="act danger" onClick={() => onAsk("block")}>Block {displayName(c)}</button>}
        <button className="act danger" onClick={() => onAsk("delete")}>Delete chat</button>
      </section>
    </aside>
  )
}
