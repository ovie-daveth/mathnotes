import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { Toaster } from "sonner"
import { AppShell, ThemeBoot } from "@/components/AppShell"
import { AuthProvider, useAuth } from "@/hooks/useAuth"
import { isSupabaseConfigured } from "@/lib/supabase"
import { AuthPage } from "@/pages/AuthPage"
import { NotePage } from "@/pages/NotePage"
import { NotesPage } from "@/pages/NotesPage"
import { SetupScreen } from "@/pages/SetupScreen"

function Gate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <ThemeBoot />
        <AuthPage />
      </>
    )
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<NotesPage />} />
        <Route path="/note/:id" element={<NotePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupScreen />

  return (
    <BrowserRouter>
      <AuthProvider>
        <Gate />
        <Toaster richColors position="bottom-right" />
      </AuthProvider>
    </BrowserRouter>
  )
}
