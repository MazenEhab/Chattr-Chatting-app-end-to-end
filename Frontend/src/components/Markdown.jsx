const link = (url, label, key) => (
  <a key={key} href={url} target="_blank" rel="noopener noreferrer">{label}</a>
)

function inline(text) {
  const out = []
  const re = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\s][^*\n]*\*)|(\[[^\]\n]+\]\(https?:\/\/[^\s)]+\))|(https?:\/\/[^\s<]+)/g
  let last = 0
  let m
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    let t = m[0]
    if (m[1]) out.push(<code key={i++}>{t.slice(1, -1)}</code>)
    else if (m[2]) out.push(<strong key={i++}>{t.slice(2, -2)}</strong>)
    else if (m[3]) out.push(<em key={i++}>{t.slice(1, -1)}</em>)
    else if (m[4]) {
      const [, label, url] = t.match(/^\[(.+?)\]\((.+)\)$/)
      out.push(link(url, label, i++))
    } else {
      const trail = t.match(/[.,;:!?)]+$/)?.[0] || ""
      if (trail) {
        t = t.slice(0, -trail.length)
        re.lastIndex -= trail.length
      }
      out.push(link(t, t, i++))
    }
    last = m.index + t.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

const cells = line => line.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim())
const isRule = line => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line)
const isBlock = line => /^```|^#{1,4}\s|^\s*([-*•])\s+|^\s*\d+[.)]\s+|^>\s?|^\s*\|/.test(line)

export default function Markdown({ text }) {
  const lines = String(text).replace(/\r/g, "").split("\n")
  const out = []
  let i = 0
  let k = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith("```")) {
      const code = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++])
      i++
      out.push(<pre key={k++}><code>{code.join("\n")}</code></pre>)
      continue
    }

    if (!line.trim()) {
      i++
      continue
    }

    const h = line.match(/^#{1,4}\s+(.*)/)
    if (h) {
      out.push(<div className="md-h" key={k++}>{inline(h[1])}</div>)
      i++
      continue
    }

    if (/^\s*\|/.test(line) && i + 1 < lines.length && isRule(lines[i + 1])) {
      const head = cells(line)
      const rows = []
      i += 2
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(cells(lines[i++]))
      out.push(
        <div className="tbl" key={k++}>
          <table>
            <thead><tr>{head.map((c, j) => <th key={j}>{inline(c)}</th>)}</tr></thead>
            <tbody>{rows.map((r, a) => <tr key={a}>{r.map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )
      continue
    }

    if (/^\s*([-*•])\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*([-*•])\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*•])\s+/, ""))
      out.push(<ul key={k++}>{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ul>)
      continue
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ""))
      out.push(<ol key={k++}>{items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ol>)
      continue
    }

    if (/^>\s?/.test(line)) {
      const quote = []
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ""))
      out.push(<blockquote key={k++}>{inline(quote.join(" "))}</blockquote>)
      continue
    }

    const para = []
    while (i < lines.length && lines[i].trim() && !(para.length && isBlock(lines[i]))) para.push(lines[i++])
    out.push(
      <div className="md-p" key={k++}>
        {para.map((t, j) => <span key={j}>{j > 0 && <br />}{inline(t)}</span>)}
      </div>
    )
  }

  return <div className="md">{out}</div>
}
