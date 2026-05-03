'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import Nav from "@/components/Nav"
import { RecipeCardSkeleton } from "@/components/Skeleton"

const FILTERS = ["All","Indian","Asian","Italian","Western","Mexican"]
const DIETS = ["All","Vegetarian","Vegan","Non-Veg"]

export default function RecipesPage() {
  const { pantry, recipes, setRecipes, setActiveRecipe, loading, setLoading, preferences, savedRecipes, saveRecipe, unsaveRecipe } = useStore()
  const router = useRouter()
  const [cuisine, setCuisine] = useState("All")
  const [diet, setDiet] = useState("All")
  const [error, setError] = useState("")

  async function generate() {
    if (pantry.length === 0) { router.push("/scan"); return }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/recipes", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ pantry, preferences: { cuisines: cuisine==="All"?preferences.cuisines:[cuisine], dietary: diet==="All"?preferences.dietary:diet, spice: preferences.spice, servings: preferences.servings } })
      })
      const data = await res.json()
      setRecipes(data.recipes || [])
    } catch(e: any) { setError("Failed to generate recipes. Check your API key or try again.") }
    setLoading(false)
  }

  const filtered = recipes.filter(r =>
    (cuisine === "All" || r.cuisine === cuisine) &&
    (diet === "All" || r.dietary === diet)
  )

  function scoreColor(s: number) {
    return s >= 80 ? "#4CAF7D" : "#FF6B35"
  }

  return (
    <main style={{minHeight:"100vh",background:"#080810"}}>
      <Nav />
      <div className="page-pad" style={{maxWidth:900,margin:"0 auto",padding:"32px 24px"}}>
        {error && <div style={{padding:"10px 16px",borderRadius:10,background:"rgba(255,59,48,.1)",border:".5px solid rgba(255,59,48,.3)",color:"#FF3B30",fontSize:11,fontWeight:600,marginBottom:14}}>⚠ {error}</div>}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:"-.5px",marginBottom:4}}>AI Recipes</h1>
            <p style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>Based on your {pantry.length} pantry items</p>
          </div>
          <button onClick={generate} disabled={loading} style={{padding:"10px 20px",borderRadius:10,background:"#FF6B35",color:"#fff",fontSize:12,fontWeight:700,border:"none",cursor:"pointer",opacity:loading?0.7:1}}>
            {loading ? "Generating..." : "✨ Generate Recipes"}
          </button>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
          {FILTERS.map(f => (
            <button key={f} onClick={()=>setCuisine(f)} style={{padding:"5px 14px",borderRadius:20,fontSize:10,fontWeight:700,border:".5px solid",cursor:"pointer",background:cuisine===f?"#FF6B35":"#1A1A24",color:cuisine===f?"#fff":"rgba(255,255,255,.4)",borderColor:cuisine===f?"#FF6B35":"rgba(255,255,255,.08)"}}>
              {f}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:5,marginBottom:20}}>
          {DIETS.map(d => (
            <button key={d} onClick={()=>setDiet(d)} style={{padding:"5px 14px",borderRadius:20,fontSize:10,fontWeight:700,border:".5px solid",cursor:"pointer",background:diet===d?"rgba(76,175,125,.15)":"#1A1A24",color:diet===d?"#4CAF7D":"rgba(255,255,255,.4)",borderColor:diet===d?"rgba(76,175,125,.4)":"rgba(255,255,255,.08)"}}>
              {d}
            </button>
          ))}
        </div>

        {recipes.length === 0 ? (
          <div style={{padding:44,borderRadius:16,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:12}}>✨</div>
            <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:6}}>No recipes yet</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:18}}>{pantry.length === 0 ? "Add ingredients to your pantry first" : "Click Generate Recipes to get started"}</div>
            <button onClick={pantry.length===0?()=>router.push("/scan"):generate} style={{padding:"10px 22px",borderRadius:10,background:"#FF6B35",color:"#fff",fontSize:12,fontWeight:700,border:"none",cursor:"pointer"}}>
              {pantry.length === 0 ? "Scan Ingredients" : "Generate Now"}
            </button>
          </div>
        ) : (
          <div className="grid-3col" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            {filtered.map(r => (
              <div key={r.id} style={{background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",borderRadius:14,overflow:"hidden"}}>
                <div style={{height:90,display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,background:"#12121A",position:"relative"}}>
                  {r.emoji}
                  <span style={{position:"absolute",top:8,right:10,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,background:r.match_score>=80?"rgba(76,175,125,.18)":"rgba(255,107,53,.15)",color:scoreColor(r.match_score),border:`.5px solid ${r.match_score>=80?"rgba(76,175,125,.4)":"rgba(255,107,53,.35)"}`}}>
                    {r.match_score}%
                  </span>
                </div>
                <div style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",gap:5,marginBottom:8}}>
                    <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:6,background:"rgba(255,107,53,.12)",color:"#FF6B35",border:".5px solid rgba(255,107,53,.25)"}}>{r.cuisine}</span>
                    <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:6,background:"rgba(255,255,255,.05)",color:"rgba(255,255,255,.3)",border:".5px solid rgba(255,255,255,.08)"}}>{r.dietary}</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:5,lineHeight:1.2}}>{r.name}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.35)",marginBottom:10,lineHeight:1.5}}>{r.description}</div>
                  <div style={{display:"flex",gap:10,fontSize:10,color:"rgba(255,255,255,.25)"}}>
                    <span>⏱ {r.time_minutes}m</span>
                    <span>👥 {r.servings}</span>
                    <span>📊 {r.difficulty}</span>
                    <span>🔥 {r.nutrition?.calories} cal</span>
                  </div>
                  <div style={{display:"flex",gap:6,marginTop:10}}>
                    <button onClick={()=>{setActiveRecipe(r);router.push("/cook")}} style={{flex:2,padding:"7px",borderRadius:9,background:"#FF6B35",color:"#fff",fontSize:10,fontWeight:700,border:"none",cursor:"pointer"}}>👨‍🍳 Cook This</button>
                    {(()=>{const saved=savedRecipes.find(x=>x.id===r.id);return(<button onClick={()=>saved?unsaveRecipe(r.id):saveRecipe(r)} style={{flex:1,padding:"7px",borderRadius:9,background:saved?"rgba(76,175,125,.12)":"#1A1A24",color:saved?"#4CAF7D":"rgba(255,255,255,.4)",fontSize:10,fontWeight:700,border:saved?".5px solid rgba(76,175,125,.3)":".5px solid rgba(255,255,255,.08)",cursor:"pointer"}}>{saved?"❤️ Saved":"🤍 Save"}</button>)})()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
