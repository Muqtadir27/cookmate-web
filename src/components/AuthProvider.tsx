"use client"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { switchUserStore } from "@/store"
import { syncFromCloud } from "@/lib/sync"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const userId = data.session?.user?.id ?? null
      switchUserStore(userId)
      if (userId) {
        await new Promise(r => setTimeout(r, 100))
        syncFromCloud(userId).catch(console.error)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const userId = session?.user?.id ?? null
      switchUserStore(userId)
      if (event === "SIGNED_IN" && userId) {
        await new Promise(r => setTimeout(r, 100))
        await syncFromCloud(userId).catch(console.error)
      }
    })
    return () => subscription.unsubscribe()
  }, [])
  return <>{children}</>
}
