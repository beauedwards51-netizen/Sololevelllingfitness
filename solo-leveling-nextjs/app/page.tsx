'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const RANKS = ["E","D","C","B","A","S","SS","SSS"]
const RANK_THRESHOLDS = [0,500,1500,3500,7000,12000,20000,35000]
const RANK_COLORS = { E:"#9ca3af",D:"#60a5fa",C:"#34d399",B:"#a78bfa",A:"#f59e0b",S:"#f97316",SS:"#ef4444",SSS:"#fbbf24" }
const STAT_ICONS = { STR:"⚔️",AGI:"💨",VIT:"❤️",INT:"🧠",END:"🛡️" }
const DIFFICULTY_COLORS = { EASY:"#34d399",MEDIUM:"#f59e0b",HARD:"#f97316",EPIC:"#a855f7" }

const DAILY_QUEST_POOL = [
  { id:"pushups", name:"Push-Up Barrage", desc:"Complete 50 push-ups", xp:120, stat:"STR" as const, statGain:2, icon:"💪", target:50, unit:"push-ups" },
  { id:"run", name:"Sprint Training", desc:"Run or walk 1 mile", xp:150, stat:"AGI" as const, statGain:2, icon:"🏃", target:1, unit:"miles" },
  { id:"situps", name:"Core Awakening", desc:"Complete 50 sit-ups", xp:100, stat:"VIT" as const, statGain:2, icon:"🔥", target:50, unit:"sit-ups" },
  { id:"plank", name:"Iron Will", desc:"Hold a plank for 2 min", xp:130, stat:"END" as const, statGain:2, icon:"🛡️", target:2, unit:"min" },
  { id:"squats", name:"Leg Day Protocol", desc:"Complete 60 squats", xp:120, stat:"STR" as const, statGain:2, icon:"🦵", target:60, unit:"squats" },
  { id:"water", name:"Hydration Quest", desc:"Drink 8 glasses of water", xp:80, stat:"VIT" as const, statGain:1, icon:"💧", target:8, unit:"glasses" },
  { id:"stretch", name:"Flexibility Training", desc:"Stretch for 15 minutes", xp:90, stat:"AGI" as const, statGain:1, icon:"🧘", target:15, unit:"minutes" },
  { id:"sleep", name:"Recovery Protocol", desc:"Sleep 7–8 hours", xp:110, stat:"VIT" as const, statGain:2, icon:"🌙", target:8, unit:"hours" },
]

const SIDE_QUEST_POOL = [
  { id:"sq1", name:"Shadow Monarch's Trial", desc:"Do 100 push-ups in one day", xp:300, stat:"STR" as const, statGain:5, icon:"👑", difficulty:"HARD" as const, target:100, unit:"push-ups" },
  { id:"sq2", name:"Speed Demon", desc:"Complete a 5K run", xp:400, stat:"AGI" as const, statGain:6, icon:"⚡", difficulty:"HARD" as const, target:5, unit:"km" },
  { id:"sq3", name:"Iron Body", desc:"Work out 5 days in a row", xp:500, stat:"END" as const, statGain:7, icon:"🔱", difficulty:"EPIC" as const, target:5, unit:"days" },
  { id:"sq4", name:"The Awakening", desc:"Meditate for 10 minutes", xp:150, stat:"INT" as const, statGain:3, icon:"🌀", difficulty:"EASY" as const, target:10, unit:"minutes" },
  { id:"sq5", name:"Dungeon Cleanse", desc:"Clean your living space", xp:120, stat:"INT" as const, statGain:2, icon:"🧹", difficulty:"EASY" as const, target:1, unit:"session" },
  { id:"sq6", name:"No Junk Food", desc:"Avoid junk food for 3 days", xp:250, stat:"VIT" as const, statGain:4, icon:"🥗", difficulty:"MEDIUM" as const, target:3, unit:"days" },
  { id:"sq7", name:"Night Raid", desc:"Do a workout after 8pm", xp:180, stat:"STR" as const, statGain:3, icon:"🌑", difficulty:"MEDIUM" as const, target:1, unit:"workout" },
  { id:"sq8", name:"Hunter's Discipline", desc:"Wake up before 7am 3 days", xp:350, stat:"END" as const, statGain:5, icon:"🌅", difficulty:"HARD" as const, target:3, unit:"days" },
]

const DEFAULT_GOALS = { calories:2500, protein:150, carbs:300, fat:80, water:8 }
const MACRO_META = {
  calories: { icon:"🔥", color:"#f97316", unit:"kcal" },
  protein: { icon:"💪", color:"#6366f1", unit:"g" },
  carbs: { icon:"🌾", color:"#f59e0b", unit:"g" },
  fat: { icon:"🥑", color:"#ec4899", unit:"g" },
  water: { icon:"💧", color:"#38bdf8", unit:"glasses" },
}

const QUICK_FOODS = [
  { name:"Chicken Breast (100g)", calories:165, protein:31, carbs:0, fat:4 },
  { name:"White Rice (1 cup)", calories:206, protein:4, carbs:45, fat:0 },
  { name:"Egg (1 large)", calories:78, protein:6, carbs:1, fat:5 },
  { name:"Banana", calories:105, protein:1, carbs:27, fat:0 },
  { name:"Protein Shake", calories:150, protein:25, carbs:8, fat:3 },
  { name:"Oats (1 cup)", calories:307, protein:11, carbs:55, fat:5 },
  { name:"Salmon (100g)", calories:208, protein:20, carbs:0, fat:13 },
  { name:"Greek Yogurt (1 cup)", calories:130, protein:17, carbs:9, fat:0 },
  { name:"Sweet Potato (1 med)", calories:103, protein:2, carbs:24, fat:0 },
  { name:"Broccoli (1 cup)", calories:55, protein:4, carbs:11, fat:1 },
  { name:"Almonds (1 oz)", calories:164, protein:6, carbs:6, fat:14 },
  { name:"Steak (100g)", calories:271, protein:26, carbs:0, fat:18 },
]

type StatType = 'STR' | 'AGI' | 'VIT' | 'INT' | 'END'

function getRank(xp: number) {
  for (let i = RANK_THRESHOLDS.length-1; i >= 0; i--)
    if (xp >= RANK_THRESHOLDS[i]) return RANKS[i]
  return "E"
}

function getXpProgress(xp: number) {
  const rank = getRank(xp)
  const idx = RANKS.indexOf(rank)
  if (idx === RANKS.length-1) return { current:xp, needed:xp, pct:100 }
  const current = xp - RANK_THRESHOLDS[idx]
  const needed = RANK_THRESHOLDS[idx+1] - RANK_THRESHOLDS[idx]
  return { current, needed, pct: Math.min(100,(current/needed)*100) }
}

function todayKey() { return new Date().toISOString().split("T")[0] }
function emptyNutrition() { return { calories:0, protein:0, carbs:0, fat:0, water:0, meals:[] as any[] } }

function initialState() {
  return {
    xp:0, stats:{STR:10,AGI:10,VIT:10,INT:10,END:10},
    completedDailies:{} as Record<string, string[]>, 
    completedSideQuests:[] as string[],
    questProgress:{} as Record<string, number>,
    streak:0, lastActiveDay:null as string | null, log:[] as any[],
    nutrition:{} as Record<string, any>, 
    goals:{ ...DEFAULT_GOALS },
  }
}

export default function Home() {
  const [s, setS] = useState(initialState())
  const [loaded, setLoaded] = useState(false)
  const [tab, setTab] = useState("daily")
  const [notif, setNotif] = useState<{msg:string, type:string} | null>(null)
  const [customInput, setCustomInput] = useState("")
  const [customXp, setCustomXp] = useState(100)
  const [addingCustom, setAddingCustom] = useState(false)
  const [progressModal, setProgressModal] = useState<any>(null)
  const [progressInput, setProgressInput] = useState("")
  const progressRef = useRef<HTMLInputElement>(null)
  const [nutTab, setNutTab] = useState("quick")
  const [foodName, setFoodName] = useState("")
  const [foodMacros, setFoodMacros] = useState({ calories:"", protein:"", carbs:"", fat:"" })
  const [goalDraft, setGoalDraft] = useState<any>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("slfit3")
      if (saved) setS(prev => ({ ...prev, ...JSON.parse(saved) }))
    } catch(_) {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    const { xp,stats,completedDailies,completedSideQuests,questProgress,streak,lastActiveDay,log,nutrition,goals } = s
    localStorage.setItem("slfit3", JSON.stringify({
      xp, stats, completedDailies, completedSideQuests, questProgress,
      streak, lastActiveDay, log:log.slice(-30), nutrition, goals,
    }))
  }, [s, loaded])

  const notify = useCallback((msg: string, type="success") => {
    setNotif({ msg, type })
    setTimeout(() => setNotif(null), 3200)
  }, [])

  const completeQuest = useCallback((quest: any, isDaily=true) => {
    const today = todayKey()
    if (isDaily && s.completedDailies[today]?.includes(quest.id)) return
    if (!isDaily && s.completedSideQuests.includes(quest.id)) return
    setS(prev => {
      const newStats = { ...prev.stats, [quest.stat]: (prev.stats[quest.stat as StatType]||0)+quest.statGain }
      const newXp = prev.xp + quest.xp
      const rankUp = getRank(prev.xp) !== getRank(newXp)
      const newDailies = { ...prev.completedDailies }
      if (isDaily) newDailies[today] = [...(newDailies[today]||[]), quest.id]
      const newSide = isDaily ? prev.completedSideQuests : [...prev.completedSideQuests, quest.id]
      const newProgress = { ...(prev.questProgress||{}) }
      delete newProgress[quest.id]

      let streak=prev.streak, lastActive=prev.lastActiveDay
      if (isDaily) {
        const yest = new Date(); yest.setDate(yest.getDate()-1)
        const yKey = yest.toISOString().split("T")[0]
        if (lastActive===yKey) streak++
        else if (lastActive!==today) streak=1
        lastActive=today
      }
      const entry = { time:new Date().toLocaleTimeString(), name:quest.name, xp:quest.xp, stat:quest.stat, gain:quest.statGain, rankUp, newRank:getRank(newXp) }
      setTimeout(()=>notify(rankUp?`🎉 RANK UP → ${getRank(newXp)}!`:`✅ +${quest.xp} XP`, rankUp?"rankup":"success"), 40)
      return { ...prev, xp:newXp, stats:newStats, completedDailies:newDailies, completedSideQuests:newSide, questProgress:newProgress, streak, lastActiveDay:lastActive, log:[entry,...prev.log] }
    })
  }, [s, notify])

  const openProgress = useCallback((quest: any, isDaily: boolean) => {
    const current = s.questProgress?.[quest.id] || 0
    setProgressModal({ quest, isDaily })
    setProgressInput(current > 0 ? String(current) : "")
    setTimeout(() => progressRef.current?.focus(), 80)
  }, [s.questProgress])

  const saveProgress = useCallback(() => {
    if (!progressModal) return
    const { quest, isDaily } = progressModal
    const val = Math.max(0, Number(progressInput) || 0)
    if (val >= quest.target) {
      completeQuest(quest, isDaily)
      setProgressModal(null)
      return
    }
    setS(prev => ({
      ...prev,
      questProgress: { ...(prev.questProgress||{}), [quest.id]: val },
    }))
    notify(`📝 Progress saved: ${val}/${quest.target} ${quest.unit}`)
    setProgressModal(null)
  }, [progressModal, progressInput, completeQuest, notify])

  const completeCustom = useCallback(() => {
    if (!customInput.trim()) return
    const xpAmt = Number(customXp)
    setS(prev => {
      const newXp = prev.xp + xpAmt
      const rankUp = getRank(prev.xp) !== getRank(newXp)
      const entry = { time:new Date().toLocaleTimeString(), name:customInput, xp:xpAmt, stat:"STR", gain:1, rankUp, newRank:getRank(newXp) }
      return { ...prev, xp:newXp, stats:{...prev.stats,STR:prev.stats.STR+1}, log:[entry,...prev.log] }
    })
    setTimeout(()=>notify(`✅ Custom Quest! +${customXp} XP`), 40)
    setCustomInput(""); setAddingCustom(false)
  }, [customInput, customXp, notify])

  const logFood = useCallback((food: any) => {
    const today = todayKey()
    setS(prev => {
      const tn = prev.nutrition[today] || emptyNutrition()
      const meal = { ...food, time:new Date().toLocaleTimeString(), id:Date.now() }
      return { ...prev, nutrition:{ ...prev.nutrition, [today]:{
        ...tn,
        calories:(tn.calories||0)+(food.calories||0),
        protein:(tn.protein||0)+(food.protein||0),
        carbs:(tn.carbs||0)+(food.carbs||0),
        fat:(tn.fat||0)+(food.fat||0),
        meals:[...(tn.meals||[]), meal],
      }}}
    })
    notify(`🍽️ Logged: ${food.name}`)
  }, [notify])

  const removeFood = useCallback((mealId: number) => {
    const today = todayKey()
    setS(prev => {
      const tn = prev.nutrition[today] || emptyNutrition()
      const m = (tn.meals||[]).find((x: any)=>x.id===mealId)
      if (!m) return prev
      return { ...prev, nutrition:{ ...prev.nutrition, [today]:{
        ...tn,
        calories:Math.max(0,(tn.calories||0)-(m.calories||0)),
        protein:Math.max(0,(tn.protein||0)-(m.protein||0)),
        carbs:Math.max(0,(tn.carbs||0)-(m.carbs||0)),
        fat:Math.max(0,(tn.fat||0)-(m.fat||0)),
        meals:(tn.meals||[]).filter((x: any)=>x.id!==mealId),
      }}}
    })
  }, [])

  const logWater = useCallback((n: number) => {
    const today = todayKey()
    setS(prev => {
      const tn = prev.nutrition[today] || emptyNutrition()
      const newWater = Math.min((tn.water||0)+n, 20)
      const hitGoal = newWater>=(prev.goals||DEFAULT_GOALS).water && (tn.water||0)<(prev.goals||DEFAULT_GOALS).water
      const updated = { ...tn, water:newWater }
      if (hitGoal) {
        setTimeout(()=>notify("💧 Hydration Goal! +50 XP"), 40)
        return { ...prev, xp:prev.xp+50, nutrition:{ ...prev.nutrition, [today]:updated } }
      }
      return { ...prev, nutrition:{ ...prev.nutrition, [today]:updated } }
    })
  }, [notify])

  const submitFood = useCallback(() => {
    if (!foodName.trim()) return
    logFood({ name:foodName, calories:Number(foodMacros.calories)||0, protein:Number(foodMacros.protein)||0, carbs:Number(foodMacros.carbs)||0, fat:Number(foodMacros.fat)||0 })
    setFoodName(""); setFoodMacros({calories:"",protein:"",carbs:"",fat:""})
  }, [foodName, foodMacros, logFood])

  const resetAll = useCallback(() => {
    if (!window.confirm("Reset ALL progress? This cannot be undone.")) return
    const fresh = initialState()
    setS(fresh)
    localStorage.setItem("slfit3", JSON.stringify(fresh))
  }, [])

  if (!loaded) return (
    <div style={{background:"#050510",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#6366f1",fontFamily:"serif",fontSize:24,letterSpacing:4}}>
      AWAKENING...
    </div>
  )

  const today = todayKey()
  const rank = getRank(s.xp)
  const rankClr = (RANK_COLORS as any)[rank]
  const xpProg = getXpProgress(s.xp)
  const todayDone = s.completedDailies[today] || []
  const goals = s.goals || DEFAULT_GOALS
  const tn = s.nutrition[today] || emptyNutrition()
  const qprog = s.questProgress || {}
  const seed = Number(today.replace(/-/g,"")) % 1000
  const dailyQuests = [...DAILY_QUEST_POOL].sort((a,b)=>(a.id.charCodeAt(0)+seed)%7-(b.id.charCodeAt(0)+seed)%7).slice(0,5)

  const QuestCard = ({ quest, isDaily, done, borderColor }: any) => {
    const progress = qprog[quest.id] || 0
    const pct = Math.min(100, quest.target ? (progress/quest.target)*100 : 0)
    const hasProgress = progress > 0 && !done

    return (
      <div style={{background:done?"#0a0a0a":"linear-gradient(135deg,#0d0d2b,#0a0a1a)",border:`1px solid ${done?"#1e1b4b":borderColor}`,borderRadius:12,padding:14,marginBottom:10,opacity:done?.55:1,boxShadow:done?"none":`0 4px 20px ${borderColor}22`,cursor:done?"default":"pointer"}} onClick={() => !done && openProgress(quest, isDaily)}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:28,minWidth:40,textAlign:"center"}}>{done?"✅":quest.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:"bold",color:done?"#4b5563":"#e2e8f0",marginBottom:2}}>{quest.name}</div>
            {!isDaily && <span style={{fontSize:9,color:(DIFFICULTY_COLORS as any)[quest.difficulty],background:(DIFFICULTY_COLORS as any)[quest.difficulty]+"22",padding:"1px 6px",borderRadius:20,letterSpacing:1,border:`1px solid ${(DIFFICULTY_COLORS as any)[quest.difficulty]}44`,marginBottom:4,display:"inline-block"}}>{quest.difficulty}</span>}
            <div style={{fontSize:11,color:"#6b7280",marginBottom:hasProgress?4:6}}>{quest.desc}</div>
            {hasProgress && (
              <div style={{marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#818cf8",marginBottom:3}}>
                  <span>{progress} / {quest.target} {quest.unit}</span>
                  <span>{Math.round(pct)}%</span>
                </div>
                <div style={{height:4,background:"#1e1b4b",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,#4f46e5,${rankClr})`,borderRadius:2,transition:"width .4s",boxShadow:`0 0 6px ${rankClr}88`}}/>
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:"#818cf8",background:"#1e1b4b",padding:"2px 8px",borderRadius:20}}>+{quest.xp} XP</span>
              <span style={{fontSize:11,color:"#34d399",background:"#052e16",padding:"2px 8px",borderRadius:20}}>{(STAT_ICONS as any)[quest.stat]} +{quest.statGain} {quest.stat}</span>
              {quest.target && !done && <span style={{fontSize:11,color:"#6366f1",background:"#1e1b4b",padding:"2px 8px",borderRadius:20}}>🎯 {quest.target} {quest.unit}</span>}
            </div>
          </div>
          <button disabled={done} onClick={e => { e.stopPropagation(); !done && completeQuest(quest, isDaily) }} style={{background:done?"#1e1b4b":isDaily?"linear-gradient(135deg,#4f46e5,#7c3aed)":`linear-gradient(135deg,${(DIFFICULTY_COLORS as any)[quest.difficulty]||"#4f46e5"}cc,${(DIFFICULTY_COLORS as any)[quest.difficulty]||"#7c3aed"})`,color:done?"#4b5563":isDaily?"#fff":"#000",padding:"8px 12px",borderRadius:8,fontSize:11,letterSpacing:1,fontWeight:"bold",boxShadow:done?"none":"0 4px 12px #6366f133",minWidth:54,border:"none",cursor:done?"not-allowed":"pointer"}}>{done?"DONE":"✓"}</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{fontFamily:"'Georgia',serif",background:"linear-gradient(135deg,#020208,#050515,#080520)",minHeight:"100vh",color:"#e2e8f0",maxWidth:480,margin:"0 auto",position:"relative",overflowX:"hidden"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        {[...Array(12)].map((_,i)=>(
          <div key={i} style={{position:"absolute",width:2,height:2,borderRadius:"50%",background:i%2===0?"#6366f1":"#818cf8",left:`${(i*37+10)%100}%`,top:`${(i*23+15)%100}%`,opacity:.4,boxShadow:"0 0 6px 2px #6366f1"}}/>
        ))}
      </div>

      {notif && (
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:notif.type==="rankup"?"linear-gradient(135deg,#7c3aed,#4f46e5)":"linear-gradient(135deg,#065f46,#047857)",color:"#fff",padding:"12px 24px",borderRadius:12,zIndex:9999,fontSize:14,fontWeight:"bold",letterSpacing:1,boxShadow:"0 8px 32px rgba(0,0,0,.5)",animation:"si .3s ease",border:"1px solid rgba(255,255,255,.2)",whiteSpace:"nowrap"}}>
          {notif.msg}
        </div>
      )}

      {progressModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:20}} onClick={()=>setProgressModal(null)}>
          <div style={{background:"linear-gradient(135deg,#0d0d2b,#080820)",border:"1px solid #2d2b6b",borderRadius:16,padding:24,width:"100%",maxWidth:360,animation:"mfade .2s ease"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <div style={{fontSize:32}}>{progressModal.quest.icon}</div>
              <div>
                <div style={{fontSize:15,fontWeight:"bold",color:"#e2e8f0"}}>{progressModal.quest.name}</div>
                <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{progressModal.quest.desc}</div>
              </div>
            </div>
            <div style={{fontSize:12,color:"#6366f1",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Log Progress ({progressModal.quest.unit})</div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <input ref={progressRef} type="number" value={progressInput} onChange={e=>setProgressInput(e.target.value)} placeholder={`0 – ${progressModal.quest.target}`} style={{flex:1,background:"#050510",border:"1px solid #4f46e5",borderRadius:10,padding:"12px 14px",color:"#e2e8f0",fontSize:20,fontFamily:"Georgia,serif",textAlign:"center"}}/>
              <div style={{fontSize:13,color:"#4b5563",minWidth:60}}>/ {progressModal.quest.target}</div>
            </div>
            <div style={{fontSize:11,color:"#4b5563",textAlign:"center",marginBottom:16}}>{progressModal.quest.unit} — reaching {progressModal.quest.target} marks quest complete</div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setProgressModal(null)} style={{flex:1,background:"#1e1b4b",color:"#94a3b8",padding:"11px",borderRadius:10,fontSize:13,border:"none",cursor:"pointer"}}>Cancel</button>
              <button onClick={saveProgress} style={{flex:2,background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"#fff",padding:"11px",borderRadius:10,fontSize:13,letterSpacing:1,fontWeight:"bold",border:"none",cursor:"pointer"}}>{Number(progressInput)>=progressModal.quest.target ? "✅ COMPLETE!" : "SAVE PROGRESS"}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{position:"relative",zIndex:1,padding:"24px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:11,letterSpacing:4,color:"#6366f1",textTransform:"uppercase",marginBottom:4}}>Hunter System</div>
            <div style={{fontSize:26,fontWeight:"bold",color:"#f8fafc",letterSpacing:1}}>Solo Leveling</div>
            <div style={{fontSize:11,color:"#94a3b8",letterSpacing:2}}>FITNESS PROTOCOL</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{width:64,height:64,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(circle,${rankClr}33,transparent)`,border:`3px solid ${rankClr}`,["--rc" as any]:rankClr,animation:"rp 2s ease-in-out infinite",fontSize:26,fontWeight:"bold",color:rankClr}}>{rank}</div>
            <div style={{fontSize:10,color:rankClr,letterSpacing:2,marginTop:4,textTransform:"uppercase"}}>Rank</div>
          </div>
        </div>

        <div style={{marginTop:20,background:"#0f0f2a",borderRadius:8,padding:14,border:"1px solid #1e1b4b"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:12}}>
            <span style={{color:"#94a3b8"}}>Total XP: <span style={{color:"#818cf8"}}>{s.xp.toLocaleString()}</span></span>
            <span style={{color:"#94a3b8"}}>Next: <span style={{color:"#818cf8"}}>{xpProg.needed.toLocaleString()}</span></span>
          </div>
          <div style={{height:8,background:"#1e1b4b",borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${xpProg.pct}%`,background:`linear-gradient(90deg,#4f46e5,${rankClr})`,borderRadius:4,transition:"width .6s",boxShadow:`0 0 8px ${rankClr}`}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11,color:"#6b7280"}}>
            <span>🔥 Streak: <span style={{color:"#f59e0b"}}>{s.streak} days</span></span>
            <span>📅 Daily: <span style={{color:"#34d399"}}>{todayDone.length}/{dailyQuests.length}</span></span>
          </div>
        </div>

        <div style={{display:"flex",gap:8,marginTop:12}}>
          {Object.entries(s.stats).map(([stat,val])=>(
            <div key={stat} style={{flex:1,background:"#0a0a1a",borderRadius:8,padding:"8px 4px",textAlign:"center",border:"1px solid #1e1b4b"}}>
              <div style={{fontSize:14}}>{(STAT_ICONS as any)[stat]}</div>
              <div style={{fontSize:11,color:"#6366f1",fontWeight:"bold",marginTop:2}}>{stat}</div>
              <div style={{fontSize:15,color:"#e2e8f0",fontWeight:"bold"}}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"flex",margin:"16px 20px 0",gap:6,position:"relative",zIndex:1}}>
        {[["daily","⚔️ Daily"],["side","🗡️ Side"],["nutrition","🍽️ Nutrition"],["log","📜 Log"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"9px 4px",borderRadius:8,fontSize:11,letterSpacing:.3,background:tab===id?"linear-gradient(135deg,#4f46e5,#6366f1)":"#0a0a1a",color:tab===id?"#fff":"#6b7280",border:tab===id?"1px solid #6366f1":"1px solid #1e1b4b",boxShadow:tab===id?"0 4px 12px #6366f144":"none",cursor:"pointer"}}>{label}</button>
        ))}
      </div>

      <div style={{padding:"16px 20px 100px",position:"relative",zIndex:1}}>
        {tab==="daily" && (
          <div>
            <div style={{fontSize:11,letterSpacing:3,color:"#6366f1",textTransform:"uppercase",marginBottom:4}}>Today's Quests</div>
            <div style={{fontSize:10,color:"#4b5563",marginBottom:12}}>Tap a quest to log progress • tap ✓ to mark complete</div>
            {dailyQuests.map(q => <QuestCard key={q.id} quest={q} isDaily={true} done={todayDone.includes(q.id)} borderColor="#2d2b6b"/>)}
          </div>
        )}

        {tab==="side" && (
          <div>
            <div style={{fontSize:11,letterSpacing:3,color:"#6366f1",textTransform:"uppercase",marginBottom:4}}>Special Missions</div>
            {SIDE_QUEST_POOL.map(q => <QuestCard key={q.id} quest={q} isDaily={false} done={s.completedSideQuests.includes(q.id)} borderColor={(DIFFICULTY_COLORS as any)[q.difficulty]+"44"}/>)}
          </div>
        )}
        
        {tab==="log" && (
          <div>
            <div style={{fontSize:11,letterSpacing:3,color:"#6366f1",textTransform:"uppercase",marginBottom:12}}>Activity Log</div>
            {s.log.length===0 ? (
              <div style={{textAlign:"center",color:"#4b5563",fontSize:14,marginTop:40,letterSpacing:2}}>
                <div style={{fontSize:40,marginBottom:12}}>🌑</div>
                No quests completed yet.<br/>Begin your awakening.
              </div>
            ) : (
              s.log.map((entry: any,i: number)=>(
                <div key={i} style={{background:"#0a0a1a",border:"1px solid #1e1b4b",borderRadius:10,padding:12,marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:20}}>{entry.rankUp?"⬆️":"✅"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:"#e2e8f0"}}>{entry.name}</div>
                    {entry.rankUp&&<div style={{fontSize:11,color:"#f59e0b",marginTop:2}}>🎉 RANK UP → {entry.newRank}</div>}
                    <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{entry.time}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,color:"#818cf8",fontWeight:"bold"}}>+{entry.xp}</div>
                    <div style={{fontSize:10,color:"#34d399"}}>+{entry.gain} {entry.stat}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"linear-gradient(0deg,#050510 80%,transparent)",padding:"12px 20px",textAlign:"center",zIndex:10}}>
        <div style={{fontSize:10,color:"#4b5563",letterSpacing:3,textTransform:"uppercase"}}>{rank==="SSS"?"👑 SHADOW MONARCH":`Next Rank: ${RANKS[RANKS.indexOf(rank)+1]||"MAX"}`} — {s.xp.toLocaleString()} XP Total</div>
      </div>
    </div>
  )
}
