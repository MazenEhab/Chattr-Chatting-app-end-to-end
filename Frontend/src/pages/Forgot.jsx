import { Link, useNavigate } from "react-router-dom"
import AuthShell from "../components/AuthShell"
import { Field, Form } from "../components/Form"
import { Mail } from "../components/Icons"
import { api } from "../lib/api"
import { validEmail } from "../lib/format"
import { useSession } from "../lib/session"

export default function Forgot() {
  const nav = useNavigate()
  const s = useSession()

  async function submit(d) {
    if (!validEmail(d.email)) throw new Error("Enter a valid email address.")
    await api("/auth/forget", { email: d.email })
    s.update({ email: d.email, mode: "reset" })
    nav("/verify")
  }

  return (
    <AuthShell
      panel={["Locked out? It happens.", "We’ll send a code to get you back in."]}
      title="Forgot your password?"
      sub="Enter your email and we’ll send a code to reset it."
      foot={<Link className="link" to="/login">Back to log in</Link>}
    >
      <Form onSubmit={submit} label="Send code">
        <Field id="email" label="Email" type="email" icon={Mail} autoComplete="email" />
      </Form>
    </AuthShell>
  )
}
