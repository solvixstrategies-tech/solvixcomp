"use client";
import { useState, useRef, useEffect } from "react";

interface Competitor { name: string; website: string; }
const PLAN_LIMITS: Record<string, number> = { basic: 3, premium: 5, "super-premium": 10 };
const PLAN_LABELS: Record<string, string> = { basic: "Basic plan: Up to 3 competitors", premium: "Premium plan: Up to 5 competitors", "super-premium": "Super Premium plan: Up to 10 competitors" };
const PROGRESS_STEPS = ["Scanning competitor websites...","Analyzing digital presence & positioning...","Running SWOT & scoring analysis...","Mapping opportunities & market gaps...","Generating strategic recommendations...","Building your premium report..."];

const sf = "'Space Grotesk',sans-serif";
const glass = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" };
const gradPurple = "linear-gradient(to right,#6c5ce7,#a78bfa)";
const gradTeal = "linear-gradient(to right,#00cec9,#81ecec)";
const gradPink = "linear-gradient(to right,#fd79a8,#f8a5c2)";
const inputStyle: React.CSSProperties = { width:"100%",padding:"14px 16px",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"#fff",fontSize:14,outline:"none" };
const badge: React.CSSProperties = { display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:999,fontSize:12,fontWeight:500,color:"#00cec9",marginBottom:20 };
const sectionPad: React.CSSProperties = { position:"relative",zIndex:1,padding:"96px 24px",maxWidth:1152,margin:"0 auto" };
const cardStyle: React.CSSProperties = { ...glass,borderRadius:16,padding:32,backdropFilter:"blur(12px)",transition:"transform .3s",cursor:"default" };
const btnPrimary: React.CSSProperties = { display:"inline-flex",alignItems:"center",gap:8,padding:"16px 32px",background:gradPurple,borderRadius:999,fontWeight:600,color:"#fff",textDecoration:"none",border:"none",cursor:"pointer",fontSize:15 };

export default function Home() {
  const [plan, setPlan] = useState("basic");
  const [competitors, setCompetitors] = useState<Competitor[]>([{ name: "", website: "" }]);
  const [clientName, setClientName] = useState("");
  const [clientWebsite, setClientWebsite] = useState("");
  const [clientIndustry, setClientIndustry] = useState("");
  const [clientAudience, setClientAudience] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [reportHTML, setReportHTML] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [error, setError] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const h = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === "Escape") setShowFullscreen(false); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, []);

  const showToast = (msg: string, type = "info") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const addCompetitor = () => { if (competitors.length >= PLAN_LIMITS[plan]) { showToast("Upgrade your plan to add more!", "error"); return; } setCompetitors([...competitors, { name: "", website: "" }]); showToast(`Competitor #${competitors.length + 1} added`, "success"); };
  const removeCompetitor = (i: number) => { setCompetitors(competitors.filter((_, idx) => idx !== i)); };
  const updateCompetitor = (i: number, field: "name" | "website", val: string) => { const c = [...competitors]; c[i] = { ...c[i], [field]: val }; setCompetitors(c); };

  const animateProgress = async () => {
    for (let i = 0; i < PROGRESS_STEPS.length; i++) {
      setCurrentStep(i); setProgress(Math.round(((i + 0.5) / PROGRESS_STEPS.length) * 100));
      await new Promise((r) => setTimeout(r, 800));
      setCompletedSteps((prev) => [...prev, i]); setProgress(Math.round(((i + 1) / PROGRESS_STEPS.length) * 100));
    }
  };

  const startAnalysis = async (e: React.FormEvent) => {
    e.preventDefault(); if (isAnalyzing) return;
    const validComps = competitors.filter((c) => c.name && c.website);
    if (!validComps.length) { showToast("Please add at least one competitor!", "error"); return; }
    setIsAnalyzing(true); setShowReport(false); setError(""); setCompletedSteps([]); setCurrentStep(-1); setProgress(0);
    showToast(`Analysis started for ${clientName}...`, "info");
    const progressPromise = animateProgress();
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: clientName, website: clientWebsite, industry: clientIndustry, audience: clientAudience, plan, competitors: validComps }) });
      const data = await res.json(); await progressPromise;
      if (!res.ok || !data.success) throw new Error(data.error || "Analysis failed");
      setReportHTML(data.html); setShowReport(true); showToast("Report generated successfully!", "success");
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    } catch (err: unknown) { await progressPromise; const msg = err instanceof Error ? err.message : "Something went wrong"; setError(msg); showToast(msg, "error"); } finally { setIsAnalyzing(false); }
  };

  const downloadReport = () => { if (!reportHTML) return; const blob = new Blob([reportHTML], { type: "text/html" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `SolvixComp-Report-${new Date().toISOString().slice(0, 10)}.html`; a.click(); URL.revokeObjectURL(url); showToast("Report downloaded!", "success"); };
  const newAnalysis = () => { setShowReport(false); setReportHTML(""); setCurrentStep(-1); setCompletedSteps([]); setProgress(0); setError(""); };

  const features = [
    ["\u{1F3AF}","SWOT Analysis","Automated Strengths, Weaknesses, Opportunities & Threats grids \u2014 color-coded and strategic."],
    ["\u{1F4CA}","Scoring Matrix","14-dimension scoring comparing Brand Clarity, SEO, UX, Content, Trust Signals, and more."],
    ["\u{1F5FA}\uFE0F","Opportunity Map","Prioritized quick wins, medium-term improvements, and high-impact strategic moves."],
    ["\u{1F50D}","Digital Presence Audit","Website quality, messaging clarity, CTA effectiveness, mobile readiness, SEO fundamentals."],
    ["\u{1F4B0}","Pricing Intelligence","Compare packages, pricing positioning, value communication, and guarantee strategies."],
    ["\u{1F4CB}","Strategic Recommendations","Actionable cards with expected business impact across branding, marketing, SEO, and more."]
  ];

  const steps = [
    ["1","\u{1F3E2}","Enter Your Business","Add your business name, website, industry, and target audience.","#6c5ce7"],
    ["2","\u{1F575}\uFE0F","Add Competitors","Enter competitor names and website URLs based on your plan.","#00cec9"],
    ["3","\u{1F9E0}","AI Analyzes Everything","Deep research across 14 dimensions \u2014 SWOT, scoring, positioning, and more.","#fd79a8"],
    ["4","\u{1F4C4}","Get Your Report","Receive a stunning, consultant-grade HTML report.","#f9ca24"]
  ];

  const pricing = [
    { tier:"Starter",name:"Basic",desc:"Quick competitive overview for small businesses.",price:"999",features:["Up to 3 Competitors","Executive Summary","SWOT Analysis","Basic Scoring Matrix","Opportunity Highlights"],included:[true,true,true,true,true],planKey:"basic",featured:false },
    { tier:"Professional",name:"Premium",desc:"Complete market intelligence for agencies.",price:"2,499",features:["Up to 5 Competitors","Everything in Basic","Pricing Intelligence","Content & Marketing","Digital Presence Audit","Gap & Positioning","Strategic Recs"],included:[true,true,true,true,true,true,true],planKey:"premium",featured:true },
    { tier:"Enterprise",name:"Super Premium",desc:"Full-spectrum intelligence for large agencies.",price:"4,999",features:["Up to 10 Competitors","Everything in Premium","Full 14-Section Report","Competitor Profiles","Complete Opportunity Map","Priority 24/7 Support","Quarterly Re-analysis"],included:[true,true,true,true,true,true,true],planKey:"super-premium",featured:false }
  ];

  const testimonials = [
    { text:"SolvixComp replaced a 2-week manual research process with a 5-minute AI analysis. The reports look like they came from a top consulting firm.",name:"Rahul Kapoor",role:"Founder, DigitalEdge Agency",init:"RK",color:"#6c5ce7" },
    { text:"The SWOT grids and scoring matrices are incredibly detailed. We use SolvixComp for every new client onboarding.",name:"Priya Sharma",role:"Strategy Lead, BrandCraft",init:"PS",color:"#00cec9" },
    { text:"We analyze 10 competitors per client with the Super Premium plan. The opportunity maps alone have helped us land 3x more retainer deals.",name:"Arjun Mehta",role:"CEO, GrowthPulse Digital",init:"AM",color:"#fd79a8" }
  ];

  return (
    <>
      {/* BG Effects */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse at 20% 50%,rgba(108,92,231,.15) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(0,206,201,.1) 0%,transparent 50%),radial-gradient(ellipse at 60% 80%,rgba(253,121,168,.08) 0%,transparent 50%)"}} />
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)",backgroundSize:"60px 60px"}} />

      {/* Toast */}
      {toast && <div style={{position:"fixed",top:96,right:24,zIndex:10000,padding:"16px 24px",borderRadius:12,fontSize:14,fontWeight:500,backdropFilter:"blur(20px)",maxWidth:350,background:toast.type==="success"?"rgba(16,185,129,.1)":toast.type==="error"?"rgba(239,68,68,.1)":"rgba(108,92,231,.1)",border:`1px solid ${toast.type==="success"?"rgba(16,185,129,.3)":toast.type==="error"?"rgba(239,68,68,.3)":"rgba(108,92,231,.3)"}`,color:toast.type==="success"?"#10b981":toast.type==="error"?"#ef4444":"#a78bfa"}}>{toast.msg}</div>}

      {/* Navbar */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,padding:"16px 40px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.1)",background:scrolled?"rgba(10,10,26,0.95)":"rgba(10,10,26,0.7)",backdropFilter:"blur(20px)",transition:"all .3s"}}>
        <a href="#" style={{fontSize:24,fontWeight:700,fontFamily:sf,textDecoration:"none"}}>
          <span style={{background:gradPurple,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Solvix</span>
          <span style={{background:gradTeal,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Comp</span>
        </a>
        <div style={{display:"flex",alignItems:"center",gap:32}}>
          {["Features","How It Works","Pricing","Results"].map((l,i)=>(
            <a key={l} href={`#${["features","how-it-works","pricing","testimonials"][i]}`} style={{fontSize:14,color:"rgba(255,255,255,0.7)",textDecoration:"none",transition:"color .2s"}}>{l}</a>
          ))}
          <a href="#analyze" style={{...btnPrimary,padding:"10px 24px",fontSize:14}}>Start Analysis</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center",padding:"112px 24px 64px"}}>
        <div style={badge}><span style={{width:8,height:8,borderRadius:"50%",background:"#10b981",boxShadow:"0 0 12px rgba(16,185,129,0.5)"}} /> AI-Powered Competitive Intelligence</div>
        <h1 style={{fontFamily:sf,fontSize:"clamp(36px,6vw,72px)",fontWeight:900,lineHeight:1.05,letterSpacing:"-0.02em",marginBottom:24}}>
          Know Your<br/>
          <span style={{background:gradPurple,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Competitors</span> Better<br/>
          Than They Know <span style={{background:gradTeal,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Themselves</span>
        </h1>
        <p style={{fontSize:17,color:"rgba(255,255,255,0.7)",maxWidth:640,marginBottom:40,lineHeight:1.7}}>
          Enter any website. Get a McKinsey-grade competitor analysis report in minutes &mdash; SWOT grids, scoring matrices, opportunity maps, and strategic recommendations, all powered by AI.
        </p>
        <div style={{display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center"}}>
          <a href="#analyze" style={{...btnPrimary,boxShadow:"0 8px 30px rgba(108,92,231,0.3)"}}>&#x26A1; Analyze Competitors</a>
          <a href="#how-it-works" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"16px 32px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:999,fontWeight:500,color:"rgba(255,255,255,0.7)",textDecoration:"none",backdropFilter:"blur(12px)",fontSize:15}}>&#x25B6; See How It Works</a>
        </div>
        <div style={{display:"flex",gap:48,marginTop:64,flexWrap:"wrap",justifyContent:"center"}}>
          {[["2,400+","Reports Generated"],["14","Analysis Dimensions"],["98%","Client Satisfaction"]].map(([n,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:800,fontFamily:sf,background:gradTeal,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{n}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={sectionPad}>
        <div style={badge}><span style={{width:6,height:6,borderRadius:"50%",background:"#00cec9"}} /> Why SolvixComp</div>
        <h2 style={{fontFamily:sf,fontSize:"clamp(28px,4vw,40px)",fontWeight:800,letterSpacing:"-0.02em",marginBottom:16}}>Everything You Need to<br/><span style={{background:gradPurple,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Outsmart the Competition</span></h2>
        <p style={{color:"rgba(255,255,255,0.7)",maxWidth:540,marginBottom:56}}>Our AI doesn&apos;t just scrape data &mdash; it thinks like a strategy consultant, analyzing positioning, identifying gaps, and recommending moves.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:24}}>
          {features.map(([icon,title,desc],i)=>(
            <div key={i} style={{...cardStyle,position:"relative",overflow:"hidden"}}>
              <div style={{fontSize:30,marginBottom:20}}>{icon}</div>
              <h3 style={{fontFamily:sf,fontSize:18,fontWeight:700,marginBottom:8}}>{title}</h3>
              <p style={{fontSize:14,color:"rgba(255,255,255,0.7)",lineHeight:1.7}}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{...sectionPad,textAlign:"center"}}>
        <div style={badge}><span style={{width:6,height:6,borderRadius:"50%",background:"#00cec9"}} /> Simple Process</div>
        <h2 style={{fontFamily:sf,fontSize:"clamp(28px,4vw,40px)",fontWeight:800,letterSpacing:"-0.02em",marginBottom:16}}>From URL to Strategy in <span style={{background:gradTeal,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>4 Easy Steps</span></h2>
        <p style={{color:"rgba(255,255,255,0.7)",maxWidth:540,margin:"0 auto 56px"}}>No technical knowledge needed. Just enter the details and let our AI do the heavy lifting.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:24}}>
          {steps.map(([num,icon,title,desc,color])=>(
            <div key={num} style={cardStyle}>
              <div style={{width:48,height:48,borderRadius:"50%",background:color as string,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18,fontFamily:sf,color:num==="4"?"#333":"#fff",margin:"0 auto 20px"}}>{num}</div>
              <div style={{fontSize:30,marginBottom:16}}>{icon}</div>
              <h3 style={{fontFamily:sf,fontSize:16,fontWeight:700,marginBottom:8}}>{title}</h3>
              <p style={{fontSize:14,color:"rgba(255,255,255,0.7)"}}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{...sectionPad,textAlign:"center"}}>
        <div style={badge}><span style={{width:6,height:6,borderRadius:"50%",background:"#00cec9"}} /> Flexible Plans</div>
        <h2 style={{fontFamily:sf,fontSize:"clamp(28px,4vw,40px)",fontWeight:800,letterSpacing:"-0.02em",marginBottom:16}}>Choose Your <span style={{background:gradPink,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Intelligence Level</span></h2>
        <p style={{color:"rgba(255,255,255,0.7)",maxWidth:540,margin:"0 auto 56px"}}>From quick competitive scans to deep market intelligence &mdash; pick the plan that fits.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:24,alignItems:"start",textAlign:"left"}}>
          {pricing.map((p)=>(
            <div key={p.name} style={{...cardStyle,borderRadius:24,padding:"32px 40px",position:"relative",border:p.featured?"1px solid rgba(108,92,231,0.4)":"1px solid rgba(255,255,255,0.1)",boxShadow:p.featured?"0 20px 60px rgba(108,92,231,0.1)":"none",transform:p.featured?"scale(1.02)":"none"}}>
              {p.featured && <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",padding:"4px 20px",background:gradPurple,borderRadius:999,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Most Popular</div>}
              <div style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:2,color:"#00cec9",marginBottom:8}}>{p.tier}</div>
              <div style={{fontSize:24,fontWeight:800,fontFamily:sf,marginBottom:8}}>{p.name}</div>
              <div style={{fontSize:14,color:"rgba(255,255,255,0.7)",marginBottom:28}}>{p.desc}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:32}}>
                <span style={{fontSize:20,color:"rgba(255,255,255,0.7)",fontWeight:600}}>&#x20B9;</span>
                <span style={{fontSize:"clamp(36px,4vw,48px)",fontWeight:900,fontFamily:sf}}>{p.price}</span>
                <span style={{fontSize:14,color:"rgba(255,255,255,0.45)"}}>/ report</span>
              </div>
              <ul style={{listStyle:"none",marginBottom:36,padding:0}}>
                {p.features.map((f,fi)=>(
                  <li key={f} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",fontSize:14,color:"rgba(255,255,255,0.7)",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <span style={{color:p.included[fi]?"#10b981":"rgba(255,255,255,0.2)"}}>{p.included[fi]?"\u2713":"\u2717"}</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#analyze" onClick={()=>setPlan(p.planKey)} style={{display:"block",width:"100%",padding:"14px 0",borderRadius:999,textAlign:"center",fontWeight:600,fontSize:14,textDecoration:"none",color:"#fff",background:p.featured?gradPurple:p.planKey==="super-premium"?gradPink:"transparent",border:p.featured||p.planKey==="super-premium"?"none":"1px solid rgba(255,255,255,0.1)",cursor:"pointer",transition:"all .3s"}}>{p.featured?"Start Analysis":"Get Started"}</a>
            </div>
          ))}
        </div>
      </section>

      {/* ANALYSIS TOOL */}
      <section id="analyze" style={{...sectionPad,padding:"80px 24px 96px"}}>
        <div style={{textAlign:"center"}}>
          <div style={badge}><span style={{width:6,height:6,borderRadius:"50%",background:"#00cec9"}} /> Analysis Engine</div>
          <h2 style={{fontFamily:sf,fontSize:"clamp(28px,4vw,40px)",fontWeight:800,letterSpacing:"-0.02em",marginBottom:16}}>Start Your <span style={{background:gradPurple,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Competitor Analysis</span></h2>
          <p style={{color:"rgba(255,255,255,0.7)",maxWidth:540,margin:"0 auto 48px"}}>Fill in the details below and our AI will generate a comprehensive, consultant-grade analysis report.</p>
        </div>
        <div style={{...glass,borderRadius:24,padding:"24px 48px 48px",backdropFilter:"blur(20px)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(to right,#6c5ce7,#00cec9,#fd79a8)"}} />
          {/* Plan tabs */}
          <div style={{display:"flex",gap:8,marginBottom:36,background:"rgba(0,0,0,0.2)",padding:6,borderRadius:999,width:"fit-content",flexWrap:"wrap"}}>
            {([["basic","Basic (3)"],["premium","Premium (5)"],["super-premium","Super Premium (10)"]] as const).map(([k,l])=>(
              <button key={k} onClick={()=>{setPlan(k);showToast(`Switched to ${l} plan`,"info")}} style={{padding:"10px 20px",borderRadius:999,fontSize:13,fontWeight:600,border:"none",cursor:"pointer",position:"relative",background:plan===k?gradPurple:"transparent",color:plan===k?"#fff":"rgba(255,255,255,0.6)",transition:"all .3s"}}>
                {l}
              </button>
            ))}
          </div>
          <form onSubmit={startAnalysis}>
            <h3 style={{fontFamily:sf,fontSize:16,fontWeight:700,marginBottom:20,display:"flex",alignItems:"center",gap:8}}><span style={{color:"#6c5ce7"}}>&diams;</span> Your Business Details</h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20,marginBottom:28}}>
              {([["Business Name *",clientName,setClientName,"text","e.g. Solvix Strategies"],["Website URL *",clientWebsite,setClientWebsite,"url","https://solvixstrategies.com"],["Industry / Niche *",clientIndustry,setClientIndustry,"text","e.g. Digital Marketing Agency"],["Target Audience *",clientAudience,setClientAudience,"text","e.g. SMBs, Startups"]] as const).map(([label,val,setter,type,ph])=>(
                <div key={label}>
                  <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{label}</label>
                  <input type={type} value={val} onChange={(e)=>(setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)} placeholder={ph} required style={inputStyle} />
                </div>
              ))}
            </div>
            <h3 style={{fontFamily:sf,fontSize:16,fontWeight:700,marginBottom:16,marginTop:32,display:"flex",alignItems:"center",gap:8}}><span style={{color:"#00cec9"}}>&diams;</span> Competitor Details</h3>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {competitors.map((c,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:12,alignItems:"end",padding:16,background:"rgba(0,0,0,0.15)",borderRadius:12,border:"1px solid rgba(255,255,255,0.04)"}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#a78bfa",fontFamily:sf,marginBottom:8}}>Competitor #{i+1}</div>
                    <input type="text" value={c.name} onChange={(e)=>updateCompetitor(i,"name",e.target.value)} placeholder="Competitor Name" required style={inputStyle} />
                  </div>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"transparent",marginBottom:8}}>.</div>
                    <input type="url" value={c.website} onChange={(e)=>updateCompetitor(i,"website",e.target.value)} placeholder="https://competitor-website.com" required style={inputStyle} />
                  </div>
                  {i>0 && <button type="button" onClick={()=>removeCompetitor(i)} style={{width:40,height:40,background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,color:"#ef4444",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>}
                </div>
              ))}
            </div>
            <button type="button" onClick={addCompetitor} disabled={competitors.length>=PLAN_LIMITS[plan]} style={{marginTop:12,display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:500,border:"1px dashed rgba(108,92,231,0.3)",background:"rgba(108,92,231,0.1)",color:"#a78bfa",cursor:competitors.length>=PLAN_LIMITS[plan]?"not-allowed":"pointer",opacity:competitors.length>=PLAN_LIMITS[plan]?0.4:1}}>
              {competitors.length>=PLAN_LIMITS[plan]?`\u{1F512} Limit reached (${PLAN_LIMITS[plan]})`:`+ Add Competitor (${competitors.length}/${PLAN_LIMITS[plan]})`}
            </button>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:8}}>\u{1F4CB} {PLAN_LABELS[plan]}</div>
            <button type="submit" disabled={isAnalyzing} style={{width:"100%",marginTop:32,padding:20,borderRadius:999,fontSize:17,fontWeight:700,color:"#fff",background:"linear-gradient(135deg,#6c5ce7,#a78bfa,#00cec9)",backgroundSize:"200% 200%",border:"none",cursor:isAnalyzing?"not-allowed":"pointer",opacity:isAnalyzing?0.5:1,display:"flex",alignItems:"center",justifyContent:"center",gap:12,transition:"all .3s"}}>
              {isAnalyzing && <span style={{width:20,height:20,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 1s linear infinite",display:"inline-block"}} />}
              {isAnalyzing?"Analyzing... (this may take 30-60 seconds)":"\u26A1 Generate Competitor Analysis Report"}
            </button>
          </form>

          {/* Progress */}
          {(isAnalyzing || completedSteps.length > 0) && !showReport && (
            <div style={{marginTop:32,padding:32,background:"rgba(0,0,0,0.3)",borderRadius:16,border:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
                <div style={{width:12,height:12,borderRadius:"50%",background:"#00cec9",boxShadow:"0 0 12px rgba(0,206,201,0.5)"}} />
                <div style={{fontFamily:sf,fontWeight:700}}>AI Analysis in Progress</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {PROGRESS_STEPS.map((step,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderRadius:8,background:currentStep===i?"rgba(108,92,231,0.1)":"transparent"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,background:completedSteps.includes(i)?"rgba(16,185,129,0.15)":currentStep===i?"rgba(108,92,231,0.15)":"transparent",border:completedSteps.includes(i)?"none":currentStep===i?"2px solid #6c5ce7":"2px solid rgba(255,255,255,0.1)",color:completedSteps.includes(i)?"#10b981":currentStep===i?"#a78bfa":"rgba(255,255,255,0.3)"}}>
                      {completedSteps.includes(i)?"\u2713":i+1}
                    </div>
                    <span style={{fontSize:14,color:currentStep===i?"#fff":"rgba(255,255,255,0.6)",fontWeight:currentStep===i?500:400}}>{step}</span>
                  </div>
                ))}
              </div>
              <div style={{marginTop:24,background:"rgba(255,255,255,0.05)",borderRadius:999,height:8,overflow:"hidden"}}>
                <div style={{height:"100%",background:"linear-gradient(to right,#6c5ce7,#00cec9)",borderRadius:999,transition:"width .5s",width:`${progress}%`}} />
              </div>
              <div style={{textAlign:"right",fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:8}}>{progress}%</div>
            </div>
          )}

          {/* Error */}
          {error && <div style={{marginTop:24,padding:16,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,color:"#ef4444",fontSize:14}}><strong>Error:</strong> {error}</div>}

          {/* Report */}
          {showReport && (
            <div ref={reportRef} style={{marginTop:32}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:16,background:"rgba(16,185,129,0.05)",border:"1px solid rgba(16,185,129,0.15)",borderRadius:"12px 12px 0 0",flexWrap:"wrap",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10,fontWeight:600,color:"#10b981"}}>\u2713 Report Generated Successfully</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <button onClick={newAnalysis} style={{padding:"8px 16px",borderRadius:999,fontSize:12,fontWeight:600,background:"rgba(108,92,231,0.15)",border:"1px solid rgba(108,92,231,0.3)",color:"#a78bfa",cursor:"pointer"}}>\u21BB New Analysis</button>
                  <button onClick={()=>setShowFullscreen(true)} style={{padding:"8px 16px",borderRadius:999,fontSize:12,fontWeight:600,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)",cursor:"pointer"}}>\u26F6 Fullscreen</button>
                  <button onClick={downloadReport} style={{padding:"8px 16px",borderRadius:999,fontSize:12,fontWeight:600,background:gradPurple,border:"none",color:"#fff",cursor:"pointer"}}>\u2B07 Download HTML</button>
                </div>
              </div>
              <div style={{border:"1px solid rgba(255,255,255,0.1)",borderTop:"none",borderRadius:"0 0 12px 12px",overflow:"hidden",background:"#fff"}}>
                <iframe srcDoc={reportHTML} style={{width:"100%",height:700,border:"none"}} title="Report" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{...sectionPad,textAlign:"center"}}>
        <div style={badge}><span style={{width:6,height:6,borderRadius:"50%",background:"#00cec9"}} /> Trusted by Agencies</div>
        <h2 style={{fontFamily:sf,fontSize:"clamp(28px,4vw,40px)",fontWeight:800,letterSpacing:"-0.02em",marginBottom:16}}>What Our <span style={{background:gradPurple,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Clients Say</span></h2>
        <p style={{color:"rgba(255,255,255,0.7)",maxWidth:540,margin:"0 auto 56px"}}>Agencies and businesses trust SolvixComp to power their competitive strategy.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:24,textAlign:"left"}}>
          {testimonials.map((t,i)=>(
            <div key={i} style={cardStyle}>
              <div style={{color:"#f9ca24",fontSize:14,marginBottom:16,letterSpacing:3}}>{"\u2605".repeat(5)}</div>
              <p style={{fontSize:14,color:"rgba(255,255,255,0.7)",lineHeight:1.7,marginBottom:20,fontStyle:"italic"}}>&quot;{t.text}&quot;</p>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:`${t.color}33`,color:t.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14}}>{t.init}</div>
                <div><div style={{fontWeight:600,fontSize:14}}>{t.name}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"80px 24px 96px"}}>
        <div style={{maxWidth:640,margin:"0 auto",padding:"56px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:24,backdropFilter:"blur(20px)"}}>
          <h2 style={{fontFamily:sf,fontSize:"clamp(28px,4vw,40px)",fontWeight:800,marginBottom:16}}>Ready to <span style={{background:gradPurple,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Dominate</span> Your Market?</h2>
          <p style={{color:"rgba(255,255,255,0.7)",fontSize:18,marginBottom:32}}>Join 500+ agencies using SolvixComp for data-driven competitive intelligence.</p>
          <a href="#analyze" style={{...btnPrimary,boxShadow:"0 8px 30px rgba(108,92,231,0.3)"}}>\u26A1 Start Free Analysis</a>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{position:"relative",zIndex:1,borderTop:"1px solid rgba(255,255,255,0.1)",padding:"64px 24px"}}>
        <div style={{maxWidth:1152,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:48}}>
          <div>
            <a href="#" style={{fontSize:24,fontWeight:700,fontFamily:sf,textDecoration:"none",display:"inline-block",marginBottom:16}}>
              <span style={{background:gradPurple,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Solvix</span>
              <span style={{background:gradTeal,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Comp</span>
            </a>
            <p style={{fontSize:14,color:"rgba(255,255,255,0.6)",lineHeight:1.7,maxWidth:280}}>AI-powered competitor analysis that delivers McKinsey-grade reports in minutes. Built by Solvix Strategies.</p>
          </div>
          {[{title:"Product",links:["Features","Pricing","Analyze","API Docs"]},{title:"Company",links:["About Us","Blog","Careers","Contact"]},{title:"Legal",links:["Privacy Policy","Terms of Service","Refund Policy"]}].map(col=>(
            <div key={col.title}>
              <h4 style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:"rgba(255,255,255,0.4)",fontFamily:sf,marginBottom:20}}>{col.title}</h4>
              {col.links.map(l=><a key={l} href="#" style={{display:"block",fontSize:14,color:"rgba(255,255,255,0.6)",padding:"6px 0",textDecoration:"none"}}>{l}</a>)}
            </div>
          ))}
        </div>
        <div style={{maxWidth:1152,margin:"40px auto 0",paddingTop:24,borderTop:"1px solid rgba(255,255,255,0.05)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16,fontSize:12,color:"rgba(255,255,255,0.4)"}}>
          <span>&copy; 2026 SolvixComp by Solvix Strategies. All rights reserved.</span>
        </div>
      </footer>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:9999,display:"flex",flexDirection:"column",padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",background:"rgba(255,255,255,0.05)",borderRadius:"12px 12px 0 0"}}>
            <div style={{fontFamily:sf,fontWeight:700}}>\u{1F4CA} Competitor Analysis Report</div>
            <button onClick={()=>setShowFullscreen(false)} style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"none",color:"#fff",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
          </div>
          <div style={{flex:1,background:"#fff",borderRadius:"0 0 12px 12px",overflow:"hidden"}}>
            <iframe srcDoc={reportHTML} style={{width:"100%",height:"100%",border:"none"}} title="Full Report" />
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes floatOrb { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -30px) scale(1.05); } 66% { transform: translate(-20px, 20px) scale(0.95); } }
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        input::placeholder { color: rgba(255,255,255,0.3); }
        input:focus { border-color: #6c5ce7 !important; box-shadow: 0 0 0 3px rgba(108,92,231,0.2); }
        a:hover { opacity: 0.9; }
        @media (max-width: 768px) {
          nav > div:last-child > a:not(:last-child) { display: none !important; }
        }
      `}</style>
    </>
  );
}
"use client";
import { useState, useRef, useEffect } from "react";

interface Competitor { name: string; website: string; }

const PLAN_LIMITS: Record<string, number> = { basic: 3, premium: 5, "super-premium": 10 };
const PLAN_LABELS: Record<string, string> = {
  basic: "Basic plan: Up to 3 competitors",
  premium: "Premium plan: Up to 5 competitors",
  "super-premium": "Super Premium plan: Up to 10 competitors",
};

const PROGRESS_STEPS = [
  "Scanning competitor websites...",
  "Analyzing digital presence & positioning...",
  "Running SWOT & scoring analysis...",
  "Mapping opportunities & market gaps...",
  "Generating strategic recommendations...",
  "Building your premium report...",
];

export default function Home() {
  const [plan, setPlan] = useState("basic");
  const [competitors, setCompetitors] = useState<Competitor[]>([{ name: "", website: "" }]);
  const [clientName, setClientName] = useState("");
  const [clientWebsite, setClientWebsite] = useState("");
  const [clientIndustry, setClientIndustry] = useState("");
  const [clientAudience, setClientAudience] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [reportHTML, setReportHTML] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [error, setError] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setShowFullscreen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const showToast = (msg: string, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addCompetitor = () => {
    if (competitors.length >= PLAN_LIMITS[plan]) {
      showToast("Upgrade your plan to add more!", "error");
      return;
    }
    setCompetitors([...competitors, { name: "", website: "" }]);
    showToast(`Competitor #${competitors.length + 1} added`, "success");
  };

  const removeCompetitor = (i: number) => {
    setCompetitors(competitors.filter((_, idx) => idx !== i));
  };

  const updateCompetitor = (i: number, field: "name" | "website", val: string) => {
    const c = [...competitors];
    c[i] = { ...c[i], [field]: val };
    setCompetitors(c);
  };

  const animateProgress = async () => {
    for (let i = 0; i < PROGRESS_STEPS.length; i++) {
      setCurrentStep(i);
      setProgress(Math.round(((i + 0.5) / PROGRESS_STEPS.length) * 100));
      await new Promise((r) => setTimeout(r, 800));
      setCompletedSteps((prev) => [...prev, i]);
      setProgress(Math.round(((i + 1) / PROGRESS_STEPS.length) * 100));
    }
  };

  const startAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnalyzing) return;

    const validComps = competitors.filter((c) => c.name && c.website);
    if (!validComps.length) {
      showToast("Please add at least one competitor!", "error");
      return;
    }

    setIsAnalyzing(true);
    setShowReport(false);
    setError("");
    setCompletedSteps([]);
    setCurrentStep(-1);
    setProgress(0);
    showToast(`Analysis started for ${clientName}...`, "info");

    const progressPromise = animateProgress();

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientName, website: clientWebsite,
          industry: clientIndustry, audience: clientAudience,
          plan, competitors: validComps,
        }),
      });

      const data = await res.json();
      await progressPromise;

      if (!res.ok || !data.success) throw new Error(data.error || "Analysis failed");

      setReportHTML(data.html);
      setShowReport(true);
      showToast("Report generated successfully!", "success");
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    } catch (err: unknown) {
      await progressPromise;
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = () => {
    if (!reportHTML) return;
    const blob = new Blob([reportHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SolvixComp-Report-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Report downloaded!", "success");
  };

  const newAnalysis = () => {
    setShowReport(false);
    setReportHTML("");
    setCurrentStep(-1);
    setCompletedSteps([]);
    setProgress(0);
    setError("");
    showToast("Ready for new analysis!", "info");
  };

  return (
    <>
      {/* Background effects */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{background:"radial-gradient(ellipse at 20% 50%,rgba(108,92,231,.15) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(0,206,201,.1) 0%,transparent 50%),radial-gradient(ellipse at 60% 80%,rgba(253,121,168,.08) 0%,transparent 50%)"}} />
      <div className="fixed inset-0 z-0 pointer-events-none" style={{backgroundImage:"linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)",backgroundSize:"60px 60px"}} />
      <div className="fixed rounded-full pointer-events-none z-0 animate-[floatOrb_20s_ease-in-out_infinite]" style={{width:400,height:400,background:"#6c5ce7",filter:"blur(80px)",opacity:.4,top:-100,left:-100}} />
      <div className="fixed rounded-full pointer-events-none z-0 animate-[floatOrb_20s_ease-in-out_infinite_7s]" style={{width:300,height:300,background:"#00cec9",filter:"blur(80px)",opacity:.4,top:"50%",right:-80}} />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-6 z-[10000] px-6 py-4 rounded-xl text-sm font-medium backdrop-blur-xl max-w-sm animate-[slideIn_.3s_ease] ${toast.type==="success"?"bg-green-500/10 border border-green-500/30 text-green-400":toast.type==="error"?"bg-red-500/10 border border-red-500/30 text-red-400":"bg-purple-500/10 border border-purple-500/30 text-purple-400"}`}>
          {toast.msg}
        </div>
      )}

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[1000] px-6 md:px-10 py-4 flex items-center justify-between border-b transition-all duration-300 ${scrolled?"bg-[#0a0a1a]/92":"bg-[#0a0a1a]/70"} backdrop-blur-xl`} style={{borderColor:"rgba(255,255,255,0.1)"}}>
        <a href="#" className="text-2xl font-bold" style={{fontFamily:"'Space Grotesk',sans-serif"}}>
          <span className="bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">Solvix</span>
          <span className="bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">Comp</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {["Features","How It Works","Pricing","Results"].map((l,i)=>(
            <a key={l} href={`#${["features","how-it-works","pricing","testimonials"][i]}`} className="text-sm text-white/70 hover:text-white transition-colors">{l}</a>
          ))}
          <a href="#analyze" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full text-sm font-semibold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all">Start Analysis</a>
        </div>
        <button className="md:hidden text-white text-2xl" onClick={() => setMobileNav(!mobileNav)}>&#9776;</button>
      </nav>
      {mobileNav && (
        <div className="fixed top-16 left-0 right-0 z-[999] bg-[#0a0a1a]/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-4 md:hidden">
          {["Features","How It Works","Pricing"].map((l,i)=>(
            <a key={l} href={`#${["features","how-it-works","pricing"][i]}`} className="text-white/70" onClick={()=>setMobileNav(false)}>{l}</a>
          ))}
          <a href="#analyze" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full text-sm font-semibold text-white text-center" onClick={()=>setMobileNav(false)}>Start Analysis</a>
        </div>
      )}

      {/* HERO */}
      <section className="relative z-[1] min-h-screen flex flex-col justify-center items-center text-center px-6 pt-28">
        <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/70 mb-8 backdrop-blur-lg">
          <span className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" />
          AI-Powered Competitive Intelligence
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6" style={{fontFamily:"'Space Grotesk',sans-serif"}}>
          Know Your<br />
          <span className="bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">Competitors</span> Better<br />
          Than They Know <span className="bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">Themselves</span>
        </h1>
        <p className="text-base md:text-lg text-white/70 max-w-2xl mb-10 leading-relaxed">
          Enter any website. Get a McKinsey-grade competitor analysis report in minutes â SWOT grids, scoring matrices, opportunity maps, and strategic recommendations, all powered by AI.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <a href="#analyze" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full font-semibold text-white flex items-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all">&#x26A1; Analyze Competitors</a>
          <a href="#how-it-works" className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all backdrop-blur-lg flex items-center gap-2">&#x25B6; See How It Works</a>
        </div>
        <div className="flex gap-8 md:gap-12 mt-16 flex-wrap justify-center">
          {[["2,400+","Reports Generated"],["14","Analysis Dimensions"],["98%","Client Satisfaction"]].map(([n,l])=>(
            <div key={l} className="text-center">
              <div className="text-2xl font-extrabold bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent" style={{fontFamily:"'Space Grotesk',sans-serif"}}>{n}</div>
              <div className="text-xs text-white/45 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-[1] py-24 md:py-28 px-6 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-teal-400 mb-5"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> Why SolvixComp</div>
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight" style={{fontFamily:"'Space Grotesk',sans-serif"}}>Everything You Need to<br /><span className="bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">Outsmart the Competition</span></h2>
        <p className="text-white/70 max-w-xl mb-14">Our AI doesn&apos;t just scrape data â it thinks like a strategy consultant, analyzing positioning, identifying gaps, and recommending moves.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[["ð¯","SWOT Analysis","Automated Strengths, Weaknesses, Opportunities & Threats grids â color-coded and strategic."],
            ["ð","Scoring Matrix","14-dimension scoring comparing Brand Clarity, SEO, UX, Content, Trust Signals, and more."],
            ["ðºï¸","Opportunity Map","Prioritized quick wins, medium-term improvements, and high-impact strategic moves."],
            ["ð","Digital Presence Audit","Website quality, messaging clarity, CTA effectiveness, mobile readiness, SEO fundamentals."],
            ["ð°","Pricing Intelligence","Compare packages, pricing positioning, value communication, and guarantee strategies."],
            ["ð","Strategic Recommendations","Actionable cards with expected business impact across branding, marketing, SEO, and more."]
          ].map(([icon,title,desc],i)=>(
            <div key={i} className="group bg-white/[0.04] border border-white/10 rounded-2xl p-8 backdrop-blur-lg hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/5 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-600 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-3xl mb-5">{icon}</div>
              <h3 className="text-lg font-bold mb-2" style={{fontFamily:"'Space Grotesk',sans-serif"}}>{title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative z-[1] py-24 md:py-28 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-teal-400 mb-5"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> Simple Process</div>
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight" style={{fontFamily:"'Space Grotesk',sans-serif"}}>From URL to Strategy in <span className="bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">4 Easy Steps</span></h2>
        <p className="text-white/70 max-w-xl mx-auto mb-14">No technical knowledge needed. Just enter the details and let our AI do the heavy lifting.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[["1","ð¢","Enter Your Business","Add your business name, website, industry, and target audience.","from-purple-600 to-purple-400"],
            ["2","ðµï¸","Add Competitors","Enter competitor names and website URLs based on your plan.","from-teal-500 to-teal-300"],
            ["3","ð§ ","AI Analyzes Everything","Deep research across 14 dimensions â SWOT, scoring, positioning, and more.","from-pink-500 to-pink-300"],
            ["4","ð","Get Your Report","Receive a stunning, consultant-grade HTML report.","from-yellow-400 to-yellow-200"]
          ].map(([num,icon,title,desc,grad])=>(
            <div key={num} className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 backdrop-blur-lg hover:-translate-y-1 transition-all">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${grad} flex items-center justify-center font-extrabold text-lg mx-auto mb-5`} style={{fontFamily:"'Space Grotesk',sans-serif",color:num==="4"?"#333":"#fff"}}>{num}</div>
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="text-base font-bold mb-2" style={{fontFamily:"'Space Grotesk',sans-serif"}}>{title}</h3>
              <p className="text-sm text-white/70">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative z-[1] py-24 md:py-28 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-teal-400 mb-5"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> Flexible Plans</div>
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight" style={{fontFamily:"'Space Grotesk',sans-serif"}}>Choose Your <span className="bg-gradient-to-r from-pink-500 to-pink-300 bg-clip-text text-transparent">Intelligence Level</span></h2>
        <p className="text-white/70 max-w-xl mx-auto mb-14">From quick competitive scans to deep market intelligence â pick the plan that fits.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start text-left">
          {[
            {tier:"Starter",name:"Basic",desc:"Quick competitive overview for small businesses.",price:"999",features:[["Up to 3 Competitors",true,true],["Executive Summary",true,false],["SWOT Analysis",true,false],["Basic Scoring Matrix",true,false],["Opportunity Highlights",true,false],["Pricing Intelligence",false,false],["Content & Marketing",false,false],["Priority Support",false,false]],btnClass:"border border-white/10 text-white hover:bg-white/5",planKey:"basic"},
            {tier:"Professional",name:"Premium",desc:"Complete market intelligence for agencies.",price:"2,499",featured:true,features:[["Up to 5 Competitors",true,true],["Everything in Basic",true,false],["Pricing Intelligence",true,false],["Content & Marketing",true,false],["Digital Presence Audit",true,false],["Gap & Positioning",true,false],["Strategic Recs",true,false],["Account Manager",false,false]],btnClass:"bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-lg shadow-purple-500/30",planKey:"premium"},
            {tier:"Enterprise",name:"Super Premium",desc:"Full-spectrum intelligence for large agencies.",price:"4,999",features:[["Up to 10 Competitors",true,true],["Everything in Premium",true,false],["Full 14-Section Report",true,false],["Competitor Profiles",true,false],["Complete Opportunity Map",true,false],["Account Manager",true,false],["Priority 24/7 Support",true,false],["Quarterly Re-analysis",true,false]],btnClass:"bg-gradient-to-r from-pink-500 to-pink-300 text-white shadow-lg shadow-pink-500/30",planKey:"super-premium"}
          ].map((p)=>(
            <div key={p.name} className={`bg-white/[0.04] border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-lg transition-all relative ${p.featured?"border-purple-500/40 shadow-xl shadow-purple-500/10 md:scale-[1.03]":"hover:-translate-y-1"}`}>
              {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>}
              <div className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-2">{p.tier}</div>
              <div className="text-2xl font-extrabold mb-2" style={{fontFamily:"'Space Grotesk',sans-serif"}}>{p.name}</div>
              <div className="text-sm text-white/70 mb-7">{p.desc}</div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-xl text-white/70 font-semibold">â¹</span>
                <span className="text-4xl md:text-5xl font-black" style={{fontFamily:"'Space Grotesk',sans-serif"}}>{p.price}</span>
                <span className="text-sm text-white/45">/ report</span>
              </div>
              <ul className="mb-9 space-y-0">
                {p.features.map(([f,has,hl])=>(
                  <li key={f as string} className="flex items-center gap-3 py-2.5 text-sm text-white/70 border-b border-white/[0.04] last:border-0">
                    <span className={has?"text-green-400":"text-white/20"}>{has?"â":"â"}</span>
                    <span className={hl?"text-white font-medium":""}>{f as string}</span>
                  </li>
                ))}
              </ul>
              <a href="#analyze" onClick={()=>setPlan(p.planKey)} className={`block w-full py-3.5 rounded-full text-center font-semibold text-sm transition-all hover:-translate-y-0.5 ${p.btnClass}`}>{p.featured?"Start Analysis":"Get Started"}</a>
            </div>
          ))}
        </div>
      </section>

      {/* ANALYSIS TOOL */}
      <section id="analyze" className="relative z-[1] py-20 md:py-28 px-6 max-w-6xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-teal-400 mb-5"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> Analysis Engine</div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight" style={{fontFamily:"'Space Grotesk',sans-serif"}}>Start Your <span className="bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">Competitor Analysis</span></h2>
          <p className="text-white/70 max-w-xl mx-auto mb-12">Fill in the details below and our AI will generate a comprehensive, consultant-grade analysis report.</p>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 md:p-12 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-600 via-teal-400 to-pink-500" />

          {/* Plan tabs */}
          <div className="flex gap-2 mb-9 bg-black/20 p-1.5 rounded-full w-fit flex-wrap">
            {([["basic","Basic (3)"],["premium","Premium (5)"],["super-premium","Super Premium (10)"]] as const).map(([k,l])=>(
              <button key={k} onClick={()=>{setPlan(k);showToast(`Switched to ${l} plan`,"info")}} className={`px-4 md:px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all relative ${plan===k?"bg-gradient-to-r from-purple-600 to-purple-400 text-white":"text-white/60 hover:text-white"}`}>
                {l}
                {k==="premium" && <span className="absolute -top-2 -right-1 text-[9px] px-1.5 py-0.5 bg-pink-500 rounded-full text-white font-bold">Hot</span>}
              </button>
            ))}
          </div>

          <form onSubmit={startAnalysis}>
            <h3 className="text-base font-bold mb-5 flex items-center gap-2" style={{fontFamily:"'Space Grotesk',sans-serif"}}>
              <span className="text-purple-500">â</span> Your Business Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
              {[
                ["Business Name *",clientName,setClientName,"text","e.g. Solvix Strategies"],
                ["Website URL *",clientWebsite,setClientWebsite,"url","https://solvixstrategies.com"],
                ["Industry / Niche *",clientIndustry,setClientIndustry,"text","e.g. Digital Marketing Agency"],
                ["Target Audience *",clientAudience,setClientAudience,"text","e.g. SMBs, Startups, E-commerce"]
              ].map(([label,val,setter,type,ph])=>(
                <div key={label as string}>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">{label as string}</label>
                  <input type={type as string} value={val as string} onChange={(e)=>(setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)} placeholder={ph as string} required className="w-full px-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm" />
                </div>
              ))}
            </div>

            <h3 className="text-base font-bold mb-4 mt-8 flex items-center gap-2" style={{fontFamily:"'Space Grotesk',sans-serif"}}>
              <span className="text-teal-400">â</span> Competitor Details
            </h3>
            <div className="space-y-3">
              {competitors.map((c,i)=>(
                <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end p-4 bg-black/15 rounded-xl border border-white/[0.04]">
                  <div>
                    <div className="text-xs font-bold text-purple-400 mb-2" style={{fontFamily:"'Space Grotesk',sans-serif"}}>Competitor #{i+1}</div>
                    <input type="text" value={c.name} onChange={(e)=>updateCompetitor(i,"name",e.target.value)} placeholder="Competitor Name" required className="w-full px-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-transparent mb-2 hidden md:block">.</div>
                    <input type="url" value={c.website} onChange={(e)=>updateCompetitor(i,"website",e.target.value)} placeholder="https://competitor-website.com" required className="w-full px-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm" />
                  </div>
                  {i>0 && <button type="button" onClick={()=>removeCompetitor(i)} className="w-10 h-10 bg-red-500/15 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center text-lg">&times;</button>}
                </div>
              ))}
            </div>
            <button type="button" onClick={addCompetitor} disabled={competitors.length>=PLAN_LIMITS[plan]}
              className={`mt-3 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${competitors.length>=PLAN_LIMITS[plan]?"opacity-40 cursor-not-allowed bg-white/5 text-white/40":"bg-purple-500/10 border border-dashed border-purple-500/30 text-purple-400 hover:bg-purple-500/20"}`}>
              {competitors.length>=PLAN_LIMITS[plan]?`ð Limit reached (${PLAN_LIMITS[plan]})`:`+ Add Competitor (${competitors.length}/${PLAN_LIMITS[plan]})`}
            </button>
            <div className="text-xs text-white/40 mt-2 flex items-center gap-1.5">ð {PLAN_LABELS[plan]}</div>

            <button type="submit" disabled={isAnalyzing}
              className="w-full mt-8 py-5 rounded-full text-base md:text-lg font-bold text-white bg-gradient-to-r from-purple-600 via-purple-400 to-teal-400 bg-[length:200%_200%] animate-[gradientShift_4s_ease_infinite] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-3">
              {isAnalyzing && <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isAnalyzing?"Analyzing... (this may take 30-60 seconds)":"â¡ Generate Competitor Analysis Report"}
            </button>
          </form>

          {/* Progress */}
          {(isAnalyzing || completedSteps.length > 0) && !showReport && (
            <div className="mt-8 p-6 md:p-8 bg-black/30 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-teal-400 shadow-lg shadow-teal-400/50 animate-pulse" />
                <div className="font-bold" style={{fontFamily:"'Space Grotesk',sans-serif"}}>AI Analysis in Progress</div>
              </div>
              <div className="space-y-3">
                {PROGRESS_STEPS.map((step,i)=>(
                  <div key={i} className={`flex items-center gap-3.5 px-4 py-3 rounded-lg transition-all ${currentStep===i?"bg-purple-500/10":""}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${completedSteps.includes(i)?"bg-green-400/15 text-green-400":currentStep===i?"border-2 border-purple-500 bg-purple-500/15 text-purple-400 animate-spin":"border-2 border-white/10 text-white/30"}`}>
                      {completedSteps.includes(i)?"â":currentStep===i?"â»":i+1}
                    </div>
                    <span className={`text-sm ${currentStep===i?"text-white font-medium":"text-white/60"}`}>{step}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-white/5 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-teal-400 rounded-full transition-all duration-500" style={{width:`${progress}%`}} />
              </div>
              <div className="text-right text-xs text-white/40 mt-2">{progress}%</div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Report Display */}
          {showReport && (
            <div ref={reportRef} className="mt-8">
              <div className="flex items-center justify-between p-4 bg-green-400/5 border border-green-400/15 rounded-t-xl flex-wrap gap-3">
                <div className="flex items-center gap-2.5 font-semibold text-green-400">â Report Generated Successfully</div>
                <div className="flex gap-2.5 flex-wrap">
                  <button onClick={newAnalysis} className="px-4 py-2 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:-translate-y-0.5 transition-all">â» New Analysis</button>
                  <button onClick={()=>setShowFullscreen(true)} className="px-4 py-2 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white/70 hover:-translate-y-0.5 transition-all">â¶ Fullscreen</button>
                  <button onClick={downloadReport} className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-600 to-purple-400 text-white hover:-translate-y-0.5 transition-all">â¬ Download HTML</button>
                </div>
              </div>
              <div className="border border-white/10 border-t-0 rounded-b-xl overflow-hidden bg-white">
                <iframe srcDoc={reportHTML} className="w-full border-none" style={{height:700}} title="Report" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="relative z-[1] py-24 md:py-28 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-teal-400 mb-5"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> Trusted by Agencies</div>
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight" style={{fontFamily:"'Space Grotesk',sans-serif"}}>What Our <span className="bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">Clients Say</span></h2>
        <p className="text-white/70 max-w-xl mx-auto mb-14">Agencies and businesses trust SolvixComp to power their competitive strategy.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            {text:"SolvixComp replaced a 2-week manual research process with a 5-minute AI analysis. The reports look like they came from a top consulting firm.",name:"Rahul Kapoor",role:"Founder, DigitalEdge Agency",init:"RK",color:"purple"},
            {text:"The SWOT grids and scoring matrices are incredibly detailed. We use SolvixComp for every new client onboarding â it gives us strategic ammo that wins proposals.",name:"Priya Sharma",role:"Strategy Lead, BrandCraft",init:"PS",color:"teal"},
            {text:"We analyze 10 competitors per client with the Super Premium plan. The opportunity maps alone have helped us land 3x more retainer deals this quarter.",name:"Arjun Mehta",role:"CEO, GrowthPulse Digital",init:"AM",color:"pink"}
          ].map((t,i)=>(
            <div key={i} className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 backdrop-blur-lg hover:-translate-y-1 transition-all">
              <div className="text-yellow-400 text-sm mb-4 tracking-widest">{"â".repeat(5)}</div>
              <p className="text-sm text-white/70 leading-relaxed mb-5 italic">&quot;{t.text}&quot;</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${t.color==="purple"?"bg-purple-500/20 text-purple-400":t.color==="teal"?"bg-teal-500/20 text-teal-400":"bg-pink-500/20 text-pink-400"}`}>{t.init}</div>
                <div><div className="font-semibold text-sm">{t.name}</div><div className="text-xs text-white/40">{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="relative z-[1] text-center px-6 py-20 md:py-24">
        <div className="max-w-2xl mx-auto p-10 md:p-14 bg-white/[0.04] border border-white/10 rounded-3xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-[-2px] bg-gradient-to-r from-purple-600 via-teal-400 to-pink-500 rounded-[calc(1.5rem+2px)] -z-10 opacity-50 bg-[length:300%_300%] animate-[gradientShift_6s_ease_infinite]" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{fontFamily:"'Space Grotesk',sans-serif"}}>Ready to <span className="bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">Dominate</span> Your Market?</h2>
          <p className="text-white/70 text-lg mb-8">Join 500+ agencies using SolvixComp for data-driven competitive intelligence.</p>
          <a href="#analyze" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full font-semibold text-white shadow-lg shadow-purple-500/30">â¡ Start Free Analysis</a>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative z-[1] border-t border-white/10 px-6 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <a href="#" className="text-2xl font-bold inline-block mb-4" style={{fontFamily:"'Space Grotesk',sans-serif"}}>
              <span className="bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">Solvix</span>
              <span className="bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">Comp</span>
            </a>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">AI-powered competitor analysis that delivers McKinsey-grade reports in minutes. Built by Solvix Strategies.</p>
          </div>
          {[{title:"Product",links:["Features","Pricing","Analyze","API Docs"]},{title:"Company",links:["About Us","Blog","Careers","Contact"]},{title:"Legal",links:["Privacy Policy","Terms of Service","Refund Policy"]}].map(col=>(
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5" style={{fontFamily:"'Space Grotesk',sans-serif"}}>{col.title}</h4>
              {col.links.map(l=><a key={l} href="#" className="block text-sm text-white/60 py-1.5 hover:text-white hover:translate-x-1 transition-all">{l}</a>)}
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <span>&copy; 2026 SolvixComp by Solvix Strategies. All rights reserved.</span>
          <div className="flex gap-4">
            {["ð","in","ð"].map((s,i)=>(
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-purple-500 hover:border-purple-500 transition-all">{s}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex flex-col p-5">
          <div className="flex justify-between items-center px-5 py-3 bg-white/5 rounded-t-xl">
            <div className="font-bold" style={{fontFamily:"'Space Grotesk',sans-serif"}}>ð Competitor Analysis Report</div>
            <button onClick={()=>setShowFullscreen(false)} className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-red-500/30 transition-all text-lg">&times;</button>
          </div>
          <div className="flex-1 bg-white rounded-b-xl overflow-hidden">
            <iframe srcDoc={reportHTML} className="w-full h-full border-none" title="Full Report" />
          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style jsx global>{`
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes slideIn {
          from { transform: translateX(120%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
