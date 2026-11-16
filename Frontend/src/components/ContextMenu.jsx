import { useEffect, useLayoutEffect, useRef, useState } from "react"

export default function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef()
  const [pos, setPos] = useState({ left: x, top: y })

  useLayoutEffect(() => {
    const r = ref.current.getBoundingClientRect()
    setPos({ left: Math.max(8, Math.min(x, innerWidth - r.width - 8)), top: Math.max(8, Math.min(y, innerHeight - r.height - 8)) })
    ref.current.querySelector("button").focus()
  }, [x, y])

  useEffect(() => {
    const away = e => {
      if (!ref.current.contains(e.target)) onClose()
    }
    window.addEventListener("pointerdown", away)
    window.addEventListener("resize", onClose)
    window.addEventListener("blur", onClose)
    document.addEventListener("scroll", onClose, true)
    return () => {
      window.removeEventListener("pointerdown", away)
      window.removeEventListener("resize", onClose)
      window.removeEventListener("blur", onClose)
      document.removeEventListener("scroll", onClose, true)
    }
  }, [onClose])

  function key(e) {
    const b = [...ref.current.querySelectorAll("button")]
    const i = b.indexOf(document.activeElement)
    if (e.key === "ArrowDown") {
      e.preventDefault()
      b[(i + 1) % b.length].focus()
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      b[(i - 1 + b.length) % b.length].focus()
    }
    if (e.key === "Tab") onClose()
  }

  return (
    <div ref={ref} className="menu" role="menu" style={pos} onKeyDown={key}>
      {items.map((it, i) =>
        it.sep ? (
          <hr key={i} />
        ) : (
          <button key={i} role="menuitem" className={it.danger ? "danger" : ""} onClick={() => { onClose(); it.onClick() }}>
            {it.label}
          </button>
        )
      )}
    </div>
  )
}
