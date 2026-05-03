'use client'
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("")
    const { error } = await supabase.auth.signUp({ email, password, options:{ data:{ full_name: name } } })
    if (error) { setError(error.message); setLoading(false) }
    else { setDone(true); setLoading(false) }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider:"google", options:{ redirectTo: window.location.origin+"/dashboard" } })
  }

  const inp = { width:"100%", padding:"11px 14px", borderRadius:10, background:"#0A0A0F", color:"#fff", border:".5px solid rgba(255,255,255,.1)", fontSize:12, outline:"none", boxSizing:"border-box" as const }

  return (
    <main style={{minHeight:"100vh",background:"#080810",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{width:"100%",maxWidth:380}}>

        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#FF6B35,#ff8c5a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,margin:"0 auto 12px"}}>🍳</div>
          <h1 style={{fontSize:20,fontWeight:900,color:"#fff",letterSpacing:"-.5px",marginBottom:4}}>Create account</h1>
          <p style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>Start cooking smarter today</p>
        </div>

        <div style={{padding:"28px 28px",borderRadius:18,background:"#1A1A24",border:".5px solid rgba(255,255,255,.08)"}}>

          {done ? (
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:36,marginBottom:12}}>✅</div>
              <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:6}}>Check your email!</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:16}}>We sent a confirmation link to {email}</div>
              <Link href="/auth/login" style={{fontSize:11,fontWeight:700,color:"#FF6B35",textDecoration:"none",padding:"8px 18px",borderRadius:9,background:"rgba(255,107,53,.12)",border:".5px solid rgba(255,107,53,.3)"}}>Back to Sign In</Link>
            </div>
          ) : (
            <>
              <button onClick={handleGoogle} style={{width:"100%",padding:"11px",borderRadius:10,background:"#0A0A0F",color:"#fff",border:".5px solid rgba(255,255,255,.1)",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:18}}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>

              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
                <div style={{flex:1,height:.5,background:"rgba(255,255,255,.08)"}}/>
                <span style={{fontSize:10,color:"rgba(255,255,255,.25)",fontWeight:600}}>OR</span>
                <div style={{flex:1,height:.5,background:"rgba(255,255,255,.08)"}}/>
              </div>

              {error && <div style={{padding:"10px 12px",borderRadius:9,background:"rgba(255,59,48,.1)",border:".5px solid rgba(255,59,48,.3)",color:"#FF3B30",fontSize:11,fontWeight:600,marginBottom:14}}>{error}</div>}

              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
                <input type="text" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} required style={inp}/>
                <input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required style={inp}/>
                <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} style={inp}/>
              </div>

              <button onClick={handleSignup as any} disabled={loading} style={{width:"100%",padding:"12px",borderRadius:10,background:"#FF6B35",color:"#fff",fontSize:13,fontWeight:700,border:"none",cursor:"pointer",opacity:loading?.7:1}}>
                {loading ? "Creating account..." : "Create Account →"}
              </button>

              <p style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,.3)",marginTop:16}}>
                Have an account?{" "}
                <Link href="/auth/login" style={{color:"#FF6B35",fontWeight:700,textDecoration:"none"}}>Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
