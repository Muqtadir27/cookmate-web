'use client'
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

const links = [
  { href:"/dashboard", label:"Dashboard", emoji:"🏠" },
  { href:"/scan", label:"Scan", emoji:"📸" },
  { href:"/pantry", label:"Pantry", emoji:"🧺" },
  { href:"/recipes", label:"Recipes", emoji:"✨" },
  { href:"/cookbook", label:"Recipe Book", emoji:"📖" },
  { href:"/planner", label:"Planner", emoji:"📅" },
  { href:"/shopping", label:"Shopping", emoji:"🛒" },
]

export default function Nav({ email }: { email?: string }) {
  const path = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function logout() {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <>
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 18px",borderBottom:".5px solid rgba(255,255,255,.07)",background:"rgba(8,8,16,.95)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:24,height:24,borderRadius:6,background:"#FF6B35",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>🍳</div>
          <span style={{fontWeight:800,fontSize:13,color:"#fff"}}>CookMate AI</span>
        </div>

        <div className="nav-desktop" style={{display:"flex",gap:14}}>
          {links.map(l=>(
            <Link key={l.href} href={l.href} style={{fontSize:11,fontWeight:600,color:path===l.href?"#FF6B35":"rgba(255,255,255,.4)",textDecoration:"none",transition:"color .15s"}}>
              {l.label}
            </Link>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div className="nav-desktop" style={{display:"flex",alignItems:"center",gap:8}}>
            {email&&<span style={{fontSize:10,color:"rgba(255,255,255,.25)"}}>{email}</span>}
            <button onClick={logout} style={{padding:"5px 10px",borderRadius:7,background:"#1A1A24",color:"rgba(255,255,255,.4)",fontSize:10,fontWeight:600,border:".5px solid rgba(255,255,255,.08)",cursor:"pointer"}}>Sign out</button>
          </div>
          <button className="nav-hamburger" onClick={()=>setOpen(!open)} style={{display:"none",flexDirection:"column",gap:4,background:"none",border:"none",cursor:"pointer",padding:4}}>
            <div style={{width:20,height:2,background:"rgba(255,255,255,.6)",borderRadius:2,transition:"all .2s",transform:open?"rotate(45deg) translate(4px,4px)":"none"}}/>
            <div style={{width:20,height:2,background:"rgba(255,255,255,.6)",borderRadius:2,transition:"all .2s",opacity:open?0:1}}/>
            <div style={{width:20,height:2,background:"rgba(255,255,255,.6)",borderRadius:2,transition:"all .2s",transform:open?"rotate(-45deg) translate(4px,-4px)":"none"}}/>
          </button>
        </div>
      </nav>

      {open && (
        <div className="nav-mobile-menu" style={{position:"fixed",top:45,left:0,right:0,bottom:0,background:"rgba(8,8,16,.98)",backdropFilter:"blur(20px)",zIndex:49,padding:"20px 24px",display:"flex",flexDirection:"column",gap:4}}>
          {links.map(l=>(
            <Link key={l.href} href={l.href} onClick={()=>setOpen(false)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:12,background:path===l.href?"rgba(255,107,53,.1)":"transparent",border:path===l.href?".5px solid rgba(255,107,53,.3)":"none",color:path===l.href?"#FF6B35":"rgba(255,255,255,.6)",textDecoration:"none",fontSize:14,fontWeight:600}}>
              <span style={{fontSize:18}}>{l.emoji}</span>{l.label}
            </Link>
          ))}
          <div style={{marginTop:"auto",paddingTop:20,borderTop:".5px solid rgba(255,255,255,.07)"}}>
            {email&&<div style={{fontSize:11,color:"rgba(255,255,255,.25)",marginBottom:12}}>{email}</div>}
            <button onClick={logout} style={{width:"100%",padding:"12px",borderRadius:10,background:"rgba(255,59,48,.1)",color:"#FF3B30",fontSize:13,fontWeight:700,border:".5px solid rgba(255,59,48,.3)",cursor:"pointer"}}>Sign Out</button>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:768px){
          .nav-desktop{display:none!important}
          .nav-hamburger{display:flex!important}
        }
      `}</style>
    </>
  )
}
