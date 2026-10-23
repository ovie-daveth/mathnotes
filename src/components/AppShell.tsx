import { useEffect, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { LogOut, Moon, Sigma, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem("theme")
      if (stored) return stored === "dark"
    } catch {
      /* ignore */
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    try {
      localStorage.setItem("theme", dark ? "dark" : "light")
    } catch {
      /* ignore */
    }
  }, [dark])

  return [dark, () => setDark((d) => !d)] as const
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()
  const [dark, toggleDark] = useDarkMode()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sigma className="size-5" />
            </span>
            MathNotes
          </Link>
          <div className="ml-auto flex items-center gap-1">
            {user && (
              <span className="mr-2 hidden max-w-48 truncate text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={toggleDark} title="Toggle theme" aria-label="Toggle theme">
              {dark ? <Sun /> : <Moon />}
            </Button>
            {user && (
              <Button variant="ghost" size="sm" onClick={() => void signOut()}>
                <LogOut /> Sign out
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  )
}

/** Applies the saved theme on screens that render outside the shell. */
export function ThemeBoot() {
  useDarkMode()
  return null
}
