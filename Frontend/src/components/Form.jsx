import { useState } from "react"

export function Form({ onSubmit, label, children }) {
  const [err, setErr] = useState("")
  const [busy, setBusy] = useState(false)

  async function handle(e) {
    e.preventDefault()
    setErr("")
    setBusy(true)
    try {
      await onSubmit(Object.fromEntries(new FormData(e.target)))
    } catch (ex) {
      setErr(ex.message)
    }
    setBusy(false)
  }

  return (
    <form noValidate onSubmit={handle}>
      {children}
      <p className="error" role="alert">{err}</p>
      <button className="btn" type="submit" disabled={busy}>{busy ? "Please wait…" : label}</button>
    </form>
  )
}

export const Field = ({ id, label, type = "text", ...rest }) => (
  <label className="field">
    <span>{label}</span>
    <input id={id} name={id} type={type} {...rest} />
  </label>
)

export function PasswordField({ id, label, reveal, ...rest }) {
  const [show, setShow] = useState(!!reveal)
  return (
    <label className="field">
      <span>{label}</span>
      <div className="pw">
        <input id={id} name={id} type={show ? "text" : "password"} {...rest} />
        <button type="button" className="ghost" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
      </div>
    </label>
  )
}
