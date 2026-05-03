"use client"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { switchUserStore } from "@/store"
import { syncFromCloud, syncToCloud } from "@/lib/sync"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const userId = data.session?.user?.id ?? null
      switchUserStore(userId)
      if (userId) syncFromCloud(userId).catch(console.error)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const userId = session?.user?.id ?? null
      if (event === "SIGNED_OUT") {
        const prev = await supabase.auth.getUser()
        if (prev.data.user?.id) await syncToCloud(prev.data.user.id).catch(console.error)
      }
      switchUserStore(userId)
      if (event === "SIGNED_IN" && userId) {
        await syncFromCloud(userId).catch(console.error)
      }
    })
    return () => subscription.unsubscribe()
  }, [])
  return <>{children}</>
}
