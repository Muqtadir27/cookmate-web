"use client"
import { useState } from "react"
import { useStore } from "@/store"

const CUISINES = ["Indian","Italian","Japanese","Mexican","Chinese","Thai","French","Middle Eastern","American","Korean"]
const DIETS = ["All","Vegetarian","Vegan","Non-Veg"]
const SPICES = ["Mild","Medium","Hot"]

export default function OnboardingModal({ onDone }: { onDone: () => void }) {
  const { setPreferences, preferences } = useStore()
  const [step, setStep] = useState(0)
  const [cuisines, setCuisines] = useState<string[]>(["Indian","Italian"])
  const [dietary, setDietary] = useState("All")
  const [spice, setSpice] = useState("Medium")
  const [servings, setServings] = useState(2)

  function finish() {
    setPreferences({ cuisines, dietary, spice, servings })
    onDone()
  }

  const overlay: React.CSSProperties = {
    position:"fixed",inset:0,background:"rgba(8,8,16,.92)",backdropFilter:"blur(8px)",
    display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000
  }
  const card: React.CSSProperties = {
    background:"#1A1A24",borderRadius:20,border:".5px solid rgba(255,255,255,.1)",
    padding:"32px 28px",width:"100%",maxWidth:420
  }

  return (
    <div style={overlay}>
      <div style={card}>
        <div style={{marginBottom:24}}>
          <div style={{display:"flex",gap:6,marginBottom:20}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?"#FF6B35":"rgba(255,255,255,.1)",transition:"background .3s"}}/>
            ))}
          </div>
          {step===0 && <>
            <div style={{fontSize:22,fontWeight:900,color:"#fff",marginBottom:6}}>Welcome to CookMate AI 👋</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:20}}>Pick your favourite cuisines so we can personalize your recipes.</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {CUISINES.map(c=>(
                <button key={c} onClick={()=>setCuisines(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c])}
                  style={{padding:"7px 14px",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",
                    background:cuisines.includes(c)?"#FF6B35":"rgba(255,255,255,.05)",
                    color:cuisines.includes(c)?"#fff":"rgba(255,255,255,.4)",
                    border:cuisines.includes(c)?".5px solid #FF6B35":".5px solid rgba(255,255,255,.1)"}}>
                  {c}
                </button>
              ))}
            </div>
          </>}
          {step===1 && <>
            <div style={{fontSize:22,fontWeight:900,color:"#fff",marginBottom:6}}>Dietary preference 🥗</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:20}}>We will filter recipes accordingly.</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
              {DIETS.map(d=>(
                <button key={d} onClick={()=>setDietary(d)}
                  style={{padding:"12px 16px",borderRadius:12,fontSize:12,fontWeight:700,cursor:"pointer",textAlign:"left",
                    background:dietary===d?"rgba(255,107,53,.1)":"rgba(255,255,255,.03)",
                    color:dietary===d?"#FF6B35":"rgba(255,255,255,.5)",
                    border:dietary===d?".5px solid rgba(255,107,53,.4)":".5px solid rgba(255,255,255,.07)"}}>
                  {d==="All"?"🍽 Everything":"Veg"===d?"🥦 Vegetarian":d==="Vegan"?"🌱 Vegan":"🍗 Non-Vegetarian"}
                </button>
              ))}
            </div>
            <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.5)",marginBottom:10}}>Spice level</div>
            <div style={{display:"flex",gap:8}}>
              {SPICES.map(s=>(
                <button key={s} onClick={()=>setSpice(s)}
                  style={{flex:1,padding:"9px 0",borderRadius:10,fontSize:11,fontWeight:700,cursor:"pointer",
                    background:spice===s?"#FF6B35":"rgba(255,255,255,.04)",
                    color:spice===s?"#fff":"rgba(255,255,255,.4)",
                    border:spice===s?"none":".5px solid rgba(255,255,255,.08)"}}>
                  {s==="Mild"?"🟡 Mild":s==="Medium"?"🔶 Medium":"🔥 Hot"}
                </button>
              ))}
            </div>
          </>}
          {step===2 && <>
            <div style={{fontSize:22,fontWeight:900,color:"#fff",marginBottom:6}}>How many people? 👥</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:28}}>We will size recipes accordingly.</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:24}}>
              <button onClick={()=>setServings(s=>Math.max(1,s-1))}
                style={{width:44,height:44,borderRadius:"50%",fontSize:20,fontWeight:700,background:"rgba(255,255,255,.06)",border:".5px solid rgba(255,255,255,.1)",color:"#fff",cursor:"pointer"}}>−</button>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:48,fontWeight:900,color:"#FF6B35"}}>{servings}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>people</div>
              </div>
              <button onClick={()=>setServings(s=>Math.min(10,s+1))}
                style={{width:44,height:44,borderRadius:"50%",fontSize:20,fontWeight:700,background:"rgba(255,255,255,.06)",border:".5px solid rgba(255,255,255,.1)",color:"#fff",cursor:"pointer"}}>+</button>
            </div>
          </>}
        </div>
        <div style={{display:"flex",gap:8,marginTop:24}}>
          {step>0 && <button onClick={()=>setStep(s=>s-1)}
            style={{flex:1,padding:"11px 0",borderRadius:10,background:"rgba(255,255,255,.05)",border:".5px solid rgba(255,255,255,.08)",fontSize:12,fontWeight:700,color:"rgba(255,255,255,.4)",cursor:"pointer"}}>Back</button>}
          <button onClick={()=>step<2?setStep(s=>s+1):finish()}
            style={{flex:2,padding:"11px 0",borderRadius:10,background:"#FF6B35",border:"none",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer"}}>
            {step<2?"Continue →":"Start Cooking 🍳"}
          </button>
        </div>
        <button onClick={onDone} style={{display:"block",margin:"12px auto 0",fontSize:10,color:"rgba(255,255,255,.25)",background:"none",border:"none",cursor:"pointer"}}>Skip for now</button>
      </div>
    </div>
  )
}
