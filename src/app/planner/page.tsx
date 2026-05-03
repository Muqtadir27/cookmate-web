'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import Nav from "@/components/Nav"

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
const MEALS = ["breakfast","lunch","dinner"]

type Slot = {id:string,name:string,emoji:string,time:number}|null
type Plan = {[day:string]:{[meal:string]:Slot}}

export default function PlannerPage() {
  const { savedRecipes } = useStore()
  const router = useRouter()
  const [plan,setPlan] = useState<Plan>(()=>{
    const p:Plan={}; DAYS.forEach(d=>{p[d]={breakfast:null,lunch:null,dinner:null}}); return p
  })
  const [picking,setPicking] = useState<{day:string,meal:string}|null>(null)

  function assign(day:string,meal:string,r:typeof savedRecipes[0]) {
    setPlan(p=>({...p,[day]:{...p[day],[meal]:{id:r.id,name:r.name,emoji:r.emoji,time:r.time_minutes}}}))
    setPicking(null)
  }

  function clear(day:string,meal:string) {
    setPlan(p=>({...p,[day]:{...p[day],[meal]:null}}))
  }

  const totalMeals = DAYS.reduce((acc,d)=>acc+MEALS.filter(m=>plan[d][m]).length,0)

  const mealLabel: {[k:string]:string} = {breakfast:"Breakfast",lunch:"Lunch",dinner:"Dinner"}
  const mealColor: {[k:string]:string} = {breakfast:"rgba(251,191,36,.1)",lunch:"rgba(76,175,125,.1)",dinner:"rgba(255,107,53,.1)"}
  const mealBorder: {[k:string]:string} = {breakfast:"rgba(251,191,36,.25)",lunch:"rgba(76,175,125,.25)",dinner:"rgba(255,107,53,.25)"}

  return (
    <main style={{minHeight:"100vh",background:"#080810"}}>
      <Nav />
      <div className="page-pad" style={{maxWidth:1100,margin:"0 auto",padding:"32px 24px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:"-.5px",marginBottom:4}}>Meal Planner</h1>
            <p style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>{totalMeals} meals planned · {savedRecipes.length} in cookbook</p>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>router.push("/shopping")} style={{padding:"8px 14px",borderRadius:10,background:"#1A1A24",color:"rgba(255,255,255,.4)",fontSize:11,fontWeight:700,border:".5px solid rgba(255,255,255,.08)",cursor:"pointer"}}>Shopping List</button>
            <button onClick={()=>{const p:Plan={};DAYS.forEach(d=>{p[d]={breakfast:null,lunch:null,dinner:null}});setPlan(p)}} style={{padding:"8px 14px",borderRadius:10,background:"rgba(255,59,48,.1)",color:"#FF3B30",fontSize:11,fontWeight:700,border:".5px solid rgba(255,59,48,.3)",cursor:"pointer"}}>Clear Week</button>
          </div>
        </div>

        {savedRecipes.length===0 ? (
          <div style={{padding:60,borderRadius:16,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:8}}>No saved recipes to plan with</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:24}}>Generate and save recipes first, then plan your week here</div>
            <button onClick={()=>router.push("/recipes")} style={{padding:"11px 24px",borderRadius:10,background:"#FF6B35",color:"#fff",fontSize:12,fontWeight:700,border:"none",cursor:"pointer"}}>Generate Recipes</button>
          </div>
        ) : (
          <>
            <div className="grid-7col" style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8}}>
              {DAYS.map(day=>(
                <div key={day} style={{display:"flex",flexDirection:"column",gap:6}}>
                  <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.4)",textAlign:"center",padding:"6px 0",borderBottom:".5px solid rgba(255,255,255,.07)",marginBottom:2}}>{day.slice(0,3).toUpperCase()}</div>
                  {MEALS.map(meal=>{
                    const slot=plan[day][meal]
                    const isPickingThis=picking?.day===day&&picking?.meal===meal
                    return (
                      <div key={meal}>
                        <div style={{fontSize:8,fontWeight:600,color:"rgba(255,255,255,.2)",marginBottom:3}}>{mealLabel[meal].toUpperCase()}</div>
                        {slot ? (
                          <div style={{padding:"8px",borderRadius:10,background:mealColor[meal],border:".5px solid "+mealBorder[meal],position:"relative"}}>
                            <div style={{fontSize:18,textAlign:"center",marginBottom:3}}>{slot.emoji}</div>
                            <div style={{fontSize:9,fontWeight:700,color:"#fff",textAlign:"center",lineHeight:1.2,marginBottom:3}}>{slot.name}</div>
                            <div style={{fontSize:8,color:"rgba(255,255,255,.3)",textAlign:"center"}}>{slot.time}m</div>
                            <button onClick={()=>clear(day,meal)} style={{position:"absolute",top:3,right:4,background:"none",border:"none",color:"rgba(255,255,255,.2)",fontSize:10,cursor:"pointer"}}>x</button>
                          </div>
                        ) : (
                          <div onClick={()=>setPicking(isPickingThis?null:{day,meal})} style={{padding:"10px 4px",borderRadius:10,background:isPickingThis?"rgba(255,107,53,.1)":"#1A1A24",border:isPickingThis?".5px solid rgba(255,107,53,.4)":".5px solid rgba(255,255,255,.06)",textAlign:"center",cursor:"pointer",minHeight:52,display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <span style={{fontSize:16,opacity:.25}}>+</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {picking && (
              <div style={{marginTop:16,padding:"16px",borderRadius:14,background:"#1A1A24",border:".5px solid rgba(255,107,53,.3)"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#FF6B35",marginBottom:12}}>Pick for {picking.day} {mealLabel[picking.meal]}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {savedRecipes.map(r=>(
                    <div key={r.id} onClick={()=>assign(picking.day,picking.meal,r)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,background:"#0A0A0F",border:".5px solid rgba(255,255,255,.08)",cursor:"pointer"}}>
                      <span style={{fontSize:16}}>{r.emoji}</span>
                      <div>
                        <div style={{fontSize:10,fontWeight:700,color:"#fff"}}>{r.name}</div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>{r.cuisine} · {r.time_minutes}m</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
