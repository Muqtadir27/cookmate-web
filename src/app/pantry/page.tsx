'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import Nav from "@/components/Nav"

const UNITS = ["pcs","g","kg","cup","ml","l","tbsp","tsp","cloves","bunch"]

export default function PantryPage() {
  const { pantry, removePantryItem, clearPantry, addPantryItems, updatePantryItem } = useStore()
  const router = useRouter()
  const [editing, setEditing] = useState<{[id:string]:{qty:string,unit:string}}>({})
  const [search, setSearch] = useState("")

  function startEdit(id: string, qty: string, unit: string) {
    setEditing(e => ({...e, [id]:{qty,unit}}))
  }

  function saveEdit(id: string) {
    const e = editing[id]
    if (!e) return
    updatePantryItem(id, e.qty, e.unit)
    setEditing(ed => { const n={...ed}; delete n[id]; return n })
  }

  return (
    <main style={{minHeight:"100vh",background:"#080810"}}>
      <Nav />
      <div className="page-pad" style={{maxWidth:900,margin:"0 auto",padding:"32px 24px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:"-.5px",marginBottom:4}}>My Pantry</h1>
            <p style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>{pantry.length} ingredients stored</p>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>router.push("/scan")} style={{padding:"8px 14px",borderRadius:10,background:"#1A1A24",color:"rgba(255,255,255,.5)",fontSize:11,fontWeight:700,border:".5px solid rgba(255,255,255,.08)",cursor:"pointer"}}>📸 Add More</button>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search pantry..." style={{padding:"8px 12px",borderRadius:9,background:"#1A1A24",border:".5px solid rgba(255,255,255,.1)",color:"#fff",fontSize:11,outline:"none",width:160}}/>
          <button onClick={clearPantry} style={{padding:"8px 14px",borderRadius:10,background:"rgba(255,59,48,.1)",color:"#FF3B30",fontSize:11,fontWeight:700,border:".5px solid rgba(255,59,48,.3)",cursor:"pointer"}}>Clear All</button>
            <button onClick={()=>router.push("/recipes")} style={{padding:"8px 14px",borderRadius:10,background:"#FF6B35",color:"#fff",fontSize:11,fontWeight:700,border:"none",cursor:"pointer"}}>✨ Generate Recipes</button>
          </div>
        </div>

        {pantry.length === 0 ? (
          <div style={{padding:44,borderRadius:16,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:12}}>🧺</div>
            <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:6}}>Your pantry is empty</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:18}}>Scan or add ingredients to get started</div>
            <button onClick={()=>router.push("/scan")} style={{padding:"10px 22px",borderRadius:10,background:"#FF6B35",color:"#fff",fontSize:12,fontWeight:700,border:"none",cursor:"pointer"}}>Add Ingredients →</button>
          </div>
        ) : (
          <div className="grid-3col" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {pantry.filter(i=>!search||i.name.toLowerCase().includes(search.toLowerCase())).map(item => {
              const ed = editing[item.id]
              return (
                <div key={item.id} style={{padding:"12px 14px",borderRadius:12,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:ed?10:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:22}}>{item.emoji}</span>
                      <div style={{fontSize:12,fontWeight:600,color:"#fff"}}>{item.name}</div>
                    </div>
                    <button onClick={()=>removePantryItem(item.id)} style={{background:"none",border:"none",color:"rgba(255,255,255,.2)",fontSize:14,cursor:"pointer"}}>✕</button>
                  </div>
                  {ed ? (
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <input value={ed.qty} onChange={e=>setEditing(ev=>({...ev,[item.id]:{...ev[item.id],qty:e.target.value}}))} style={{width:52,padding:"4px 8px",borderRadius:7,background:"#0A0A0F",border:".5px solid rgba(255,255,255,.1)",color:"#fff",fontSize:11,outline:"none",textAlign:"center"}}/>
                      <select value={ed.unit} onChange={e=>setEditing(ev=>({...ev,[item.id]:{...ev[item.id],unit:e.target.value}}))} style={{flex:1,padding:"4px 8px",borderRadius:7,background:"#0A0A0F",border:".5px solid rgba(255,255,255,.1)",color:"#fff",fontSize:11,outline:"none"}}>
                        {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
                      </select>
                      <button onClick={()=>saveEdit(item.id)} style={{padding:"4px 10px",borderRadius:7,background:"#4CAF7D",color:"#fff",fontSize:10,fontWeight:700,border:"none",cursor:"pointer"}}>✓</button>
                    </div>
                  ) : (
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6}}>
                      <span style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{item.quantity} {item.unit}</span>
                      <button onClick={()=>startEdit(item.id,item.quantity,item.unit)} style={{fontSize:10,color:"rgba(255,107,53,.6)",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Edit</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
