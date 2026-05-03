"use client"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { switchUserStore } from "@/store"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Fire immediately for current session
    supabase.auth.getSession().then(({ data }) => {
      switchUserStore(data.session?.user?.id ?? null)
    })

    // Fire on every auth state change (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      switchUserStore(session?.user?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <>{children}</>
}
