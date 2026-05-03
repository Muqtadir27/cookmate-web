'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import Nav from "@/components/Nav"

export default function CookPage() {
  const { activeRecipe, cookStep, setCookStep, deductPantryIngredients, addCookHistory } = useStore()
  const router = useRouter()
  const [chat, setChat] = useState<{role:string,text:string}[]>([
    {role:"ai", text:"👋 Hi! I am your AI chef. Ask me about substitutions, timing, or techniques."}
  ])
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const [secs, setSecs] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!activeRecipe) router.push("/recipes")
  }, [activeRecipe])

  useEffect(() => {
    let t: any
    if (running) t = setInterval(() => setSecs(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [running])

  if (!activeRecipe) return null

  const steps = (activeRecipe?.steps || []).map((s: any, i: number) =>
    typeof s === "string" ? {number:i+1,title:`Step ${i+1}`,instruction:s} : s
  )
  const total = steps.length
  const pct = total > 0 ? Math.round(((cookStep + 1) / total) * 100) : 0
  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`

  async function ask() {
    const q = msg.trim()
    if (!q) return
    setMsg("")
    setChat(c => [...c, {role:"user",text:q}])
    setLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ question: q, recipe: activeRecipe?.name, step: steps[cookStep]?.instruction })
      })
      const data = await res.json()
      setChat(c => [...c, {role:"bot",text:data.answer||"Let me think about that..."}])
    } catch {
      setChat(c => [...c, {role:"bot",text:"Having trouble connecting. Try again!"}])
    }
    setLoading(false)
  }

  return (
    <main style={{minHeight:"100vh",background:"#080810",display:"flex",flexDirection:"column"}}>
      <Nav />
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 24px",borderBottom:".5px solid rgba(255,255,255,.07)"}}>
        <span style={{fontFamily:"monospace",fontSize:16,fontWeight:700,color:"#fff"}}>{fmt(secs)}</span>
        <button onClick={()=>setRunning(r=>!r)} style={{padding:"4px 12px",borderRadius:8,background:running?"rgba(255,107,53,.15)":"rgba(76,175,125,.15)",color:running?"#FF6B35":"#4CAF7D",fontSize:10,fontWeight:700,border:running?".5px solid rgba(255,107,53,.35)":".5px solid rgba(76,175,125,.35)",cursor:"pointer"}}>
          {running?"Pause":"Start"}
        </button>
        <button onClick={()=>{setSecs(0);setRunning(false)}} style={{padding:"4px 12px",borderRadius:8,background:"#1A1A24",color:"rgba(255,255,255,.3)",fontSize:10,fontWeight:700,border:".5px solid rgba(255,255,255,.08)",cursor:"pointer"}}>Reset</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"180px 1fr 200px",flex:1,overflow:"hidden"}}>

        <div style={{borderRight:".5px solid rgba(255,255,255,.07)",padding:"16px 14px",overflowY:"auto"}}>
          <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.25)",letterSpacing:".07em",textTransform:"uppercase",marginBottom:10}}>Ingredients</div>
          {(activeRecipe.ingredients||[]).map((ing,i) => (
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",borderRadius:8,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",marginBottom:5}}>
              <span style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,.7)"}}>{ing.emoji} {ing.name}</span>
              <span style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{ing.quantity} {ing.unit}</span>
            </div>
          ))}
          <div style={{marginTop:14}}>
            <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.25)",letterSpacing:".07em",textTransform:"uppercase",marginBottom:8}}>Nutrition</div>
            {[["Calories",`${activeRecipe.nutrition?.calories} kcal`],["Protein",`${activeRecipe.nutrition?.protein_g}g`],["Carbs",`${activeRecipe.nutrition?.carbs_g}g`]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:".5px solid rgba(255,255,255,.07)",fontSize:10}}>
                <span style={{color:"rgba(255,255,255,.4)"}}>{k}</span>
                <span style={{color:"#fff",fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",overflowY:"auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"#1A1A24",borderRadius:12,border:".5px solid rgba(255,255,255,.07)",marginBottom:14}}>
            <span style={{fontSize:30}}>{activeRecipe.emoji}</span>
            <div>
              <div style={{fontSize:14,fontWeight:800,color:"#fff",marginBottom:2}}>{activeRecipe.name}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>⏱ {activeRecipe.time_minutes}m &nbsp; 👥 {activeRecipe.servings} servings &nbsp; 📊 {activeRecipe.difficulty}</div>
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"rgba(255,255,255,.3)",marginBottom:6}}>
              <span>Step {cookStep+1} of {total}</span><span>{pct}%</span>
            </div>
            <div style={{height:4,borderRadius:2,background:"#1A1A24",overflow:"hidden"}}>
              <div style={{width:`${pct}%`,height:"100%",background:"#FF6B35",borderRadius:2,transition:"width .4s"}}/>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,flex:1}}>
            {steps.map((s,i) => {
              const state = i < cookStep ? "done" : i === cookStep ? "active" : "todo"
              return (
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 14px",borderRadius:12,border:".5px solid",background:state==="done"?"rgba(76,175,125,.06)":state==="active"?"rgba(255,107,53,.06)":"#1A1A24",borderColor:state==="done"?"rgba(76,175,125,.2)":state==="active"?"rgba(255,107,53,.4)":"rgba(255,255,255,.07)"}}>
                  <div style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0,background:state==="done"?"rgba(76,175,125,.2)":state==="active"?"#FF6B35":"#12121A",color:state==="done"?"#4CAF7D":state==="active"?"#fff":"rgba(255,255,255,.3)",border:state==="todo"?".5px solid rgba(255,255,255,.08)":"none"}}>
                    {state==="done"?"✓":i+1}
                  </div>
                  <div style={{fontSize:10,lineHeight:1.6,color:state==="done"?"rgba(255,255,255,.35)":state==="active"?"#fff":"rgba(255,255,255,.3)"}}>{s.instruction}</div>
                </div>
              )
            })}
          </div>
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button onClick={()=>setCookStep(Math.max(0,cookStep-1))} disabled={cookStep===0} style={{flex:1,padding:10,borderRadius:10,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",fontSize:11,fontWeight:700,color:"rgba(255,255,255,.4)",cursor:"pointer"}}>Back</button>
            {cookStep < total-1
              ? <button onClick={()=>setCookStep(cookStep+1)} style={{flex:2,padding:10,borderRadius:10,background:"#FF6B35",color:"#fff",fontSize:11,fontWeight:700,border:"none",cursor:"pointer"}}>Next Step →</button>
              : <button onClick={()=>{if(activeRecipe) addCookHistory(activeRecipe); deductPantryIngredients((activeRecipe.ingredients||[]).map((i:any)=>i.name));router.push("/recipes")}} style={{flex:2,padding:10,borderRadius:10,background:"#4CAF7D",color:"#fff",fontSize:11,fontWeight:700,border:"none",cursor:"pointer"}}>🎉 Done! Ingredients Updated</button>
            }
          </div>
        </div>

        <div style={{borderLeft:".5px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"12px 14px",borderBottom:".5px solid rgba(255,255,255,.07)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#fff"}}>Ask the AI Chef</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,.3)",marginTop:2}}>Ask anything about this recipe</div>
          </div>
          <div style={{flex:1,padding:"10px",display:"flex",flexDirection:"column",gap:6,overflowY:"auto"}}>
            {chat.map((m,i) => (
              <div key={i} style={{padding:"8px 10px",borderRadius:10,fontSize:10,lineHeight:1.6,background:m.role==="user"?"#FF6B35":m.role==="ai"?"rgba(255,107,53,.08)":"#1A1A24",color:m.role==="user"?"#fff":"rgba(255,255,255,.6)",alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"90%",border:m.role==="ai"?".5px solid rgba(255,107,53,.18)":m.role==="bot"?".5px solid rgba(255,255,255,.07)":"none"}}>
                {m.text}
              </div>
            ))}
            {loading && <div style={{padding:"8px 10px",borderRadius:10,fontSize:10,background:"#1A1A24",color:"rgba(255,255,255,.3)",border:".5px solid rgba(255,255,255,.07)"}}>Thinking...</div>}
          </div>
          <div style={{padding:"8px 10px",borderTop:".5px solid rgba(255,255,255,.07)",display:"flex",gap:6}}>
            <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ask anything..." style={{flex:1,padding:"7px 10px",borderRadius:8,background:"#1A1A24",border:".5px solid rgba(255,255,255,.1)",color:"#fff",fontSize:10,outline:"none"}}/>
            <button onClick={ask} style={{width:30,height:30,borderRadius:8,background:"#FF6B35",color:"#fff",fontSize:13,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>→</button>
          </div>
        </div>

      </div>
    </main>
  )
}
