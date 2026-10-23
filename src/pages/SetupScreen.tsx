import { Sigma } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SetupScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sigma className="size-5 text-primary" /> Connect Supabase
          </CardTitle>
          <CardDescription>MathNotes needs your Supabase project keys before it can start.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Create a project at <span className="font-medium">supabase.com</span> and run{" "}
              <code className="rounded bg-muted px-1">supabase/migrations/0001_init.sql</code> in the SQL editor.
            </li>
            <li>
              Copy <code className="rounded bg-muted px-1">.env.example</code> to{" "}
              <code className="rounded bg-muted px-1">.env</code> and fill in{" "}
              <code className="rounded bg-muted px-1">VITE_SUPABASE_URL</code> and{" "}
              <code className="rounded bg-muted px-1">VITE_SUPABASE_ANON_KEY</code> (Project Settings, API).
            </li>
            <li>Restart the dev server.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
