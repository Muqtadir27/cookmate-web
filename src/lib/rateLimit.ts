const rateMap = new Map<string, {count:number, reset:number}>()

export function checkRateLimit(ip: string, limit = 10, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 }
  }
  entry.count++
  return { allowed: true, remaining: limit - entry.count }
}
