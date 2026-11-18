import Tick from "./Tick"

export default function AuthShell({ panel, title, sub, notice, foot, children }) {
  return (
    <main className="auth">
      <aside className="panel">
        <div>
          <div className="brandrow">
            <span className="tile"><img src="/logo.png" alt="" /></span>
            <span className="brand">Chattr</span>
          </div>
          <h2>{panel[0]}</h2>
          <p>{panel[1]}</p>
        </div>
        <div className="mock" aria-hidden="true">
          <div className="mh">
            <span className="av t0">N<i className="dot" /></span>
            <span><strong>Nour</strong><small>Online</small></span>
          </div>
          <div className="mb">
            <div className="fb">Are you up? 👀</div>
            <div className="fb">Coffee at 3?</div>
            <div className="fb me">Always ☕ <Tick s="seen" /></div>
            <div className="fb typing"><i /><i /><i /></div>
          </div>
          <div className="mc"><span>Write a message</span><b /></div>
        </div>
      </aside>
      <div className="formside">
        <div className="stage">
          <section className="card">
            <h1>{title}</h1>
            <p className="sub">{sub}</p>
            {notice && <p className="notice" role="status">{notice}</p>}
            {children}
          </section>
          <p className="foot">{foot}</p>
        </div>
      </div>
    </main>
  )
}
