"use client"
import { useEffect, useRef } from "react"
import Link from "next/link"

export default function Landing() {
  const bgRef = useRef<HTMLCanvasElement>(null)
  const orbRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cvs = bgRef.current!
    const ctx = cvs.getContext("2d")!
    const resize = () => { cvs.width = cvs.offsetWidth; cvs.height = cvs.offsetHeight }
    resize()
    window.addEventListener("resize", resize)
    const pts = Array.from({length:55}, () => ({
      x:Math.random()*cvs.width, y:Math.random()*cvs.height,
      r:Math.random()*1.5+.3, vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25, a:Math.random()
    }))
    let r1: number
    const drawBg = () => {
      ctx.clearRect(0,0,cvs.width,cvs.height)
      const cx=cvs.width*.72, cy=cvs.height*.42
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,200)
      g.addColorStop(0,"rgba(255,107,53,.08)"); g.addColorStop(1,"rgba(255,107,53,0)")
      ctx.fillStyle=g; ctx.fillRect(0,0,cvs.width,cvs.height)
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy
        if(p.x<0)p.x=cvs.width; if(p.x>cvs.width)p.x=0
        if(p.y<0)p.y=cvs.height; if(p.y>cvs.height)p.y=0
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(255,255,255,${p.a*.25})`; ctx.fill()
      })
      r1=requestAnimationFrame(drawBg)
    }
    drawBg()

    const oc = orbRef.current!
    const o2 = oc.getContext("2d")!
    let t=0, mx=140, my=140, r2: number
    const mv = (e:MouseEvent) => { const r=oc.getBoundingClientRect(); mx=e.clientX-r.left; my=e.clientY-r.top }
    oc.addEventListener("mousemove",mv)
    const drawOrb = () => {
      o2.clearRect(0,0,280,280); t+=.012
      const cx=140+Math.sin(t*.7)*6+(mx-140)*.04
      const cy=140+Math.cos(t*.5)*5+(my-140)*.04
      for(let i=4;i>=0;i--){
        const r=55+i*14,a=.04-i*.006
        const g=o2.createRadialGradient(cx-15,cy-15,0,cx,cy,r)
        g.addColorStop(0,`rgba(255,120,60,${a*3})`); g.addColorStop(.5,`rgba(255,107,53,${a})`); g.addColorStop(1,"rgba(255,107,53,0)")
        o2.beginPath(); o2.arc(cx,cy,r,0,Math.PI*2); o2.fillStyle=g; o2.fill()
      }
      const gr=o2.createRadialGradient(cx-18,cy-18,0,cx,cy,52)
      gr.addColorStop(0,"rgba(255,180,120,.9)"); gr.addColorStop(.35,"rgba(255,107,53,.85)")
      gr.addColorStop(.7,"rgba(200,70,20,.7)"); gr.addColorStop(1,"rgba(140,40,10,.5)")
      o2.beginPath(); o2.arc(cx,cy,52,0,Math.PI*2); o2.fillStyle=gr; o2.fill()
      const sh=o2.createRadialGradient(cx-16,cy-16,0,cx-16,cy-16,28)
      sh.addColorStop(0,"rgba(255,230,200,.45)"); sh.addColorStop(1,"rgba(255,230,200,0)")
      o2.beginPath(); o2.arc(cx,cy,52,0,Math.PI*2); o2.fillStyle=sh; o2.fill()
      for(let i=0;i<6;i++){
        const a=t+i*Math.PI/3
        const r1b=58+Math.sin(t*2.1+i)*4, r2b=75+Math.sin(t*1.7+i*1.3)*7
        const ox=Math.cos(a)*r1b+cx, oy=Math.sin(a)*r1b+cy
        const ex=Math.cos(a)*r2b+cx, ey=Math.sin(a)*r2b+cy
        o2.beginPath(); o2.moveTo(ox,oy); o2.lineTo(ex,ey)
        o2.strokeStyle=`rgba(255,107,53,${.15+Math.sin(t+i)*.07})`; o2.lineWidth=1; o2.stroke()
        o2.beginPath(); o2.arc(ex,ey,2,0,Math.PI*2)
        o2.fillStyle=`rgba(255,140,80,${.5+Math.sin(t*1.5+i)*.3})`; o2.fill()
      }
      r2=requestAnimationFrame(drawOrb)
    }
    drawOrb()
    setTimeout(()=>{ ["badge","h1","sub","btns","stats","c1","c2","feats"].forEach(id=>{ const el=document.getElementById(id); if(el){el.style.opacity="1";el.style.transform="translateY(0) translateX(0)"} }) },100)
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); window.removeEventListener("resize",resize); oc.removeEventListener("mousemove",mv) }
  },[])

  const btnStyle = (primary=true) => ({padding:"12px 24px",borderRadius:12,background:primary?"#FF6B35":"rgba(255,255,255,.05)",color:primary?"#fff":"rgba(255,255,255,.6)",fontSize:13,fontWeight:700,textDecoration:"none",border:primary?"none":".5px solid rgba(255,255,255,.1)",transition:"transform .15s, box-shadow .15s",display:"inline-block"} as React.CSSProperties)

  return (
    <div style={{background:"#080810",minHeight:"100vh",position:"relative",overflow:"hidden",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
      <canvas ref={bgRef} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 40px",borderBottom:".5px solid rgba(255,255,255,.07)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#FF6B35,#ff8c5a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🍳</div>
            <span style={{fontWeight:700,fontSize:15,color:"#fff",letterSpacing:"-.3px"}}>CookMate AI</span>
            <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:"rgba(255,107,53,.15)",color:"#FF6B35",border:".5px solid rgba(255,107,53,.4)",fontWeight:600}}>BETA</span>
          </div>
          <div style={{display:"flex",gap:6}}>
            <Link href="/auth/login" style={{padding:"7px 16px",borderRadius:10,fontSize:12,fontWeight:600,color:"rgba(255,255,255,.5)",textDecoration:"none"}}>Sign in</Link>
            <Link href="/auth/signup" style={{padding:"7px 18px",borderRadius:10,fontSize:12,fontWeight:700,background:"#FF6B35",color:"#fff",textDecoration:"none"}}>Get Started Free</Link>
          </div>
        </nav>

        <div style={{display:"flex",flex:1,padding:"40px 40px 20px",alignItems:"center",gap:40,maxWidth:1100,margin:"0 auto",width:"100%"}}>
          <div style={{flex:1,minWidth:0}}>
            <div id="badge" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:20,background:"rgba(255,107,53,.1)",border:".5px solid rgba(255,107,53,.35)",marginBottom:18,opacity:0,transform:"translateY(10px)",transition:"all .6s ease"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#FF6B35",animation:"pulse 2s infinite"}}/>
              <span style={{fontSize:11,fontWeight:600,color:"#FF6B35"}}>AI-Powered Cooking Intelligence</span>
            </div>
            <h1 id="h1" style={{fontSize:52,fontWeight:900,color:"#fff",lineHeight:1.05,margin:"0 0 16px",letterSpacing:"-2px",opacity:0,transform:"translateY(16px)",transition:"all .7s ease .1s"}}>
              Scan ingredients.<br/>
              <span style={{background:"linear-gradient(135deg,#FF6B35,#ff9966)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Cook anything.</span>
            </h1>
            <p id="sub" style={{fontSize:15,color:"rgba(255,255,255,.5)",lineHeight:1.7,margin:"0 0 28px",maxWidth:380,opacity:0,transform:"translateY(12px)",transition:"all .7s ease .2s"}}>
              Point your camera at your fridge. Our AI identifies every ingredient and generates personalized recipes in seconds.
            </p>
            <div id="btns" style={{display:"flex",gap:12,opacity:0,transform:"translateY(10px)",transition:"all .7s ease .3s"}}>
              <Link href="/auth/signup" style={btnStyle(true)}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1.04)";(e.currentTarget as HTMLElement).style.boxShadow="0 8px 28px rgba(255,107,53,.4)"}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1)";(e.currentTarget as HTMLElement).style.boxShadow="none"}}>
                Start Cooking Free 🚀
              </Link>
              <Link href="/dashboard" style={btnStyle(false)}>View Demo</Link>
            </div>
            <div id="stats" style={{display:"flex",gap:24,marginTop:32,opacity:0,transition:"opacity .7s ease .5s"}}>
              {[["50K+","Recipes Generated"],["200+","Ingredients Detected"],["4.9⭐","User Rating"]].map(([n,l],i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:i>0?24:0}}>
                  {i>0&&<div style={{width:.5,height:32,background:"rgba(255,255,255,.08)",marginRight:0}}/>}
                  <div><div style={{fontSize:22,fontWeight:800,color:"#fff"}}>{n}</div><div style={{fontSize:10,color:"rgba(255,255,255,.35)",fontWeight:500,marginTop:1}}>{l}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div style={{width:280,flexShrink:0,position:"relative"}}>
            <canvas ref={orbRef} width={280} height={280} style={{display:"block"}}/>
            <div id="c1" style={{position:"absolute",top:10,left:-100,background:"rgba(255,255,255,.04)",backdropFilter:"blur(12px)",border:".5px solid rgba(255,255,255,.1)",borderRadius:12,padding:"10px 14px",minWidth:150,opacity:0,transform:"translateX(-10px)",transition:"all .7s ease .6s"}}>
              <div style={{fontSize:9,color:"rgba(255,255,255,.35)",fontWeight:600,marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>Detected</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {["🍅 Tomatoes","🥚 Eggs","🧅 Onion"].map(i=>(
                  <span key={i} style={{fontSize:10,padding:"2px 7px",borderRadius:8,background:"rgba(76,175,125,.15)",border:".5px solid rgba(76,175,125,.35)",color:"#4CAF7D",fontWeight:600}}>{i}</span>
                ))}
              </div>
            </div>
            <div id="c2" style={{position:"absolute",bottom:30,right:-90,background:"rgba(255,255,255,.04)",backdropFilter:"blur(12px)",border:".5px solid rgba(255,255,255,.1)",borderRadius:12,padding:"10px 14px",minWidth:140,opacity:0,transform:"translateX(10px)",transition:"all .7s ease .8s"}}>
              <div style={{fontSize:9,color:"rgba(255,255,255,.35)",fontWeight:600,marginBottom:6,textTransform:"uppercase"}}>Top Match</div>
              <div style={{fontSize:18,marginBottom:3}}>🍗</div>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.85)"}}>Butter Chicken</div>
              <div style={{display:"flex",alignItems:"center",gap:5,marginTop:5}}>
                <div style={{flex:1,height:3,borderRadius:2,background:"rgba(255,255,255,.08)",overflow:"hidden"}}><div style={{width:"94%",height:"100%",background:"#FF6B35",borderRadius:2}}/></div>
                <span style={{fontSize:10,fontWeight:700,color:"#FF6B35"}}>94%</span>
              </div>
            </div>
          </div>
        </div>

        <div id="feats" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,padding:"0 40px 48px",maxWidth:1100,margin:"0 auto",width:"100%",opacity:0,transform:"translateY(16px)",transition:"all .7s ease .7s"}}>
          {[{icon:"📸",title:"AI Vision Scan",desc:"Identifies every ingredient from one photo instantly",accent:false},{icon:"📋",title:"Smart Recipes",desc:"6 personalized recipes ranked by match score",accent:true},{icon:"👨‍🍳",title:"Cook Mode",desc:"Step-by-step guidance with live AI answers",accent:false}].map((f,i)=>(
            <div key={i} style={{padding:20,background:"rgba(255,255,255,.03)",border:f.accent?".5px solid rgba(255,107,53,.2)":".5px solid rgba(255,255,255,.07)",borderRadius:14,transition:"transform .2s"}}
              onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-3px)")}
              onMouseLeave={e=>(e.currentTarget.style.transform="translateY(0)")}>
              <div style={{fontSize:24,marginBottom:10}}>{f.icon}</div>
              <div style={{fontSize:14,fontWeight:700,color:"rgba(255,255,255,.85)",marginBottom:5}}>{f.title}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.35)",lineHeight:1.6}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

        <div style={{padding:"0 40px 60px",maxWidth:1100,margin:"0 auto",width:"100%"}}>
          <div style={{textAlign:"center",marginBottom:36}}>
            <div style={{fontSize:11,fontWeight:700,color:"#FF6B35",letterSpacing:".1em",marginBottom:10}}>HOW IT WORKS</div>
            <h2 style={{fontSize:30,fontWeight:900,color:"#fff",letterSpacing:"-.5px",margin:0}}>From fridge to fork in 3 steps</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
            {[
              {n:"01",icon:"📸",title:"Scan Your Fridge",desc:"Take a photo of your ingredients. Our vision AI instantly identifies everything — vegetables, proteins, spices, condiments."},
              {n:"02",icon:"🤖",title:"AI Generates Recipes",desc:"Get 6-12 personalized recipes ranked by match score, filtered by your dietary preferences and cuisine taste."},
              {n:"03",icon:"👨‍🍳",title:"Cook With Guidance",desc:"Follow step-by-step instructions with timers. Ask the AI cooking questions in real time. Never get stuck."}
            ].map((s,i)=>(
              <div key={i} style={{padding:24,background:"rgba(255,255,255,.02)",border:".5px solid rgba(255,255,255,.07)",borderRadius:16,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:16,right:16,fontSize:40,fontWeight:900,color:"rgba(255,107,53,.06)"}}>{s.n}</div>
                <div style={{fontSize:28,marginBottom:12}}>{s.icon}</div>
                <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:8}}>{s.title}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.4)",lineHeight:1.7}}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{padding:"0 40px 60px",maxWidth:1100,margin:"0 auto",width:"100%"}}>
          <div style={{textAlign:"center",marginBottom:36}}>
            <div style={{fontSize:11,fontWeight:700,color:"#FF6B35",letterSpacing:".1em",marginBottom:10}}>FEATURES</div>
            <h2 style={{fontSize:30,fontWeight:900,color:"#fff",letterSpacing:"-.5px",margin:0}}>Everything a smart kitchen needs</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[
              {icon:"🌍",title:"Global Cuisine Discovery",desc:"Browse and cook dishes from 12+ world cuisines — Italian, Japanese, Indian, Mexican and more. AI generates authentic recipes on demand."},
              {icon:"🧺",title:"Smart Pantry Tracking",desc:"Track everything in your kitchen. Get alerts when items run low. Every recipe checks your pantry in real time."},
              {icon:"📅",title:"Weekly Meal Planner",desc:"Plan breakfast, lunch and dinner for the whole week. Drag recipes from your cookbook into any day slot."},
              {icon:"🛒",title:"Auto Shopping List",desc:"Missing ingredients across your saved recipes auto-populate a smart shopping list. Check items off and they go straight to pantry."},
              {icon:"❤️",title:"Personal Cookbook",desc:"Save any AI-generated or discovered recipe to your cookbook. It persists forever and syncs with your pantry status."},
              {icon:"📊",title:"Nutrition Tracking",desc:"Every recipe includes calories, protein, carbs and fat. See exactly what you're cooking before you start."}
            ].map((f,i)=>(
              <div key={i} style={{display:"flex",gap:16,padding:20,background:"rgba(255,255,255,.02)",border:".5px solid rgba(255,255,255,.07)",borderRadius:14}}
                onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(255,107,53,.25)")}
                onMouseLeave={e=>(e.currentTarget.style.borderColor="rgba(255,255,255,.07)")}>
                <div style={{fontSize:24,flexShrink:0}}>{f.icon}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.85)",marginBottom:5}}>{f.title}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.35)",lineHeight:1.7}}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{padding:"0 40px 80px",maxWidth:1100,margin:"0 auto",width:"100%"}}>
          <div style={{padding:"48px 40px",background:"linear-gradient(135deg,rgba(255,107,53,.12),rgba(255,107,53,.04))",border:".5px solid rgba(255,107,53,.25)",borderRadius:24,textAlign:"center"}}>
            <div style={{fontSize:32,fontWeight:900,color:"#fff",letterSpacing:"-.5px",marginBottom:12}}>Ready to cook smarter?</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,.4)",marginBottom:28}}>Join thousands of home cooks using AI to make the most of what they have</div>
            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
              <a href="/auth/signup" style={{padding:"13px 28px",borderRadius:12,background:"#FF6B35",color:"#fff",fontSize:14,fontWeight:700,textDecoration:"none"}}>Start Cooking Free</a>
              <a href="/auth/login" style={{padding:"13px 28px",borderRadius:12,background:"rgba(255,255,255,.05)",color:"rgba(255,255,255,.6)",fontSize:14,fontWeight:700,textDecoration:"none",border:".5px solid rgba(255,255,255,.1)"}}>Sign In</a>
            </div>
          </div>
        </div>

        <div style={{borderTop:".5px solid rgba(255,255,255,.07)",padding:"32px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:1100,margin:"0 auto",width:"100%"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:22,height:22,borderRadius:6,background:"#FF6B35",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>🍳</div>
            <span style={{fontWeight:700,fontSize:13,color:"rgba(255,255,255,.4)"}}>CookMate AI</span>
          </div>
          <div style={{display:"flex",gap:20}}>
            {[["Privacy","#"],["Terms","#"],["Contact","#"]].map(([l,h])=>(
              <a key={l} href={h} style={{fontSize:11,color:"rgba(255,255,255,.25)",textDecoration:"none"}}>{l}</a>
            ))}
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.2)"}}>© 2025 CookMate AI</div>
        </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}`}</style>
    </div>
  )
}
