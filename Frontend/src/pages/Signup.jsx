import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import AuthShell from "../components/AuthShell"
import { Field, Form, PasswordField } from "../components/Form"
import PhotoPicker from "../components/PhotoPicker"
import { At, Mail, User } from "../components/Icons"
import { api } from "../lib/api"
import { validEmail } from "../lib/format"
import { useSession } from "../lib/session"

export default function Signup() {
  const nav = useNavigate()
  const s = useSession()
  const [photo, setPhoto] = useState("")

  async function submit(d) {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(d.username)) throw new Error("Usernames are 3 to 20 letters, numbers or underscores.")
    if (!validEmail(d.email)) throw new Error("Enter a valid email address.")
    if (d.password.length < 8) throw new Error("Your password needs at least 8 characters.")
    await api("/auth/signup", { username: d.username.toLowerCase(), nickname: d.nick.trim(), email: d.email, password: d.password, photo })
    s.update({ email: d.email, mode: "signup" })
    nav("/verify")
  }

  return (
    <AuthShell
      panel={["Your cozy corner for conversations.", "Private one-on-one chats with seen receipts and last seen."]}
      title="Create your account"
      sub="Choose a username and an optional nickname. We’ll email you a code to confirm it’s you."
      foot={<>Already have an account? <Link className="link" to="/login">Log in</Link></>}
    >
      <Form onSubmit={submit} label="Create account">
        <PhotoPicker className="pic flat" value={photo} label="+" onChange={setPhoto} />
        <Field id="nick" label="Nickname" icon={User} placeholder="Optional — defaults to your username" maxLength={30} autoComplete="nickname" />
        <p className="hint">What people see in chats. Leave it empty to use your username.</p>
        <Field id="username" label="Username" icon={At} autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={20} />
        <p className="hint">Letters, numbers and underscores. People use it to find you.</p>
        <Field id="email" label="Email" type="email" icon={Mail} autoComplete="email" />
        <PasswordField id="password" label="Password" autoComplete="new-password" />
        <p className="hint">Use at least 8 characters.</p>
      </Form>
    </AuthShell>
  )
}
