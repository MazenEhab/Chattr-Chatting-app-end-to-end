import { createContext, useCallback, useContext, useState } from "react"

const Ctx = createContext(null)

const read = () => {
  try {
    return JSON.parse(sessionStorage.getItem("chattr")) || {}
  } catch {
    return {}
  }
}

export function SessionProvider({ children }) {
  const [state, setState] = useState(() => ({ user: null, email: "", mode: "", token: "", notice: "", ...read() }))
  const update = useCallback(patch => {
    setState(prev => {
      const next = { ...prev, ...patch }
      sessionStorage.setItem("chattr", JSON.stringify(next))
      return next
    })
  }, [])
  return <Ctx.Provider value={{ ...state, update }}>{children}</Ctx.Provider>
}

export const useSession = () => useContext(Ctx)
