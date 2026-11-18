import { Link } from "react-router-dom"

const pages = [
  ["App start (splash screen)", "any", [
    ["GET", "/auth/me", "", "200 { user } or 401", "Called while the splash plays. Returns the logged-in profile if the session cookie is valid."]]],
  ["Log in", "/login", [
    ["POST", "/auth/login", "{ email, password }", "{ user } or { needsVerification: true }", "401 { message } for wrong credentials. Start the session cookie."]]],
  ["Sign up", "/signup", [
    ["POST", "/auth/signup", "{ username, nickname, email, password, photo }", "201 {}", "photo is a 256px JPEG data URL or empty. nickname is optional; when empty, use username. Username: 3 to 20 of a-z 0-9 _, unique and lowercase. 409 { message } if the username or email is taken. Email the 6-character code (verify-email template)."]]],
  ["Verify code", "/verify", [
    ["POST", "/auth/verify", "{ email, code, mode }", "mode signup: { user } and start the session\nmode reset: { token }", "mode is \"signup\" or \"reset\". The code is 6 characters, A-Z and 0-9, valid 10 minutes. 400 { message } if wrong."],
    ["POST", "/auth/resend", "{ email, mode }", "200 {}", "Rate limit it. The frontend waits 30 seconds between resends. Send the welcome email after a successful signup verify."]]],
  ["Forgot password", "/forgot", [
    ["POST", "/auth/forgot", "{ email }", "200 {}", "Always return 200 so nobody can probe which emails exist. Email the reset code."]]],
  ["New password", "/reset", [
    ["POST", "/auth/reset", "{ email, token, password }", "200 {}", "token comes from /auth/verify with mode reset. Send the password-changed email."]]],
  ["Settings", "/settings", [
    ["POST", "/profile", "{ nickname, photo, lastSeen, receipts }", "200 { user }", "lastSeen false hides your last seen from others. receipts false stops sending seen ticks."],
    ["POST", "/auth/logout", "{}", "200 {}", "Clear the session cookie."]]],
  ["Chat list and new chats", "/chat", [
    ["GET", "/chats", "", "{ chats: Chat[] }", "Each chat carries only its last message in messages. Include unread, muted, blocked and pinned."],
    ["GET", "/users?q=", "", "{ users: User[] }", "Search by username, up to 5 results. Leave out people the user already chats with."],
    ["POST", "/chats", "{ username }", "Chat", "Starts a chat. 404 { message } if nobody has that username."]]],
  ["Opening a chat", "/chat", [
    ["GET", "/chats/:id/messages?limit=20&before=<ms>", "", "{ messages: Message[], more: boolean }", "Oldest first. before is the at of the oldest message already on screen; leave it empty for the latest page."],
    ["POST", "/chats/seen", "{ chatId }", "200 {}", "Marks their messages as read so they see the seen ticks."]]],
  ["Sending a message", "/chat", [
    ["POST", "/messages", "{ chatId, text }", "{ id, at, status: \"sent\" }", "The frontend shows the message instantly with a clock and swaps it for the tick when this returns. Return 4xx if the receiver blocked the sender."]]],
  ["Chat menu and contact info", "/chat", [
    ["POST", "/chats/mute", "{ chatId, muted }", "200 {}", "muted: 0 for off, -1 for always, or the timestamp in ms when the mute ends."],
    ["POST", "/chats/block", "{ chatId, blocked }", "200 {}", "A blocked user can’t message you or see your last seen."],
    ["POST", "/chats/pin", "{ chatId, pinned }", "200 {}", "Pinned chats sort to the top."],
    ["POST", "/chats/unread", "{ chatId, unread }", "200 {}", "Mark as unread or read."],
    ["POST", "/chats/clear", "{ chatId }", "200 {}", "Deletes the messages for this user only."],
    ["DELETE", "/chats/:id", "", "200 {}", "Removes the chat for this user only."]]],
  ["Gemini AI chat", "/chat", [
    ["POST", "/ai/chat", "{ messages: [{ role: \"user\" | \"model\", text, attachments?: [{ name, mime, data?, content? }] }] }", "{ text }", "Calls Gemini with the GEMINI_API_KEY that lives only on the server. messages is the recent conversation, oldest first; only the last message carries attachments. data is base64 (images and PDFs), content is plain text (text and code files). text is Markdown. Require the session, rate limit it, and return 4xx or 5xx with { message } on failure."]]],
  ["Real time (Socket.IO, not wired yet)", "/chat", [
    ["EVENT", "message:new", "", "{ chatId, message }", "An incoming message."],
    ["EVENT", "message:status", "", "{ chatId, id, status }", "delivered or seen for a message you sent."],
    ["EVENT", "typing", "", "{ chatId, typing }", "Shows the typing dots."],
    ["EVENT", "presence", "", "{ userId, online, lastSeen }", "The online dot and last seen."]]]
]

const shapes = [
  ["User", "{ id, username, nickname, photo, lastSeen: boolean, receipts: boolean }\nphoto is an image URL or data URL. The UI shows nickname, or username when nickname is empty."],
  ["Chat", "{ id, username, nickname, photo, online: boolean, lastSeen: ms, unread: number,\n  muted: 0 | -1 | ms, blocked: boolean, pinned: boolean, messages: Message[] }\nnickname is the other person’s nickname; fall back to username when it is empty."],
  ["Message", "{ id, from: \"me\" | \"them\", text, at: ms, status?: \"sent\" | \"delivered\" | \"seen\" }\nstatus only exists on messages you sent."]
]

export default function ApiDocs() {
  return (
    <div className="docs">
      <header>
        <div>
          <h1>Chattr API</h1>
          <p>What the frontend needs from your backend, page by page. Every route lives under <code>/api</code>, sends and returns JSON, and relies on a session cookie. Return a non-2xx status with <code>{"{ message }"}</code> for errors; the message is shown to the user as written.</p>
          <Link className="pill" to="/login">← Back to the app</Link>
        </div>
      </header>
      <main>
        {pages.map(([name, route, eps]) => (
          <section key={name}>
            <h2>{name}</h2>
            <p className="route">Route: {route}</p>
            {eps.map(([verb, path, req, res, note]) => (
              <article className="ep" key={verb + path}>
                <div className="ep-h"><b className={`verb ${verb.toLowerCase()}`}>{verb}</b><code>{path}</code></div>
                <p>{note}</p>
                {req && <><h4>Request</h4><pre>{req}</pre></>}
                <h4>Response</h4>
                <pre>{res}</pre>
              </article>
            ))}
          </section>
        ))}
        <section>
          <h2>Data shapes</h2>
          {shapes.map(([name, body]) => (
            <article className="ep" key={name}>
              <h4>{name}</h4>
              <pre>{body}</pre>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
