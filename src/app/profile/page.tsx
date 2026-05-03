'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useStore } from "@/store"
import Nav from "@/components/Nav"

const CUISINES = ["Indian","Asian","Italian","Western","Mexican","Japanese","Mediterranean"]
const DIETS = ["All","Vegetarian","Vegan","Non-Veg"]
const SPICE = ["Mild","Medium","Hot","Extra Hot"]
const SERVINGS = ["1","2","3","4","6","8"]

export default function ProfilePage() {
  const { pantry, recipes, setPreferences, preferences } = useStore()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [cuisines, setCuisines] = useState(["Indian","Asian"])
  const [diet, setDiet] = useState("All")
  const [spice, setSpice] = useState("Medium")
  const [servings, setServings] = useState("2")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/auth/login")
      else setUser(data.user)
    })
    if (preferences) {
      if (preferences.cuisines?.length) setCuisines(preferences.cuisines)
      if (preferences.dietary) setDiet(preferences.dietary)
      if (preferences.spice) setSpice(preferences.spice)
      if (preferences.servings) setServings(String(preferences.servings))
    }
  }, [])

  function toggleCuisine(c: string) {
    setCuisines(s => s.includes(c) ? s.filter(x=>x!==c) : [...s,c])
  }

  function save() {
    setPreferences({ cuisines, dietary: diet, spice, servings: parseInt(servings) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (!user) return <main style={{minHeight:"100vh",background:"#080810",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"rgba(255,255,255,.4)",fontSize:13}}>Loading...</div></main>

  const firstName = user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "Chef"

  return (
    <main style={{minHeight:"100vh",background:"#080810"}}>
      <Nav />
      <div style={{maxWidth:700,margin:"0 auto",padding:"32px 24px"}}>

        <div style={{display:"flex",alignItems:"center",gap:16,padding:"20px 22px",background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",borderRadius:16,marginBottom:16}}>
          <div style={{width:48,height:48,borderRadius:"50%",background:"#FF6B35",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:"#fff",flexShrink:0}}>
            {firstName[0].toUpperCase()}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>{firstName}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>{user.email}</div>
          </div>
          <div style={{display:"flex",gap:20,textAlign:"center"}}>
            <div><div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{pantry.length}</div><div style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>Pantry Items</div></div>
            <div><div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{recipes.length}</div><div style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>Recipes</div></div>
          </div>
          <button onClick={logout} style={{padding:"6px 14px",borderRadius:9,background:"rgba(255,59,48,.1)",color:"#FF3B30",fontSize:11,fontWeight:700,border:".5px solid rgba(255,59,48,.3)",cursor:"pointer"}}>Sign out</button>
        </div>

        {[
          { title:"Favourite Cuisines", sub:"Select all you enjoy — AI will prioritize these", content:(
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {CUISINES.map(c=>(
                <button key={c} onClick={()=>toggleCuisine(c)} style={{padding:"6px 16px",borderRadius:20,fontSize:11,fontWeight:700,border:".5px solid",cursor:"pointer",background:cuisines.includes(c)?"#FF6B35":"#0A0A0F",color:cuisines.includes(c)?"#fff":"rgba(255,255,255,.4)",borderColor:cuisines.includes(c)?"#FF6B35":"rgba(255,255,255,.08)"}}>
                  {c}
                </button>
              ))}
            </div>
          )},
          { title:"Dietary Preference", sub:"Filter recipes based on your diet", content:(
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {DIETS.map(d=>(
                <button key={d} onClick={()=>setDiet(d)} style={{padding:"6px 16px",borderRadius:20,fontSize:11,fontWeight:700,border:".5px solid",cursor:"pointer",background:diet===d?"rgba(76,175,125,.15)":"#0A0A0F",color:diet===d?"#4CAF7D":"rgba(255,255,255,.4)",borderColor:diet===d?"rgba(76,175,125,.4)":"rgba(255,255,255,.08)"}}>
                  {d}
                </button>
              ))}
            </div>
          )},
          { title:"Spice Level", sub:"How much heat can you handle?", content:(
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {SPICE.map(s=>(
                <button key={s} onClick={()=>setSpice(s)} style={{padding:"6px 16px",borderRadius:20,fontSize:11,fontWeight:700,border:".5px solid",cursor:"pointer",background:spice===s?"rgba(255,107,53,.12)":"#0A0A0F",color:spice===s?"#FF6B35":"rgba(255,255,255,.4)",borderColor:spice===s?"rgba(255,107,53,.3)":"rgba(255,255,255,.08)"}}>
                  {s}
                </button>
              ))}
            </div>
          )},
          { title:"Default Servings", sub:"How many people do you usually cook for?", content:(
            <div style={{display:"flex",gap:6}}>
              {SERVINGS.map(s=>(
                <button key={s} onClick={()=>setServings(s)} style={{padding:"6px 16px",borderRadius:20,fontSize:11,fontWeight:700,border:".5px solid",cursor:"pointer",background:servings===s?"#FF6B35":"#0A0A0F",color:servings===s?"#fff":"rgba(255,255,255,.4)",borderColor:servings===s?"#FF6B35":"rgba(255,255,255,.08)"}}>
                  {s}
                </button>
              ))}
            </div>
          )},
        ].map((card,i) => (
          <div key={i} style={{padding:"18px 22px",background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",borderRadius:14,marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:3}}>{card.title}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:12}}>{card.sub}</div>
            {card.content}
          </div>
        ))}

        <button onClick={save} style={{width:"100%",padding:14,borderRadius:14,background:saved?"#4CAF7D":"#FF6B35",color:"#fff",fontSize:13,fontWeight:700,border:"none",cursor:"pointer",transition:"background .3s"}}>
          {saved ? "✓ Saved!" : "Save Preferences"}
        </button>
      </div>
    </main>
  )
}
