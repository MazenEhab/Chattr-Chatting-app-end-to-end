import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import AuthShell from "../components/AuthShell"
import { Form, PasswordField } from "../components/Form"
import { api } from "../lib/api"
import { useSession } from "../lib/session"

const set = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*"

export default function Reset() {
  const nav = useNavigate()
  const s = useSession()
  const [gen, setGen] = useState("")

  if (!s.email || !s.token) return <Navigate to="/login" replace />

  async function submit(d) {
    if (d.password.length < 8) throw new Error("Your password needs at least 8 characters.")
    if (d.password !== d.confirm) throw new Error("The two passwords don’t match.")
    await api("/auth/reset", { email: s.email, token: s.token, password: d.password })
    s.update({ token: "", mode: "", notice: "Password updated. Log in with your new password." })
    nav("/login")
  }

  return (
    <AuthShell
      panel={["A fresh start.", "Pick a new password or let us generate a strong one."]}
      title="Set a new password"
      sub="Choose one you haven’t used before, or let us generate a strong one."
      foot={<Link className="link" to="/login">Back to log in</Link>}
    >
      <Form onSubmit={submit} label="Save password">
        <PasswordField key={"p" + gen} id="password" label="New password" autoComplete="new-password" defaultValue={gen} reveal={!!gen} />
        <PasswordField key={"c" + gen} id="confirm" label="Confirm password" autoComplete="new-password" defaultValue={gen} reveal={!!gen} />
        <button className="btn alt" type="button" onClick={() => setGen([...crypto.getRandomValues(new Uint32Array(16))].map(n => set[n % set.length]).join(""))}>
          Generate a strong password
        </button>
        {gen && <p className="hint">Save this password in your password manager before you continue.</p>}
      </Form>
    </AuthShell>
  )
}
