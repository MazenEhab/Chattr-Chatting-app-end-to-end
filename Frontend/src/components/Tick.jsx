import { Alert, Check, Checks, Clock } from "./Icons"

const labels = { sending: "Sending", sent: "Sent", delivered: "Delivered", seen: "Seen", failed: "Not sent" }
const icons = { sent: Check, sending: Clock, failed: Alert }

export default function Tick({ s }) {
  if (!labels[s]) return null
  const Icon = icons[s] || Checks
  return (
    <span className={`tick ${s}`} role="img" aria-label={labels[s]} title={labels[s]}>
      <Icon />
    </span>
  )
}
