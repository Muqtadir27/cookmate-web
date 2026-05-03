"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import Nav from "@/components/Nav"

const HEAT_LABEL: {[k:string]:string} = {
  high:"🔥 High Heat", medium:"🔶 Medium Heat", low:"🟡 Low Heat", none:"❄️ No Heat"
}
const HEAT_COLOR: {[k:string]:string} = {
  high:"rgba(255,59,48,.15)", medium:"rgba(255,107,53,.1)", low:"rgba(251,191,36,.1)", none:"rgba(255,255,255,.04)"
}

function inferHeat(instruction: string): string {
  const t = instruction.toLowerCase()
  if (t.includes("high heat") || t.includes("fry") || t.includes("sear") || t.includes("boil")) return "high"
  if (t.includes("medium heat") || t.includes("saute") || t.includes("sauté") || t.includes("simmer")) return "medium"
  if (t.includes("low heat") || t.includes("slow") || t.includes("warm")) return "low"
  if (t.includes("chop") || t.includes("cut") || t.includes("mix") || t.includes("add") || t.includes("season")) return "none"
  return "medium"
}

function inferTimer(instruction: string, timerSec?: number): number {
  if (timerSec && timerSec > 0) return timerSec
  const t = instruction.toLowerCase()
  if (t.includes("boil")) return 600
  if (t.includes("fry") || t.includes("sear")) return 300
  if (t.includes("simmer")) return 480
  if (t.includes("chop") || t.includes("cut") || t.includes("mix")) return 120
  return 180
}

export default function CookPage() {
  const { activeRecipe, cookStep, setCookStep, deductPantryIngredients, addCookHistory } = useStore()
  const router = useRouter()
  const [chat, setChat] = useState<{role:string,text:string}[]>([
    {role:"ai", text:"👋 Hi! I am your AI chef. Ask me about substitutions, timing, or techniques."}
  ])
  const [msg, setMsg] = useState("")
  const [thinking, setThinking] = useState(false)
  const [timer, setTimer] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!activeRecipe) router.push("/recipes")
  }, [activeRecipe])

  useEffect(() => {
    let interval: any
    if (running && timer > 0) {
      interval = setInterval(() => setTimer(t => {
        if (t <= 1) { setRunning(false); return 0 }
        return t - 1
      }), 1000)
    }
    return () => clearInterval(interval)
  }, [running, timer])

  if (!activeRecipe) return null

  const steps = activeRecipe.steps || []
  const total = steps.length
  const step = steps[cookStep]
  const heat = inferHeat(step?.instruction || "")
  const stepTimer = inferTimer(step?.instruction || "", step?.timer_seconds)

  function startStepTimer() {
    setTimer(stepTimer)
    setRunning(true)
  }

  function nextStep() {
    if (cookStep === 0) {
      if(activeRecipe) addCookHistory(activeRecipe)
      if(activeRecipe) deductPantryIngredients(activeRecipe.ingredients.map(i=>i.name))
    }
    if (cookStep < total - 1) setCookStep(cookStep + 1)
    else router.push("/recipes")
    setRunning(false)
    setTimer(0)
  }

  const mm = String(Math.floor(timer/60)).padStart(2,"0")
  const ss = String(timer%60).padStart(2,"0")

  async function sendMsg() {
    if (!msg.trim()) return
    const userMsg = msg.trim()
    setMsg("")
    setChat(c=>[...c,{role:"user",text:userMsg}])
    setThinking(true)
    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          message: userMsg,
          recipe: activeRecipe?.name ?? "",
          step: step?.instruction
        })
      })
      const data = await res.json()
      setChat(c=>[...c,{role:"ai",text:data.reply||"Sorry, I couldn't answer that."}])
    } catch {
      setChat(c=>[...c,{role:"ai",text:"Connection error. Try again."}])
    }
    setThinking(false)
  }

  return (
    <main style={{minHeight:"100vh",background:"#080810"}}>
      <Nav />
      <div style={{display:"grid",gridTemplateColumns:"160px 1fr 280px",gap:0,height:"calc(100vh - 45px)"}}>

        <div style={{padding:"16px 12px",borderRight:".5px solid rgba(255,255,255,.07)",overflowY:"auto"}}>
          <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.3)",marginBottom:10,letterSpacing:".08em"}}>INGREDIENTS</div>
          {activeRecipe.ingredients.map(i=>(
            <div key={i.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 8px",borderRadius:8,background:"rgba(255,255,255,.03)",marginBottom:4}}>
              <span style={{fontSize:11,color:"rgba(255,255,255,.7)"}}>{i.emoji} {i.name}</span>
              <span style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>{i.quantity} {i.unit}</span>
            </div>
          ))}
          <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.3)",marginTop:14,marginBottom:8,letterSpacing:".08em"}}>NUTRITION</div>
          {[["Calories",activeRecipe.nutrition?.calories+" kcal"],["Protein",activeRecipe.nutrition?.protein_g+"g"],["Carbs",activeRecipe.nutrition?.carbs_g+"g"]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}>
              <span style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{k}</span>
              <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.6)"}}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{padding:"20px 24px",overflowY:"auto",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"14px 18px",background:"#1A1A24",borderRadius:14,border:".5px solid rgba(255,255,255,.08)",marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:32}}>{activeRecipe.emoji}</span>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:"#fff"}}>{activeRecipe.name}</div>
              <div style={{display:"flex",gap:12,marginTop:4,fontSize:10,color:"rgba(255,255,255,.35)"}}>
                <span>⏱ {activeRecipe.time_minutes}m</span>
                <span>👥 {activeRecipe.servings} servings</span>
                <span>📊 {activeRecipe.difficulty}</span>
              </div>
            </div>
            <div style={{marginLeft:"auto",textAlign:"right"}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>Step {cookStep+1} of {total}</div>
              <div style={{width:80,height:4,background:"rgba(255,255,255,.08)",borderRadius:2,marginTop:4}}>
                <div style={{width:`${((cookStep+1)/total)*100}%`,height:"100%",background:"#FF6B35",borderRadius:2,transition:"width .3s"}}/>
              </div>
            </div>
          </div>

          {step && (
            <div style={{flex:1}}>
              <div style={{padding:"20px 20px",borderRadius:14,background:HEAT_COLOR[heat],border:`.5px solid rgba(255,255,255,.1)`,marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:"#FF6B35",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff"}}>{cookStep+1}</div>
                    <span style={{fontSize:11,fontWeight:700,color:"#fff"}}>{step.title}</span>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,background:"rgba(255,255,255,.08)",color:"rgba(255,255,255,.5)"}}>{HEAT_LABEL[heat]}</span>
                    <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,background:"rgba(255,107,53,.15)",color:"#FF6B35"}}>⏱ ~{Math.round(stepTimer/60)}m</span>
                  </div>
                </div>
                <div style={{fontSize:13,color:"rgba(255,255,255,.8)",lineHeight:1.7,marginBottom:16}}>{step.instruction}</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <button onClick={startStepTimer} style={{padding:"7px 16px",borderRadius:8,background:running?"rgba(76,175,125,.15)":"#FF6B35",color:running?"#4CAF7D":"#fff",fontSize:11,fontWeight:700,border:running?".5px solid rgba(76,175,125,.3)":"none",cursor:"pointer"}}>
                    {running ? `⏱ ${mm}:${ss}` : timer > 0 ? `▶ ${mm}:${ss}` : `▶ Start ${Math.round(stepTimer/60)}m Timer`}
                  </button>
                  {running && <button onClick={()=>setRunning(false)} style={{padding:"7px 12px",borderRadius:8,background:"rgba(255,255,255,.05)",color:"rgba(255,255,255,.4)",fontSize:11,fontWeight:700,border:".5px solid rgba(255,255,255,.08)",cursor:"pointer"}}>Pause</button>}
                  {timer===0 && !running && cookStep>0 && <span style={{fontSize:10,color:"rgba(76,175,125,.6)"}}>✓ Timer complete</span>}
                </div>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {steps.map((s,i)=>(
                  <div key={i} onClick={()=>{setCookStep(i);setRunning(false);setTimer(0)}} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:10,background:i===cookStep?"rgba(255,107,53,.08)":i<cookStep?"rgba(76,175,125,.05)":"rgba(255,255,255,.02)",border:i===cookStep?".5px solid rgba(255,107,53,.3)":"none",cursor:"pointer"}}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:i<cookStep?"#4CAF7D":i===cookStep?"#FF6B35":"rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff",flexShrink:0}}>{i<cookStep?"✓":i+1}</div>
                    <span style={{fontSize:10,color:i===cookStep?"#fff":i<cookStep?"rgba(76,175,125,.7)":"rgba(255,255,255,.3)",flex:1}}>{s.title}</span>
                    <span style={{fontSize:9,color:"rgba(255,255,255,.2)"}}>~{Math.round(inferTimer(s.instruction,s.timer_seconds)/60)}m</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{display:"flex",gap:8,marginTop:16}}>
            <button onClick={()=>{ if(cookStep===0) router.push("/recipes"); else { setCookStep(cookStep-1); setRunning(false); setTimer(0) } }} style={{flex:1,padding:10,borderRadius:10,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",fontSize:11,fontWeight:700,color:"rgba(255,255,255,.4)",cursor:"pointer"}}>Back</button>
            <button onClick={nextStep} style={{flex:2,padding:10,borderRadius:10,background:"#FF6B35",color:"#fff",fontSize:11,fontWeight:700,border:"none",cursor:"pointer"}}>
              {cookStep < total-1 ? "Next Step →" : "✓ Done Cooking"}
            </button>
          </div>
        </div>

        <div style={{borderLeft:".5px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"12px 14px",borderBottom:".5px solid rgba(255,255,255,.07)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#fff"}}>Ask the AI Chef</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>Ask anything about this recipe</div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
            {chat.map((m,i)=>(
              <div key={i} style={{padding:"8px 10px",borderRadius:10,background:m.role==="ai"?"#1A1A24":"rgba(255,107,53,.1)",border:m.role==="ai"?".5px solid rgba(255,255,255,.07)":".5px solid rgba(255,107,53,.2)",alignSelf:m.role==="ai"?"flex-start":"flex-end",maxWidth:"90%"}}>
                <span style={{fontSize:11,color:m.role==="ai"?"rgba(255,255,255,.7)":"#FF6B35",lineHeight:1.5}}>{m.text}</span>
              </div>
            ))}
            {thinking && <div style={{padding:"8px 10px",borderRadius:10,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",alignSelf:"flex-start"}}><span style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>Thinking...</span></div>}
          </div>
          <div style={{padding:"10px 14px",borderTop:".5px solid rgba(255,255,255,.07)",display:"flex",gap:6}}>
            <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Ask anything..." style={{flex:1,padding:"8px 10px",borderRadius:8,background:"#1A1A24",border:".5px solid rgba(255,255,255,.1)",color:"#fff",fontSize:11,outline:"none"}}/>
            <button onClick={sendMsg} style={{padding:"8px 12px",borderRadius:8,background:"#FF6B35",color:"#fff",fontSize:11,fontWeight:700,border:"none",cursor:"pointer"}}>→</button>
          </div>
        </div>

      </div>
    </main>
  )
}
