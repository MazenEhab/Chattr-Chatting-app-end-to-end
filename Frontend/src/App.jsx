import { useEffect, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { SessionProvider, useSession } from "./lib/session"
import { fetchCurrentUser } from "./lib/profile"
import { wait } from "./lib/format"
import Splash from "./components/Splash"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Forgot from "./pages/Forgot"
import Verify from "./pages/Verify"
import Reset from "./pages/Reset"
import Settings from "./pages/Settings"
import Chat from "./pages/Chat"
import ApiDocs from "./pages/ApiDocs"

const MIN_SPLASH = 2400

const Private = ({ children }) => (useSession().user ? children : <Navigate to="/login" replace />)
const Public = ({ children }) => (useSession().user ? <Navigate to="/chat" replace /> : children)

function Boot({ children }) {
  const { update } = useSession()
  const [phase, setPhase] = useState("loading")

  useEffect(() => {
    let alive = true
    let splashTimer

    const boot = async () => {
      const [sessionResult] = await Promise.all([
        fetchCurrentUser().then(
          response => ({ response }),
          error => ({ error })
        ),
        wait(MIN_SPLASH)
      ])

      if (!alive) return

      if (sessionResult.error) {
        const { error } = sessionResult

        if (error.status === 401) {
          // The server rejected the cookie. Remove any previously cached user.
          update({ user: null, token: "" })
        } else {
          // A server/network failure is not proof that the session is invalid.
          console.error("Could not verify the current session:", error)
        }
      } else {
        const response = sessionResult.response
        // A successful /auth/me response is authoritative, including no user.
        update({ user: response?.user || null })
      }

      setPhase("leaving")
      splashTimer = setTimeout(() => {
        if (alive) setPhase("done")
      }, 700)
    }

    boot()

    return () => {
      alive = false
      if (splashTimer) clearTimeout(splashTimer)
    }
  }, [update])

  return (
    <>
      {phase !== "loading" && children}
      {phase !== "done" && <Splash leaving={phase === "leaving"} />}
    </>
  )
}

export default function App() {
  return (
    <SessionProvider>
      <Boot>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Public><Login /></Public>} />
            <Route path="/signup" element={<Public><Signup /></Public>} />
            <Route path="/forgot" element={<Public><Forgot /></Public>} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/chat" element={<Private><Chat /></Private>} />
            <Route path="/settings" element={<Private><Settings /></Private>} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </Boot>
    </SessionProvider>
  )
}
