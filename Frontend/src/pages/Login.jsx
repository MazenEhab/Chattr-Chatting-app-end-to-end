import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import AuthShell from "../components/AuthShell"
import { Field, Form, PasswordField } from "../components/Form"
import { Mail } from "../components/Icons"
import { api, MOCK } from "../lib/api"
import { validEmail } from "../lib/format"
import { fetchCurrentUser } from "../lib/profile"
import { useSession } from "../lib/session"

export default function Login() {
  const nav = useNavigate()
  const s = useSession()
  const [notice] = useState(s.notice)

  useEffect(() => {
    if (s.notice) s.update({ notice: "" })
  }, [])

  async function submit(d) {
    if (!validEmail(d.email)) throw new Error("Enter a valid email address.")
    if (!d.password) throw new Error("Enter your password.")
    const r = await api("/auth/login", d)
    if (r.requiresVerification) {
      s.update({ email: d.email, mode: "signup" })
      return nav("/verify")
    }
    // Confirm that the cookie issued by login is accepted before entering Chat.
    const profile = MOCK ? { user: r.user } : await fetchCurrentUser()
    if (!profile?.user) throw new Error("Could not verify your session. Please log in again.")

    s.update({ user: profile.user, email: d.email })
    nav("/chat")
  }

  return (
    <AuthShell
      panel={["Small talk, made cozy.", "Pick up right where you left off. Your chats are waiting."]}
      title="Welcome back"
      sub="Log in to pick up your conversations."
      notice={notice}
      foot={<>New to Chattr? <Link className="link" to="/signup">Create an account</Link> · <Link className="link" to="/api-docs">API docs</Link></>}
    >
      <Form onSubmit={submit} label="Log in">
        <Field id="email" label="Email" type="email" icon={Mail} autoComplete="email" />
        <PasswordField id="password" label="Password" autoComplete="current-password" />
        <Link className="link end" to="/forgot">Forgot password?</Link>
      </Form>
    </AuthShell>
  )
}
