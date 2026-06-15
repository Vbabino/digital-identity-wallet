import { useEffect } from "react"
import { useNavigate } from "react-router"
import { api } from "~/services/api"

export default function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await api.get("/api/auth/user/")
        // If successful, user is logged in
        navigate("/dashboard", { replace: true })
      } catch {
        // If it fails, user is not logged in
        navigate("/login", { replace: true })
      }
    }

    checkAuthStatus()
  }, [navigate])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-950 font-sans text-zinc-100">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated logo/spinner */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 shadow-xl shadow-blue-500/10">
          <svg
            className="h-8 w-8 animate-pulse text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <p className="animate-pulse text-sm font-medium text-zinc-400">
          Establishing secure connection...
        </p>
      </div>
    </div>
  )
}
