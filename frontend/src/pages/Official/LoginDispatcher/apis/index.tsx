import { type LoginDispatcher } from "../interfaces"

export async function loginDispatcherApi(payload: LoginDispatcher) {
  const res = await fetch("http://localhost:5000/dispatcher/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: payload.ID, // backend expects 'id'
      password: payload.password,
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || "Login failed")
  }
  return data
}