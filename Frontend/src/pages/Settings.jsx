import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Field, Form } from "../components/Form"
import PhotoPicker from "../components/PhotoPicker"
import { User } from "../components/Icons"
import { api } from "../lib/api"
import { useSession } from "../lib/session"
import { displayName, fetchCurrentUser, normalizePerson } from "../lib/profile"

export default function Settings() {
  const nav = useNavigate()
  const s = useSession()
  const u = s.user
  const [photo, setPhoto] = useState(u.photo || "")
  const [nick, setNick] = useState(u.nickname || u.nick || "")
  const [showLastSeen, setShowLastSeen] = useState(Boolean(u.lastSeen))
  const [sendReceipts, setSendReceipts] = useState(Boolean(u.receipts))

  useEffect(() => {
    let active = true

    fetchCurrentUser().then(
      response => {
        if (!active || !response?.user) return

        const user = normalizePerson(response.user)
        s.update({ user })
        setNick(user.nickname)
        setPhoto(user.photo || "")
        setShowLastSeen(Boolean(user.lastSeen))
        setSendReceipts(Boolean(user.receipts))
      },
      error => {
        if (error.status === 401) s.update({ user: null, token: "" })
        else console.error("Could not refresh the current profile:", error)
      }
    )

    return () => {
      active = false
    }
  }, [s.update])

async function submit(d) {
  if (!d.nick.trim()) throw new Error("Pick a nickname.")

  const next = {
    nickname: d.nick.trim(),
    photo,
    lastSeen: "lastSeen" in d,
    receipts: "receipts" in d
  }

  const response = await api("/auth/me", next, "PATCH")

  s.update({
    user: {
      ...u,
      ...response.user,
      nickname: response.user.nickname || response.user.nick,
      nick: response.user.nickname || response.user.nick
    }
  })

  nav("/chat")
}

  async function logout() {
    await api("/auth/logout", {}).catch(() => {})
    s.update({ user: null })
    nav("/login")
  }

  return (
    <main className="formside solo">
      <div className="stage">
        <section className="card wide">
          <div className="cover"><Link className="pill" to="/chat">← Back to chats</Link></div>
          <Form onSubmit={submit} label="Save changes">
            <PhotoPicker className="pic" value={photo} label={nick || displayName(u)} onChange={setPhoto} />
            <h1>Your profile</h1>
            <p className="sub">Choose how you appear to the people you chat with.</p>
            <Field id="nick" label="Nickname" icon={User} maxLength={20} value={nick} onChange={e => setNick(e.target.value)} />
            <p className="hint">Your username is @{u.username}. People use it to find you.</p>
            <label className="switch"><span>Show my last seen</span><input type="checkbox" name="lastSeen" checked={showLastSeen} onChange={e => setShowLastSeen(e.target.checked)} /></label>
            <label className="switch"><span>Send read receipts</span><input type="checkbox" name="receipts" checked={sendReceipts} onChange={e => setSendReceipts(e.target.checked)} /></label>
          </Form>
          <button className="btn alt" onClick={logout}>Log out</button>
        </section>
      </div>
    </main>
  )
}
