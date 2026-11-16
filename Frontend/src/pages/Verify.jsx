import { useEffect, useRef, useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import AuthShell from "../components/AuthShell"
import { api } from "../lib/api"
import { useSession } from "../lib/session"

export default function Verify() {
  const nav = useNavigate()
  const s = useSession()
  const [chars, setChars] = useState(Array(6).fill(""))
  const [err, setErr] = useState("")
  const [busy, setBusy] = useState(false)
  const [left, setLeft] = useState(30)
  const refs = useRef([])

  useEffect(() => {
    if (left <= 0) return
    const t = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(t)
  }, [left])

  if (!s.email) return <Navigate to="/login" replace />

  async function submit(code) {
    setErr("")
    setBusy(true)
    try {
      if (code.length < 6) throw new Error("Enter all 6 characters.")
      const r = await api("/otp/verify", { email: s.email, otp: code })
      if (s.mode === "reset") {
        s.update({ token: r.token })
        return nav("/reset")
      }
      s.update({ user: r.user })
      nav("/chat")
    } catch (ex) {
      setErr(ex.message)
      setChars(Array(6).fill(""))
      refs.current[0]?.focus()
    }
    setBusy(false)
  }

  function fill(start, text) {
    // Keep the code exactly as entered: case and punctuation are significant.
    // Ignore whitespace because OTP codes are entered without spaces.
    const entered = Array.from(text).filter(char => !/\s/.test(char)).slice(0, 6 - start)
    const next = [...chars]

    entered.forEach((char, index) => {
      next[start + index] = char
    })

    setChars(next)

    const nextIndex = start + entered.length
    refs.current[Math.min(nextIndex, 5)]?.focus()

    if (next.every(Boolean)) submit(next.join(""))
  }

  async function resend() {
    await api("/auth/resend", { email: s.email, mode: s.mode })
    setLeft(30)
  }

  return (
    <AuthShell
      panel={["One quick check.", "Enter the 6-character code exactly as it appears in your email."]}
      title="Check your email"
      sub={<>We sent a 6-character code to <strong>{s.email}</strong>. It expires in 10 minutes. Uppercase, lowercase, and special characters are accepted.</>}
      foot={<Link className="link" to="/login">Back to log in</Link>}
    >
      <form noValidate onSubmit={e => { e.preventDefault(); submit(chars.join("")) }}>
        <div className="code" role="group" aria-label="6-character code">
          {chars.map((ch, i) => (
            <input
              key={i}
              ref={el => (refs.current[i] = el)}
              value={ch}
              autoFocus={i === 0}
              autoComplete={i ? "off" : "one-time-code"}
              autoCapitalize="off"
              inputMode="text"
              maxLength={1}
              spellCheck={false}
              aria-label={`Character ${i + 1}`}
              onFocus={e => e.target.select()}
              onChange={e => {
                const v = e.target.value
                if (!v) {
                  setChars(c => c.map((x, j) => (j === i ? "" : x)))
                  return
                }
                fill(i, v.length > 1 ? v : v.slice(-1))
              }}
              onKeyDown={e => {
                if (e.key === "Backspace" && !ch && i) {
                  setChars(c => c.map((x, j) => (j === i - 1 ? "" : x)))
                  refs.current[i - 1].focus()
                }
                if (e.key === "ArrowLeft" && i) refs.current[i - 1].focus()
                if (e.key === "ArrowRight" && i < 5) refs.current[i + 1].focus()
              }}
              onPaste={e => {
                e.preventDefault()
                fill(i, e.clipboardData.getData("text"))
              }}
            />
          ))}
        </div>
        <p className="error" role="alert">{err}</p>
        <button className="btn" type="submit" disabled={busy}>{busy ? "Please wait…" : "Verify"}</button>
      </form>
      <button className="btn alt" id="resend" type="button" disabled={left > 0} onClick={resend}>
        {left > 0 ? `Resend code in ${left}s` : "Resend code"}
      </button>
    </AuthShell>
  )
}
