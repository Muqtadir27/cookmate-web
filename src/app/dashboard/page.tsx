'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useStore } from "@/store"
import Nav from "@/components/Nav"
import { DashboardSkeleton } from "@/components/Skeleton"

export default function Dashboard() {
  const { pantry, recipes, preferences } = useStore()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/auth/login")
      else setUser(data.user)
    })
  }, [])

  if (!user) return <DashboardSkeleton />

  const firstName = user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "Chef"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const lowItems = pantry.filter(i => parseFloat(i.quantity) <= 1)
  const recentRecipes = recipes.slice(0, 3)

  const ACTIONS = [
    { href:"/scan", emoji:"📸", label:"Scan Ingredients", sub: pantry.length > 0 ? `${pantry.length} items stored` : "AI detects from photo", color:"#FF6B35" },
    { href:"/pantry", emoji:"🧺", label:"My Pantry", sub: pantry.length > 0 ? `${pantry.length} items` : "Empty — add ingredients", color:"#4CAF7D" },
    { href:"/recipes", emoji:"✨", label:"AI Recipes", sub: recipes.length > 0 ? `${recipes.length} generated` : "Generate from pantry", color:"#8B5CF6" },
    { href:"/cookbook", emoji:"📖", label:"Recipe Book", sub:"Browse & plan meals", color:"#F59E0B" },
    { href:"/profile", emoji:"👤", label:"Taste Profile", sub: preferences.dietary !== "All" ? preferences.dietary+" · "+preferences.spice : "Personalize your AI", color:"#EC4899" },
  ]

  return (
    <main style={{minHeight:"100vh",background:"#080810"}}>
      <Nav />
      <div className="page-pad" style={{maxWidth:960,margin:"0 auto",padding:"32px 24px"}}>

        <div style={{marginBottom:28}}>
          <h1 style={{fontSize:24,fontWeight:900,color:"#fff",letterSpacing:"-.5px",marginBottom:4}}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>What are we cooking today?</p>
        </div>

        <div className="grid-5col" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:28}}>
          {ACTIONS.map(a => (
            <Link key={a.href} href={a.href} style={{textDecoration:"none",padding:"16px 14px",borderRadius:14,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column",gap:8,transition:"border-color .2s"}}
              onMouseEnter={e=>(e.currentTarget.style.borderColor=a.color+"66")}
              onMouseLeave={e=>(e.currentTarget.style.borderColor="rgba(255,255,255,.07)")}>
              <span style={{fontSize:24}}>{a.emoji}</span>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:"#fff",marginBottom:2}}>{a.label}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,.35)"}}>{a.sub}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          <div style={{padding:"18px 20px",background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",borderRadius:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>🧺 Pantry</div>
              <Link href="/recipes" style={{fontSize:10,fontWeight:700,color:"#FF6B35",textDecoration:"none",padding:"4px 10px",borderRadius:8,background:"rgba(255,107,53,.1)",border:".5px solid rgba(255,107,53,.3)"}}>Generate Recipes →</Link>
            </div>
            {pantry.length === 0 ? (
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{fontSize:28,marginBottom:6}}>🧺</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:12}}>No ingredients yet</div>
                <Link href="/scan" style={{fontSize:10,fontWeight:700,color:"#FF6B35",textDecoration:"none",padding:"6px 14px",borderRadius:8,background:"rgba(255,107,53,.12)",border:".5px solid rgba(255,107,53,.3)"}}>Add Ingredients →</Link>
              </div>
            ) : (
              <>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
                  {pantry.slice(0,9).map(item => (
                    <span key={item.id} style={{fontSize:10,fontWeight:600,padding:"3px 10px",borderRadius:8,background:"rgba(255,255,255,.05)",color:"rgba(255,255,255,.6)",border:".5px solid rgba(255,255,255,.08)"}}>{item.emoji} {item.name}</span>
                  ))}
                  {pantry.length > 9 && <span style={{fontSize:10,color:"rgba(255,255,255,.3)",padding:"3px 8px"}}>+{pantry.length-9} more</span>}
                </div>
                {lowItems.length > 0 && (
                  <div style={{padding:"8px 10px",borderRadius:9,background:"rgba(255,107,53,.07)",border:".5px solid rgba(255,107,53,.25)"}}>
                    <span style={{fontSize:9,fontWeight:700,color:"#FF6B35"}}>⚠ Running low: </span>
                    <span style={{fontSize:9,color:"rgba(255,255,255,.4)"}}>{lowItems.map(i=>i.name).join(", ")}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{padding:"18px 20px",background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",borderRadius:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>✨ Recent Recipes</div>
              <Link href="/recipes" style={{fontSize:10,fontWeight:700,color:"#8B5CF6",textDecoration:"none",padding:"4px 10px",borderRadius:8,background:"rgba(139,92,246,.1)",border:".5px solid rgba(139,92,246,.3)"}}>View All →</Link>
            </div>
            {recentRecipes.length === 0 ? (
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{fontSize:28,marginBottom:6}}>✨</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:12}}>No recipes generated yet</div>
                <Link href="/pantry" style={{fontSize:10,fontWeight:700,color:"#8B5CF6",textDecoration:"none",padding:"6px 14px",borderRadius:8,background:"rgba(139,92,246,.1)",border:".5px solid rgba(139,92,246,.3)"}}>Go to Pantry →</Link>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {recentRecipes.map(r => (
                  <Link key={r.id} href="/cook" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:10,background:"rgba(255,255,255,.03)",border:".5px solid rgba(255,255,255,.07)"}}>
                    <span style={{fontSize:22}}>{r.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#fff"}}>{r.name}</div>
                      <div style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>{r.cuisine} · {r.time_minutes}m · {r.difficulty}</div>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:6,background:"rgba(76,175,125,.12)",color:"#4CAF7D",border:".5px solid rgba(76,175,125,.3)"}}>{r.match_score}%</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{padding:"16px 20px",background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"#FF6B35",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff"}}>{firstName[0].toUpperCase()}</div>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{firstName}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{preferences.dietary} · {preferences.spice} spice · {preferences.cuisines?.join(", ")}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Link href="/profile" style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.4)",textDecoration:"none",padding:"6px 14px",borderRadius:8,background:"rgba(255,255,255,.05)",border:".5px solid rgba(255,255,255,.08)"}}>Edit Profile</Link>
            <button onClick={async()=>{await supabase.auth.signOut();router.push("/")}} style={{fontSize:10,fontWeight:700,color:"#FF3B30",padding:"6px 14px",borderRadius:8,background:"rgba(255,59,48,.08)",border:".5px solid rgba(255,59,48,.25)",cursor:"pointer"}}>Sign Out</button>
          </div>
        </div>

      </div>
    </main>
  )
}
