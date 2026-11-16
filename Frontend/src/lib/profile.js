import { api } from "./api"

let currentUserRequest

// Share the startup and Settings profile check when they overlap.
export const fetchCurrentUser = () => {
  if (!currentUserRequest) {
    currentUserRequest = api("/auth/me").finally(() => {
      currentUserRequest = undefined
    })
  }

  return currentUserRequest
}

// Display a person's nickname when set; otherwise fall back to their username.
export const displayName = person =>
  person?.nickname || person?.nick || person?.username || "User"

// Normalize profile/chat records from the API without requiring a `name` field.
export const normalizePerson = person => ({
  ...person,
  nickname: person?.nickname || person?.nick || "",
  username: person?.username || "",
})
