'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/store"
import Nav from "@/components/Nav"

export default function ShoppingPage() {
  const { pantry, savedRecipes, addPantryItems } = useStore()
  const router = useRouter()
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [added, setAdded] = useState(false)
  const [filterRecipe, setFilterRecipe] = useState<string|null>(null)

  const pantryNames = new Set(pantry.map(i=>i.name.toLowerCase()))

  const missingMap: {[item:string]:{recipes:string[]}} = {}
  savedRecipes.forEach(recipe => {
    if (filterRecipe && recipe.name !== filterRecipe) return
    recipe.ingredients.forEach(ing => {
      if (!pantryNames.has(ing.name.toLowerCase())) {
        if (!missingMap[ing.name]) missingMap[ing.name] = {recipes:[]}
        if (!missingMap[ing.name].recipes.includes(recipe.name))
          missingMap[ing.name].recipes.push(recipe.name)
      }
    })
  })

  const allMissing = Object.keys(missingMap).sort()
  const readyCount = savedRecipes.filter(r=>r.ingredients.every(i=>pantryNames.has(i.name.toLowerCase()))).length

  function toggle(item:string) {
    setChecked(s=>{const n=new Set(s);n.has(item)?n.delete(item):n.add(item);return n})
  }

  function addToPantry() {
    addPantryItems(Array.from(checked).map(name=>({
      id:Date.now().toString()+Math.random(), name, emoji:"\u{1F6D2}", quantity:"1", unit:"pcs", category:"other"
    })) as any)
    setAdded(true); setChecked(new Set())
    setTimeout(()=>setAdded(false),2500)
  }

  return (
    <main style={{minHeight:"100vh",background:"#080810"}}>
      <Nav />
      <div className="page-pad" style={{maxWidth:800,margin:"0 auto",padding:"32px 24px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:"-.5px",marginBottom:4}}>Shopping List</h1>
            <p style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>
              <span style={{color:"#4CAF7D",fontWeight:700}}>{readyCount} saved recipes ready</span>
              &nbsp;·&nbsp;{allMissing.length} items to buy
            </p>
          </div>
          <div style={{display:"flex",gap:8}}>
            {checked.size>0 && <button onClick={addToPantry} style={{padding:"8px 16px",borderRadius:10,background:added?"#4CAF7D":"#FF6B35",color:"#fff",fontSize:11,fontWeight:700,border:"none",cursor:"pointer"}}>{added?"Added!":"+ Add "+checked.size+" to Pantry"}</button>}
            {allMissing.length>0 && <button onClick={()=>setChecked(new Set(allMissing))} style={{padding:"8px 14px",borderRadius:10,background:"#1A1A24",color:"rgba(255,255,255,.4)",fontSize:11,fontWeight:700,border:".5px solid rgba(255,255,255,.08)",cursor:"pointer"}}>Select All</button>}
          </div>
        </div>

        {savedRecipes.length === 0 ? (
          <div style={{padding:60,borderRadius:16,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",textAlign:"center"}}>
            <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:8}}>No saved recipes yet</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:20}}>Save recipes to your cookbook — shopping list auto-generates from them</div>
            <button onClick={()=>router.push("/recipes")} style={{padding:"10px 22px",borderRadius:10,background:"#FF6B35",color:"#fff",fontSize:12,fontWeight:700,border:"none",cursor:"pointer"}}>Generate Recipes</button>
          </div>
        ) : (
          <>
            <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
              <button onClick={()=>setFilterRecipe(null)} style={{padding:"5px 14px",borderRadius:20,fontSize:10,fontWeight:700,border:".5px solid",cursor:"pointer",background:!filterRecipe?"#FF6B35":"#1A1A24",color:!filterRecipe?"#fff":"rgba(255,255,255,.4)",borderColor:!filterRecipe?"#FF6B35":"rgba(255,255,255,.08)"}}>All</button>
              {savedRecipes.filter(r=>r.ingredients.some(i=>!pantryNames.has(i.name.toLowerCase()))).map(r=>(
                <button key={r.id} onClick={()=>setFilterRecipe(filterRecipe===r.name?null:r.name)} style={{padding:"5px 12px",borderRadius:20,fontSize:10,fontWeight:700,border:".5px solid",cursor:"pointer",background:filterRecipe===r.name?"rgba(255,107,53,.15)":"#1A1A24",color:filterRecipe===r.name?"#FF6B35":"rgba(255,255,255,.4)",borderColor:filterRecipe===r.name?"rgba(255,107,53,.4)":"rgba(255,255,255,.08)"}}>
                  {r.emoji} {r.name}
                </button>
              ))}
            </div>
            {allMissing.length===0 ? (
              <div style={{padding:44,borderRadius:16,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",textAlign:"center"}}>
                <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:6}}>{filterRecipe?"You have everything for "+filterRecipe+"!":"Pantry covers all saved recipes!"}</div>
                <button onClick={()=>router.push("/cookbook")} style={{marginTop:14,padding:"10px 22px",borderRadius:10,background:"#FF6B35",color:"#fff",fontSize:12,fontWeight:700,border:"none",cursor:"pointer"}}>Cook Something</button>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {allMissing.map(item=>{
                  const isChecked=checked.has(item)
                  return (
                    <div key={item} onClick={()=>toggle(item)} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 16px",borderRadius:12,background:isChecked?"rgba(76,175,125,.08)":"#1A1A24",border:isChecked?".5px solid rgba(76,175,125,.3)":".5px solid rgba(255,255,255,.07)",cursor:"pointer",transition:"all .15s"}}>
                      <div style={{width:20,height:20,borderRadius:6,border:isChecked?"none":".5px solid rgba(255,255,255,.2)",background:isChecked?"#4CAF7D":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {isChecked&&<span style={{color:"#fff",fontSize:11,fontWeight:800}}>✓</span>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:700,color:isChecked?"rgba(255,255,255,.35)":"#fff",textDecoration:isChecked?"line-through":"none"}}>{item}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,.25)",marginTop:2}}>{missingMap[item].recipes.slice(0,3).join(", ")}{missingMap[item].recipes.length>3?" +"+(missingMap[item].recipes.length-3)+" more":""}</div>
                      </div>
                      <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:6,background:"rgba(255,107,53,.1)",color:"#FF6B35",border:".5px solid rgba(255,107,53,.2)"}}>{missingMap[item].recipes.length} recipe{missingMap[item].recipes.length>1?"s":""}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
