import { useRef, useState } from "react"
import Avatar from "./Avatar"

export default function PhotoPicker({ className, value, label, onChange }) {
  const input = useRef()
  const [err, setErr] = useState("")

  function pick(e) {
    const f = e.target.files[0]
    if (!f) return
    if (!f.type.startsWith("image/")) return setErr("Choose an image file.")
    const r = new FileReader()
    r.onload = () => {
      const img = new Image()
      img.onload = () => {
        const n = Math.min(img.width, img.height)
        const cv = document.createElement("canvas")
        cv.width = cv.height = 256
        cv.getContext("2d").drawImage(img, (img.width - n) / 2, (img.height - n) / 2, n, n, 0, 0, 256, 256)
        setErr("")
        onChange(cv.toDataURL("image/jpeg", 0.85))
      }
      img.onerror = () => setErr("That image couldn’t be read.")
      img.src = r.result
    }
    r.readAsDataURL(f)
  }

  return (
    <div className={className}>
      <Avatar c={{ id: 0, nickname: label || "?", photo: value }} big />
      <div>
        <button type="button" className="btn alt" onClick={() => input.current.click()}>{value ? "Change photo" : "Add photo"}</button>
        {value && <button type="button" className="ghost" onClick={() => onChange("")}>Remove</button>}
        <input ref={input} type="file" accept="image/*" hidden onChange={pick} />
        {err && <p className="error" role="alert">{err}</p>}
      </div>
    </div>
  )
}
