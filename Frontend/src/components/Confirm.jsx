const copy = (kind, n) =>
  ({
    delete: ["Delete chat?", `This removes your conversation with ${n} from your list. Messages they sent stay with them.`, "Delete chat"],
    clear: ["Clear messages?", "All messages in this chat will be removed for you. The chat stays in your list.", "Clear messages"],
    block: [`Block ${n}?`, "They won’t be able to message you, and you won’t see their online status or last seen.", "Block"]
  })[kind]

export default function Confirm({ kind, name, onYes, onNo }) {
  const [title, body, label] = copy(kind, name)
  return (
    <div className="scrim" onClick={onNo}>
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="mt" aria-describedby="mb" onClick={e => e.stopPropagation()}>
        <h2 id="mt">{title}</h2>
        <p id="mb">{body}</p>
        <div className="row2">
          <button className="act" onClick={onNo} autoFocus>Cancel</button>
          <button className="act danger" onClick={onYes}>{label}</button>
        </div>
      </div>
    </div>
  )
}
