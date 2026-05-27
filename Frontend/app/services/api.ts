import axios from "axios"

// baseURL is intentionally empty so all requests go to the current page
// origin (localhost:5173 in dev).  Vite's server.proxy then forwards /api,
// /o, and /accounts to localhost:8000 transparently.  This keeps every
// request same-origin from the browser's perspective, which is required for
// SameSite=Lax cookies to be sent on XHR/fetch requests.
const api = axios.create({
  baseURL: "",
  withCredentials: true, // send cookies with every request
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
})


export default api
export { api }
