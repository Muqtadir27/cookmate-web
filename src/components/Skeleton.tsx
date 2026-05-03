'use client'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: number
  style?: React.CSSProperties
}

export function Skeleton({ width="100%", height=16, borderRadius=8, style={} }: SkeletonProps) {
  return (
    <div style={{
      width, height, borderRadius,
      background:"linear-gradient(90deg,#1A1A24 25%,#22222E 50%,#1A1A24 75%)",
      backgroundSize:"200% 100%",
      animation:"shimmer 1.5s infinite",
      ...style
    }}/>
  )
}

export function RecipeCardSkeleton() {
  return (
    <div style={{borderRadius:14,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",overflow:"hidden",padding:"12px 14px"}}>
      <div style={{height:90,background:"#12121A",borderRadius:10,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Skeleton width={48} height={48} borderRadius={24}/>
      </div>
      <Skeleton height={10} width="60%" borderRadius={6} style={{marginBottom:8}}/>
      <Skeleton height={13} width="85%" borderRadius={6} style={{marginBottom:6}}/>
      <Skeleton height={10} width="40%" borderRadius={6} style={{marginBottom:10}}/>
      <div style={{display:"flex",gap:8}}>
        <Skeleton height={8} width="30%" borderRadius={5}/>
        <Skeleton height={8} width="25%" borderRadius={5}/>
        <Skeleton height={8} width="20%" borderRadius={5}/>
      </div>
      <div style={{display:"flex",gap:6,marginTop:12}}>
        <Skeleton height={32} width="66%" borderRadius={9}/>
        <Skeleton height={32} width="34%" borderRadius={9}/>
      </div>
    </div>
  )
}

export function PantryItemSkeleton() {
  return (
    <div style={{borderRadius:12,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",padding:"12px 14px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <Skeleton width={32} height={32} borderRadius={8}/>
        <div style={{flex:1}}>
          <Skeleton height={12} width="60%" borderRadius={6} style={{marginBottom:6}}/>
          <Skeleton height={9} width="40%" borderRadius={5}/>
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div style={{maxWidth:960,margin:"0 auto",padding:"32px 24px"}}>
      <Skeleton height={28} width="40%" borderRadius={8} style={{marginBottom:8}}/>
      <Skeleton height={12} width="25%" borderRadius={6} style={{marginBottom:28}}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:28}}>
        {[...Array(5)].map((_,i)=>(
          <div key={i} style={{padding:"16px 14px",borderRadius:14,background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)"}}>
            <Skeleton width={32} height={32} borderRadius={8} style={{marginBottom:10}}/>
            <Skeleton height={11} width="80%" borderRadius={6} style={{marginBottom:5}}/>
            <Skeleton height={9} width="60%" borderRadius={5}/>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {[...Array(2)].map((_,i)=>(
          <div key={i} style={{padding:"18px 20px",background:"#1A1A24",border:".5px solid rgba(255,255,255,.07)",borderRadius:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
              <Skeleton height={13} width="35%" borderRadius={6}/>
              <Skeleton height={13} width="25%" borderRadius={6}/>
            </div>
            {[...Array(3)].map((_,j)=>(
              <div key={j} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:".5px solid rgba(255,255,255,.04)"}}>
                <Skeleton width={32} height={32} borderRadius={8}/>
                <div style={{flex:1}}>
                  <Skeleton height={11} width="70%" borderRadius={6} style={{marginBottom:5}}/>
                  <Skeleton height={9} width="50%" borderRadius={5}/>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
