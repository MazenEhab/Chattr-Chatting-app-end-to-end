import { useEffect, useState } from "react"

const lines = ["Warming things up…", "Fetching your chats…", "Tucking in your messages…", "Almost there…"]

export default function Splash({ leaving }) {
  const [i, setI] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setI(n => Math.min(n + 1, lines.length - 1)), 650)
    return () => clearInterval(t)
  }, [])

  return (
    <div className={`splash${leaving ? " leaving" : ""}`} role="status">
      <span className="sr">Loading Chattr</span>
      <div className="logo" aria-hidden="true">
        <i /><i /><i />
        <div className="mark"><img src="/logo.png" alt="" /></div>
      </div>
      <h1 className="word" aria-hidden="true">
        {[..."Chattr"].map((ch, k) => <span key={k} style={{ animationDelay: `${0.5 + k * 0.07}s` }}>{ch}</span>)}
      </h1>
      <p className="tagline" aria-hidden="true">Small talk, made cozy.</p>
      <div className="dots" aria-hidden="true"><i /><i /><i /></div>
      <p className="msg" aria-hidden="true">{lines[i]}</p>
      <div className="load" aria-hidden="true"><i /></div>
    </div>
  )
}
