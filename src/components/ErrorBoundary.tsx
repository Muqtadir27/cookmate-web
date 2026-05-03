'use client'
import { Component, ReactNode } from "react"

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error) {
    console.error("CookMate Error:", error)
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{minHeight:"100vh",background:"#080810",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{textAlign:"center",maxWidth:400}}>
            <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
            <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:8}}>Something went wrong</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginBottom:24,lineHeight:1.6}}>
              {this.state.error?.message || "An unexpected error occurred"}
            </div>
            <button onClick={()=>this.setState({hasError:false})} style={{padding:"10px 24px",borderRadius:10,background:"#FF6B35",color:"#fff",fontSize:13,fontWeight:700,border:"none",cursor:"pointer",marginRight:10}}>
              Try Again
            </button>
            <button onClick={()=>window.location.href="/dashboard"} style={{padding:"10px 24px",borderRadius:10,background:"#1A1A24",color:"rgba(255,255,255,.5)",fontSize:13,fontWeight:700,border:".5px solid rgba(255,255,255,.1)",cursor:"pointer"}}>
              Go Home
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
