import { displayName } from "../lib/profile"

export default function Avatar({ c = {}, big = false }) {
  const label = displayName(c)
  const id = c.id ?? c.userId ?? 0

  return (
    <span className={`av t${Number(id) % 4}${big ? " big" : ""}`} aria-hidden="true">
      {c.photo ? <img src={c.photo} alt="" /> : label.charAt(0).toUpperCase()}
      {c.online && !c.blocked && <i className="dot" />}
    </span>
  )
}
