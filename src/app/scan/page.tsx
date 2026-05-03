'use client'
import { useState, Suspense, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useStore } from "@/store"
import Nav from "@/components/Nav"

const QUICK = [
  {e:"🍅",n:"Tomatoes",u:"pcs"},{e:"🧅",n:"Onion",u:"pcs"},{e:"🥚",n:"Eggs",u:"pcs"},
  {e:"🧄",n:"Garlic",u:"cloves"},{e:"🍚",n:"Rice",u:"cup"},{e:"🥛",n:"Milk",u:"ml"},
  {e:"🧈",n:"Butter",u:"tbsp"},{e:"🌶",n:"Chilli",u:"pcs"},{e:"🥬",n:"Spinach",u:"g"},
  {e:"🧀",n:"Cheese",u:"cup"},{e:"🥔",n:"Potato",u:"pcs"},{e:"🫘",n:"Dal",u:"cup"},
]
const UNITS = ["pcs","g","kg","cup","ml","l","tbsp","tsp","cloves","bunch"]

function ScanPageInner() {
  const { addPantryItems } = useStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<"camera"|"manual">("camera")
  const [selected, setSelected] = useState<{name:string,emoji:string,qty:string,unit:string}[]>([])
  const [manual, setManual] = useState("")
  const [camActive, setCamActive] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [stream, setStream] = useState<MediaStream|null>(null)

  useEffect(() => {
    const add = searchParams.get("add")
    if (add) {
      const names = add.split(",").map(n=>n.trim()).filter(Boolean)
      const items = names.map(name => {
        const q = QUICK.find(q=>q.n.toLowerCase()===name.toLowerCase())
        return {name: q?.n||name, emoji: q?.e||"🥗", qty:"1", unit: q?.u||"pcs"}
      })
      setSelected(items)
    }
  }, [])

  useEffect(() => {
    return () => { stream?.getTracks().forEach(t=>t.stop()) }
  }, [stream])

  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}})
      setStream(s)
      if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play() }
      setCamActive(true)
    } catch { alert("Camera access denied. Please allow camera permissions.") }
  }

  function stopCamera() {
    stream?.getTracks().forEach(t=>t.stop())
    setStream(null)
    setCamActive(false)
  }

  async function captureAndScan() {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0)
    const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1]
    setScanning(true)
    stopCamera()
    try {
      const res = await fetch("/api/scan", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({base64, mimeType:"image/jpeg"})
      })
      const data = await res.json()
      const detected: string[] = data.ingredients || []
      const items = detected.map((name:string) => {
        const q = QUICK.find(q=>q.n.toLowerCase()===name.toLowerCase())
        return {name: q?.n||name, emoji: q?.e||"🥗", qty:"1", unit: q?.u||"pcs"}
      })
      setSelected(s => {
        const existing = new Set(s.map(x=>x.name.toLowerCase()))
        return [...s, ...items.filter(i=>!existing.has(i.name.toLowerCase()))]
      })
    } catch { alert("Scan failed. Try manual mode.") }
    setScanning(false)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    const img = new Image()
    img.onload = async () => {
      const MAX = 768
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
      const base64 = canvas.toDataURL("image/jpeg", 0.75).split(",")[1]
      try {
        const res = await fetch("/api/scan", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({base64, mimeType: "image/jpeg"})
        })
        const data = await res.json()
        const detected: any[] = data.ingredients || []
        const items = detected.map((ing:any) => {
          const name = typeof ing === "string" ? ing : ing.name
          const q = QUICK.find(q=>q.n.toLowerCase()===(name||"").toLowerCase())
          return {name: q?.n||name, emoji: ing.emoji||q?.e||"🥗", qty: ing.quantity||"1", unit: ing.unit||q?.u||"pcs"}
        })
        setSelected(s => {
          const existing = new Set(s.map(x=>x.name.toLowerCase()))
          return [...s, ...items.filter(i=>!existing.has(i.name.toLowerCase()))]
        })
      } catch { alert("Scan failed. Try manual mode.") }
      setScanning(false)
    }
    img.src = URL.createObjectURL(file)
  }

  function toggle(name: string, emoji: string, defUnit: string) {
    setSelected(s => s.find(x=>x.name===name) ? s.filter(x=>x.name!==name) : [...s, {name, emoji, qty:"1", unit:defUnit}])
  }

  function updateItem(name: string, key: "qty"|"unit", val: string) {
    setSelected(s => s.map(x => x.name===name ? {...x,[key]:val} : x))
  }

  function addManual() {
    const n = manual.trim()
    if (!n || selected.find(x=>x.name===n)) return
    setSelected(s => [...s, {name:n, emoji:"🥗", qty:"1", unit:"pcs"}])
    setManual("")
  }

  function addToPantry() {
    const items = selected.map(s => ({
      id: Date.now().toString() + Math.random(),
      name: s.name, emoji: s.emoji, quantity: s.qty, unit: s.unit, category: "other"
    }))
    addPantryItems(items as any)
    router.push("/pantry")
  }

  return (
    <main style={{minHeight:"100vh",background:"#080810"}}>
      <Nav />
      <div style={{maxWidth:900,margin:"0 auto",padding:"32px 24px"}}>
        <div style={{marginBottom:20}}>
          <h1 style={{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:"-.5px",marginBottom:4}}>Scan & Detect</h1>
          <p style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>Add ingredients — AI generates personalized recipes</p>
        </div>

        <div style={{display:"flex",gap:4,padding:4,borderRadius:12,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",marginBottom:20,width:"fit-content"}}>
          <button onClick={()=>{setMode("camera");stopCamera()}} style={{padding:"8px 20px",borderRadius:9,background:mode==="camera"?"#FF6B35":"transparent",color:mode==="camera"?"#fff":"rgba(255,255,255,.4)",fontSize:11,fontWeight:700,border:"none",cursor:"pointer"}}>📤 Upload Photo</button>
          <button onClick={()=>{setMode("manual");stopCamera()}} style={{padding:"8px 20px",borderRadius:9,background:mode==="manual"?"#FF6B35":"transparent",color:mode==="manual"?"#fff":"rgba(255,255,255,.4)",fontSize:11,fontWeight:700,border:"none",cursor:"pointer"}}>✏️ Type Manually</button>
        </div>

        {mode==="camera" ? (
          <div style={{borderRadius:14,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",marginBottom:20,overflow:"hidden"}}>
            {scanning ? (
              <div style={{padding:"40px 20px",textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:10}}>🔍</div>
                <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:4}}>AI is scanning your image...</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>Identifying ingredients</div>
              </div>
            ) : (
              <div style={{padding:"32px 20px",textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:8}}>📤</div>
                <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:4}}>Upload a photo of your fridge</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:16}}>AI identifies every ingredient automatically</div>
                <label style={{display:"inline-block",padding:"10px 24px",borderRadius:10,background:"#FF6B35",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  Choose Photo
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={handleFileUpload}/>
                </label>
              </div>
            )}
          </div>
        ) : (
          <div style={{display:"flex",gap:8,marginBottom:20}}>
            <input value={manual} onChange={e=>setManual(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addManual()} placeholder="Type ingredient name and press Enter..." style={{flex:1,padding:"10px 14px",borderRadius:10,background:"#1A1A24",border:".5px solid rgba(255,255,255,.1)",color:"#fff",fontSize:12,outline:"none"}}/>
            <button onClick={addManual} style={{padding:"10px 18px",borderRadius:10,background:"#FF6B35",color:"#fff",fontSize:12,fontWeight:700,border:"none",cursor:"pointer"}}>Add</button>
          </div>
        )}

        {selected.length > 0 && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.25)",letterSpacing:".07em",textTransform:"uppercase",marginBottom:8}}>Selected ({selected.length})</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {selected.map(item => (
                <div key={item.name} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:12,background:"rgba(76,175,125,.07)",border:".5px solid rgba(76,175,125,.25)"}}>
                  <span style={{fontSize:20}}>{item.emoji}</span>
                  <span style={{fontSize:12,fontWeight:600,color:"#4CAF7D",flex:1}}>{item.name}</span>
                  <input value={item.qty} onChange={e=>updateItem(item.name,"qty",e.target.value)} style={{width:52,padding:"4px 8px",borderRadius:7,background:"#1A1A24",border:".5px solid rgba(255,255,255,.1)",color:"#fff",fontSize:11,outline:"none",textAlign:"center"}}/>
                  <select value={item.unit} onChange={e=>updateItem(item.name,"unit",e.target.value)} style={{padding:"4px 8px",borderRadius:7,background:"#1A1A24",border:".5px solid rgba(255,255,255,.1)",color:"#fff",fontSize:11,outline:"none"}}>
                    {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
                  </select>
                  <button onClick={()=>setSelected(s=>s.filter(x=>x.name!==item.name))} style={{background:"none",border:"none",color:"rgba(255,255,255,.3)",fontSize:16,cursor:"pointer"}}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{marginBottom:20}}>
          <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.25)",letterSpacing:".07em",textTransform:"uppercase",marginBottom:10}}>Quick Add</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8}}>
            {QUICK.map(q => {
              const sel = !!selected.find(x=>x.name===q.n)
              return (
                <div key={q.n} onClick={()=>toggle(q.n,q.e,q.u)} style={{padding:"10px 4px",borderRadius:12,background:sel?"rgba(76,175,125,.12)":"#1A1A24",border:sel?".5px solid rgba(76,175,125,.4)":".5px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer"}}>
                  <span style={{fontSize:22}}>{q.e}</span>
                  <span style={{fontSize:9,fontWeight:600,color:sel?"#4CAF7D":"rgba(255,255,255,.35)",textAlign:"center"}}>{q.n}</span>
                </div>
              )
            })}
          </div>
        </div>

        {selected.length > 0 && (
          <button onClick={addToPantry} style={{width:"100%",padding:14,borderRadius:14,background:"#FF6B35",color:"#fff",fontSize:13,fontWeight:700,border:"none",cursor:"pointer"}}>
            🧺 Add {selected.length} ingredients to Pantry →
          </button>
        )}
      </div>
    </main>
  )
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"100vh",background:"#080810",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"rgba(255,255,255,.3)",fontSize:12}}>Loading...</div></div>}>
      <ScanPageInner />
    </Suspense>
  )
}
