'use client'
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import Nav from "@/components/Nav"

const CUISINES = [
  "Italian","Japanese","Indian","Mexican","Chinese","Thai",
  "French","Middle Eastern","American","Korean","Spanish","Turkish"
]
const CATEGORIES = ["Any","Breakfast","Lunch","Dinner","Snacks","Desserts","Drinks"]
const DIETS = ["All","Vegetarian","Vegan","Non-Veg"]
const TABS = ["My Cookbook","Discover"]

export default function CookbookPage() {
  const { savedRecipes, unsaveRecipe, saveRecipe, pantry, setActiveRecipe, rateRecipe, ratedRecipes } = useStore()
  const router = useRouter()

  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string|null>(null)
  const [loadingId, setLoadingId] = useState<string|null>(null)

  const [cuisine, setCuisine] = useState("Italian")
  const [category, setCategory] = useState("Any")
  const [diet, setDiet] = useState("All")
  const [discovering, setDiscovering] = useState(false)
  const [discoverResults, setDiscoverResults] = useState<any[]>([])
  const [discoverError, setDiscoverError] = useState("")
  const [discoverSelected, setDiscoverSelected] = useState<string|null>(null)

  const pantryNames = new Set(pantry.map(i=>i.name.toLowerCase()))

  function getStatus(ingredients: {name:string,have:boolean}[]) {
    const missing = ingredients.filter(i=>!pantryNames.has(i.name.toLowerCase())).map(i=>i.name)
    return { missing, canMake: missing.length===0, partial: missing.length>0 && missing.length<ingredients.length }
  }

  const filtered = savedRecipes.filter(r=>!search||r.name.toLowerCase().includes(search.toLowerCase()))
  const canMakeCount = savedRecipes.filter(r=>getStatus(r.ingredients).canMake).length

  async function cookNow(r: any) {
    setLoadingId(r.id)
    try {
      const res = await fetch("/api/recipes", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          pantry: r.ingredients.map((i:any)=>({name:i.name,quantity:i.quantity,unit:i.unit})),
          preferences:{ cuisines:[r.cuisine], dietary:r.dietary, spice:"medium", servings:r.servings }
        })
      })
      const data = await res.json()
      const match = (data.recipes||[]).find((x:any)=>x.name.toLowerCase().includes(r.name.split(" ")[0].toLowerCase())) || data.recipes?.[0]
      if (match) { setActiveRecipe(match); setLoadingId(null); router.push("/cook"); return }
    } catch {}
    setActiveRecipe(r); setLoadingId(null); router.push("/cook")
  }

  async function discover() {
    setDiscovering(true); setDiscoverError(""); setDiscoverResults([])
    try {
      const res = await fetch("/api/discover", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ cuisine, category, dietary: diet })
      })
      const data = await res.json()
      if (data.error) { setDiscoverError("AI error: "+data.error); setDiscovering(false); return }
      const withIds = (data.recipes||[]).map((r:any,i:number)=>({...r, id:"d_"+Date.now()+"_"+i}))
      setDiscoverResults(withIds)
    } catch(e:any) { setDiscoverError("Failed to fetch. Check connection.") }
    setDiscovering(false)
  }

  const isSaved = (id:string) => savedRecipes.some(r=>r.id===id)

  return (
    <main style={{minHeight:"100vh",background:"#080810"}}>
      <Nav />
      <div className="page-pad" style={{maxWidth:980,margin:"0 auto",padding:"32px 24px"}}>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:"-.5px",marginBottom:4}}>Recipe Book</h1>
            <p style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>
              {tab===0
                ? <><span style={{color:"#4CAF7D",fontWeight:700}}>{canMakeCount} ready</span>&nbsp;·&nbsp;{savedRecipes.length} saved</>
                : <span style={{color:"rgba(255,255,255,.35)"}}>Explore dishes from around the world</span>
              }
            </p>
          </div>
          {tab===0 && <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search saved..." style={{padding:"8px 14px",borderRadius:10,background:"#1A1A24",border:".5px solid rgba(255,255,255,.1)",color:"#fff",fontSize:11,outline:"none",width:190}}/>}
        </div>

        <div style={{display:"flex",gap:0,marginBottom:24,borderBottom:".5px solid rgba(255,255,255,.07)"}}>
          {TABS.map((t,i)=>(
            <button key={t} onClick={()=>setTab(i)} style={{padding:"10px 22px",fontSize:12,fontWeight:700,background:"none",border:"none",cursor:"pointer",color:tab===i?"#FF6B35":"rgba(255,255,255,.3)",borderBottom:tab===i?"2px solid #FF6B35":"2px solid transparent",transition:"all .2s"}}>
              {t}{i===0&&savedRecipes.length>0?` (${savedRecipes.length})`:""}
            </button>
          ))}
        </div>

        {tab===0 && (
          <>
            {savedRecipes.length===0 ? (
              <div style={{padding:60,borderRadius:16,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",textAlign:"center"}}>
                <div style={{fontSize:48,marginBottom:16}}>📖</div>
                <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:8}}>Your cookbook is empty</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:24}}>Generate AI recipes and save them, or browse Discover to find global dishes</div>
                <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                  <button onClick={()=>router.push("/recipes")} style={{padding:"10px 20px",borderRadius:10,background:"#FF6B35",color:"#fff",fontSize:12,fontWeight:700,border:"none",cursor:"pointer"}}>Generate Recipes</button>
                  <button onClick={()=>setTab(1)} style={{padding:"10px 20px",borderRadius:10,background:"#1A1A24",color:"rgba(255,255,255,.5)",fontSize:12,fontWeight:700,border:".5px solid rgba(255,255,255,.1)",cursor:"pointer"}}>Discover Dishes</button>
                </div>
              </div>
            ) : (
              <div className="grid-3col" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {filtered.map(r=>{
                  const {missing,canMake,partial}=getStatus(r.ingredients)
                  const isOpen=selected===r.id
                  return (
                    <div key={r.id} onClick={()=>setSelected(isOpen?null:r.id)} style={{borderRadius:14,background:"#1A1A24",border:isOpen?".5px solid rgba(255,107,53,.5)":canMake?".5px solid rgba(76,175,125,.2)":".5px solid rgba(255,255,255,.07)",overflow:"hidden",cursor:"pointer"}}>
                      <div style={{padding:"12px 14px"}}>
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                          <span style={{fontSize:28}}>{r.emoji}</span>
                          <div style={{display:"flex",gap:4,marginLeft:6}} onClick={e=>e.stopPropagation()}>
                            <button onClick={()=>rateRecipe(r.id,1)} style={{padding:"3px 8px",borderRadius:8,fontSize:12,background:ratedRecipes[r.id]===1?"rgba(76,175,125,.2)":"rgba(255,255,255,.05)",border:ratedRecipes[r.id]===1?".5px solid rgba(76,175,125,.4)":".5px solid rgba(255,255,255,.08)",cursor:"pointer"}}>👍</button>
                            <button onClick={()=>rateRecipe(r.id,-1)} style={{padding:"3px 8px",borderRadius:8,fontSize:12,background:ratedRecipes[r.id]===-1?"rgba(255,59,48,.2)":"rgba(255,255,255,.05)",border:ratedRecipes[r.id]===-1?".5px solid rgba(255,59,48,.4)":".5px solid rgba(255,255,255,.08)",cursor:"pointer"}}>👎</button>
                          </div>
                          <div style={{display:"flex",gap:5,alignItems:"center"}}>
                            {canMake
                              ? <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:6,background:"rgba(76,175,125,.15)",color:"#4CAF7D",border:".5px solid rgba(76,175,125,.35)"}}>Ready</span>
                              : partial
                                ? <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:6,background:"rgba(255,107,53,.12)",color:"#FF6B35",border:".5px solid rgba(255,107,53,.3)"}}>-{missing.length}</span>
                                : null
                            }
                            <button onClick={e=>{e.stopPropagation();unsaveRecipe(r.id)}} style={{background:"none",border:"none",color:"rgba(255,255,255,.2)",fontSize:11,cursor:"pointer",padding:"0 2px"}}>x</button>
                          </div>
                        </div>
                        <div style={{fontSize:12,fontWeight:700,color:"#fff",marginBottom:4,lineHeight:1.2}}>{r.name}</div>
                        <div style={{display:"flex",gap:5,marginBottom:6,flexWrap:"wrap"}}>
                          <span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:5,background:"rgba(255,107,53,.1)",color:"#FF6B35"}}>{r.cuisine}</span>
                          <span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:5,background:"rgba(255,255,255,.05)",color:"rgba(255,255,255,.3)"}}>{r.dietary}</span>
                        </div>
                        <div style={{display:"flex",gap:8,fontSize:9,color:"rgba(255,255,255,.25)"}}>
                          <span>{r.time_minutes}m</span><span>{r.difficulty}</span><span>{r.nutrition?.calories} cal</span>
                          <span style={{marginLeft:"auto",color:"rgba(76,175,125,.6)",fontWeight:700}}>{r.match_score}%</span>
                        </div>
                      </div>
                      {isOpen && (
                        <div style={{borderTop:".5px solid rgba(255,255,255,.07)",padding:"10px 14px"}}>
                          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
                            {r.ingredients.map((ing:any)=>{
                              const has=pantryNames.has(ing.name.toLowerCase())
                              return <span key={ing.name} style={{fontSize:9,padding:"2px 8px",borderRadius:6,background:has?"rgba(76,175,125,.12)":"rgba(255,59,48,.1)",color:has?"#4CAF7D":"#FF3B30",border:has?".5px solid rgba(76,175,125,.3)":".5px solid rgba(255,59,48,.3)"}}>{has?"v":"x"} {ing.name}</span>
                            })}
                          </div>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={e=>{e.stopPropagation();cookNow(r)}} style={{flex:1,padding:"8px",borderRadius:9,background:canMake?"#4CAF7D":"rgba(255,107,53,.12)",color:canMake?"#fff":"#FF6B35",fontSize:10,fontWeight:700,border:canMake?"none":".5px solid rgba(255,107,53,.3)",cursor:"pointer"}}>
                              {loadingId===r.id?"Loading...":canMake?"Cook Now":"Cook Anyway"}
                            </button>
                            {missing.length>0&&<button onClick={e=>{e.stopPropagation();router.push("/shopping")}} style={{flex:1,padding:"8px",borderRadius:9,background:"#1A1A24",color:"rgba(255,255,255,.4)",fontSize:10,fontWeight:700,border:".5px solid rgba(255,255,255,.08)",cursor:"pointer"}}>Shopping List</button>}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {tab===1 && (
          <div>
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"flex-end"}}>
              <div>
                <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.3)",marginBottom:6}}>CUISINE</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {CUISINES.map(c=>(
                    <button key={c} onClick={()=>setCuisine(c)} style={{padding:"5px 12px",borderRadius:20,fontSize:10,fontWeight:700,border:".5px solid",cursor:"pointer",background:cuisine===c?"#FF6B35":"#1A1A24",color:cuisine===c?"#fff":"rgba(255,255,255,.4)",borderColor:cuisine===c?"#FF6B35":"rgba(255,255,255,.08)"}}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"flex-end"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.3)",marginBottom:6}}>CATEGORY</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {CATEGORIES.map(c=>(
                    <button key={c} onClick={()=>setCategory(c)} style={{padding:"5px 12px",borderRadius:20,fontSize:10,fontWeight:700,border:".5px solid",cursor:"pointer",background:category===c?"rgba(139,92,246,.2)":"#1A1A24",color:category===c?"#8B5CF6":"rgba(255,255,255,.4)",borderColor:category===c?"rgba(139,92,246,.5)":"rgba(255,255,255,.08)"}}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.3)",marginBottom:6}}>DIET</div>
                <div style={{display:"flex",gap:5}}>
                  {DIETS.map(d=>(
                    <button key={d} onClick={()=>setDiet(d)} style={{padding:"5px 12px",borderRadius:20,fontSize:10,fontWeight:700,border:".5px solid",cursor:"pointer",background:diet===d?"rgba(76,175,125,.15)":"#1A1A24",color:diet===d?"#4CAF7D":"rgba(255,255,255,.4)",borderColor:diet===d?"rgba(76,175,125,.4)":"rgba(255,255,255,.08)"}}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={discover} disabled={discovering} style={{width:"100%",padding:"12px",borderRadius:12,background:discovering?"#1A1A24":"linear-gradient(135deg,#FF6B35,#ff8c5a)",color:discovering?"rgba(255,255,255,.3)":"#fff",fontSize:13,fontWeight:700,border:".5px solid rgba(255,107,53,.3)",cursor:discovering?"not-allowed":"pointer",marginBottom:20,transition:"all .2s"}}>
              {discovering?"Searching the world for "+cuisine+" "+category+" dishes...":"Discover "+cuisine+" "+category+" Dishes"}
            </button>

            {discoverError && <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(255,59,48,.1)",border:".5px solid rgba(255,59,48,.3)",color:"#FF3B30",fontSize:11,marginBottom:14}}>{discoverError}</div>}

            {discoverResults.length>0 && (
              <>
                <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.35)",marginBottom:12}}>{discoverResults.length} dishes found · Click any to expand</div>
                <div className="grid-3col" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                  {discoverResults.map(r=>{
                    const isOpen=discoverSelected===r.id
                    const saved=isSaved(r.id)
                    return (
                      <div key={r.id} onClick={()=>setDiscoverSelected(isOpen?null:r.id)} style={{borderRadius:14,background:"#1A1A24",border:isOpen?".5px solid rgba(255,107,53,.4)":".5px solid rgba(255,255,255,.07)",overflow:"hidden",cursor:"pointer"}}>
                        <div style={{padding:"12px 14px"}}>
                          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                            <span style={{fontSize:28}}>{r.emoji}</span>
                          <div style={{display:"flex",gap:4,marginLeft:6}} onClick={e=>e.stopPropagation()}>
                            <button onClick={()=>rateRecipe(r.id,1)} style={{padding:"3px 8px",borderRadius:8,fontSize:12,background:ratedRecipes[r.id]===1?"rgba(76,175,125,.2)":"rgba(255,255,255,.05)",border:ratedRecipes[r.id]===1?".5px solid rgba(76,175,125,.4)":".5px solid rgba(255,255,255,.08)",cursor:"pointer"}}>👍</button>
                            <button onClick={()=>rateRecipe(r.id,-1)} style={{padding:"3px 8px",borderRadius:8,fontSize:12,background:ratedRecipes[r.id]===-1?"rgba(255,59,48,.2)":"rgba(255,255,255,.05)",border:ratedRecipes[r.id]===-1?".5px solid rgba(255,59,48,.4)":".5px solid rgba(255,255,255,.08)",cursor:"pointer"}}>👎</button>
                          </div>
                            <button onClick={e=>{e.stopPropagation();saved?unsaveRecipe(r.id):saveRecipe(r)}} style={{fontSize:9,fontWeight:700,padding:"3px 10px",borderRadius:6,background:saved?"rgba(76,175,125,.15)":"rgba(255,107,53,.1)",color:saved?"#4CAF7D":"#FF6B35",border:saved?".5px solid rgba(76,175,125,.35)":".5px solid rgba(255,107,53,.3)",cursor:"pointer"}}>
                              {saved?"Saved":"+ Save"}
                            </button>
                          </div>
                          <div style={{fontSize:12,fontWeight:700,color:"#fff",marginBottom:4,lineHeight:1.2}}>{r.name}</div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,.35)",marginBottom:6,lineHeight:1.4}}>{r.description}</div>
                          <div style={{display:"flex",gap:5,marginBottom:6}}>
                            <span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:5,background:"rgba(255,107,53,.1)",color:"#FF6B35"}}>{r.cuisine}</span>
                            <span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:5,background:"rgba(255,255,255,.05)",color:"rgba(255,255,255,.3)"}}>{r.dietary}</span>
                          </div>
                          <div style={{display:"flex",gap:8,fontSize:9,color:"rgba(255,255,255,.25)"}}>
                            <span>{r.time_minutes}m</span><span>{r.difficulty}</span><span>{r.nutrition?.calories} cal</span>
                          </div>
                        </div>
                        {isOpen && (
                          <div style={{borderTop:".5px solid rgba(255,255,255,.07)",padding:"10px 14px"}}>
                            <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.3)",marginBottom:6}}>INGREDIENTS</div>
                            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
                              {r.ingredients.map((ing:any)=>(
                                <span key={ing.name} style={{fontSize:9,padding:"2px 8px",borderRadius:6,background:"rgba(255,255,255,.05)",color:"rgba(255,255,255,.5)",border:".5px solid rgba(255,255,255,.08)"}}>{ing.name}</span>
                              ))}
                            </div>
                            <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.3)",marginBottom:6}}>STEPS ({r.steps?.length})</div>
                            <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:10}}>
                              {r.steps?.slice(0,3).map((s:any)=>(
                                <div key={s.number} style={{fontSize:9,color:"rgba(255,255,255,.45)",lineHeight:1.4}}><span style={{color:"#FF6B35",fontWeight:700}}>{s.number}.</span> {s.instruction}</div>
                              ))}
                              {r.steps?.length>3&&<div style={{fontSize:9,color:"rgba(255,255,255,.25)"}}>+{r.steps.length-3} more steps...</div>}
                            </div>
                            <div style={{display:"flex",gap:6}}>
                              <button onClick={e=>{e.stopPropagation();if(!saved)saveRecipe(r);setActiveRecipe(r);router.push("/cook")}} style={{flex:1,padding:"8px",borderRadius:9,background:"#FF6B35",color:"#fff",fontSize:10,fontWeight:700,border:"none",cursor:"pointer"}}>Cook This</button>
                              <button onClick={e=>{e.stopPropagation();saved?unsaveRecipe(r.id):saveRecipe(r)}} style={{flex:1,padding:"8px",borderRadius:9,background:saved?"rgba(76,175,125,.12)":"#1A1A24",color:saved?"#4CAF7D":"rgba(255,255,255,.4)",fontSize:10,fontWeight:700,border:saved?".5px solid rgba(76,175,125,.3)":".5px solid rgba(255,255,255,.08)",cursor:"pointer"}}>
                                {saved?"Saved to Cookbook":"Save to Cookbook"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {!discovering && discoverResults.length===0 && !discoverError && (
              <div style={{padding:48,borderRadius:16,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:12}}>🌍</div>
                <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:6}}>Explore Global Cuisine</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>Pick a cuisine and category above, then hit Discover</div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  )
}
