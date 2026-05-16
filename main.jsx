import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

/* ═══ CONSTANTS ═══════════════════════════════════════════ */
const USD_PKR_FALLBACK = 278.5;
const FX_FALLBACK = { USD:1, EUR:1.08, GBP:1.27, CNY:0.138, AED:0.272, SGD:0.74, JPY:0.0067, INR:0.012, CAD:0.74, AUD:0.65 };

const PORT_COSTS = {
  terminalHandling: 18000,
  customsAgent:     12000,
  documentation:     4500,
  portSecurity:      2000,
  miscPort:          3000,
  localTransport:   14000,
  warehouseHandling: 5000,
  bankCharges:       3000,
};
const PORT_CHARGES_PKR = Object.values(PORT_COSTS).reduce((s,v)=>s+v,0);

const HS_DB = {
  "calcium propionate":      {code:"2915.70",cd:11,gst:17,acd:2,wht:5.5,label:"Calcium Propionate",cat:"Food Preservative"},
  "cmc":                     {code:"3912.31",cd:20,gst:17,acd:2,wht:5.5,label:"Carboxymethyl Cellulose",cat:"Food Additive"},
  "carboxymethyl cellulose": {code:"3912.31",cd:20,gst:17,acd:2,wht:5.5,label:"CMC",cat:"Food Additive"},
  "gms":                     {code:"2915.70",cd:11,gst:17,acd:2,wht:5.5,label:"Glycerol Monostearate",cat:"Emulsifier"},
  "glycerol monostearate":   {code:"2915.70",cd:11,gst:17,acd:2,wht:5.5,label:"GMS",cat:"Emulsifier"},
  "citric acid":             {code:"2918.14",cd:11,gst:17,acd:2,wht:5.5,label:"Citric Acid",cat:"Food Acid"},
  "sodium benzoate":         {code:"2916.31",cd:11,gst:17,acd:2,wht:5.5,label:"Sodium Benzoate",cat:"Preservative"},
  "potassium sorbate":       {code:"2916.19",cd:20,gst:17,acd:2,wht:5.5,label:"Potassium Sorbate",cat:"Preservative"},
  "ascorbic acid":           {code:"2936.27",cd:11,gst:0, acd:2,wht:5.5,label:"Ascorbic Acid",cat:"Pharma/Nutrition"},
  "vitamin c":               {code:"2936.27",cd:11,gst:0, acd:2,wht:5.5,label:"Ascorbic Acid (Vit C)",cat:"Pharma/Nutrition"},
  "sodium bicarbonate":      {code:"2836.30",cd:20,gst:17,acd:2,wht:5.5,label:"Sodium Bicarbonate",cat:"Food/Industrial"},
  "baking soda":             {code:"2836.30",cd:20,gst:17,acd:2,wht:5.5,label:"Sodium Bicarbonate",cat:"Food"},
  "xanthan gum":             {code:"3913.90",cd:20,gst:17,acd:2,wht:5.5,label:"Xanthan Gum",cat:"Hydrocolloid"},
  "maltodextrin":            {code:"1702.90",cd:20,gst:17,acd:2,wht:5.5,label:"Maltodextrin",cat:"Food"},
  "sorbitol":                {code:"2905.44",cd:11,gst:17,acd:2,wht:5.5,label:"Sorbitol",cat:"Sweetener"},
  "paracetamol":             {code:"2924.29",cd:0, gst:0, acd:0,wht:5.5,label:"Paracetamol API",cat:"Pharma API"},
  "acetaminophen":           {code:"2924.29",cd:0, gst:0, acd:0,wht:5.5,label:"Paracetamol API",cat:"Pharma API"},
  "ibuprofen":               {code:"2916.39",cd:0, gst:0, acd:0,wht:5.5,label:"Ibuprofen API",cat:"Pharma API"},
  "stearic acid":            {code:"2915.70",cd:11,gst:17,acd:2,wht:5.5,label:"Stearic Acid",cat:"Industrial"},
  "lecithin":                {code:"2923.20",cd:11,gst:17,acd:2,wht:5.5,label:"Lecithin",cat:"Emulsifier"},
  "msg":                     {code:"2922.42",cd:20,gst:17,acd:2,wht:5.5,label:"Monosodium Glutamate",cat:"Flavoring"},
  "monosodium glutamate":    {code:"2922.42",cd:20,gst:17,acd:2,wht:5.5,label:"MSG",cat:"Flavoring"},
  "sucralose":               {code:"2940.00",cd:20,gst:17,acd:2,wht:5.5,label:"Sucralose",cat:"Sweetener"},
  "tartaric acid":           {code:"2918.12",cd:11,gst:17,acd:2,wht:5.5,label:"Tartaric Acid",cat:"Food Acid"},
  "lactic acid":             {code:"2918.11",cd:11,gst:17,acd:2,wht:5.5,label:"Lactic Acid",cat:"Food Acid"},
  "fumaric acid":            {code:"2917.13",cd:11,gst:17,acd:2,wht:5.5,label:"Fumaric Acid",cat:"Food Acid"},
  "sorbic acid":             {code:"2916.19",cd:11,gst:17,acd:2,wht:5.5,label:"Sorbic Acid",cat:"Preservative"},
  "malic acid":              {code:"2918.19",cd:11,gst:17,acd:2,wht:5.5,label:"Malic Acid",cat:"Food Acid"},
  "acetic acid":             {code:"2915.21",cd:11,gst:17,acd:2,wht:5.5,label:"Acetic Acid",cat:"Food Acid"},
  "calcium carbonate":       {code:"2836.50",cd:20,gst:17,acd:2,wht:5.5,label:"Calcium Carbonate",cat:"Mineral"},
  "modified starch":         {code:"1108.12",cd:20,gst:17,acd:2,wht:5.5,label:"Modified Starch",cat:"Food"},
  "starch":                  {code:"1108.12",cd:20,gst:17,acd:2,wht:5.5,label:"Modified Starch",cat:"Food"},
  "sodium acetate":          {code:"2915.29",cd:11,gst:17,acd:2,wht:5.5,label:"Sodium Acetate",cat:"Food Additive"},
  "silicon dioxide":         {code:"2811.22",cd:11,gst:17,acd:2,wht:5.5,label:"Silicon Dioxide",cat:"Anti-caking"},
  "silica":                  {code:"2811.22",cd:11,gst:17,acd:2,wht:5.5,label:"Silica",cat:"Anti-caking"},
  "carrageenan":             {code:"1302.31",cd:20,gst:17,acd:2,wht:5.5,label:"Carrageenan",cat:"Hydrocolloid"},
  "agar agar":               {code:"1302.31",cd:20,gst:17,acd:2,wht:5.5,label:"Agar Agar",cat:"Hydrocolloid"},
  "gelatin":                 {code:"3503.00",cd:20,gst:17,acd:2,wht:5.5,label:"Gelatin",cat:"Food/Pharma"},
  "pectin":                  {code:"1302.20",cd:20,gst:17,acd:2,wht:5.5,label:"Pectin",cat:"Hydrocolloid"},
  "titanium dioxide":        {code:"3206.11",cd:20,gst:17,acd:2,wht:5.5,label:"Titanium Dioxide",cat:"Pigment"},
  "sodium chloride":         {code:"2501.00",cd:0, gst:0, acd:0,wht:5.5,label:"Sodium Chloride",cat:"Food Mineral"},
  "salt":                    {code:"2501.00",cd:0, gst:0, acd:0,wht:5.5,label:"Sodium Chloride",cat:"Food Mineral"},
  "glucose":                 {code:"1702.30",cd:20,gst:17,acd:2,wht:5.5,label:"Glucose",cat:"Sweetener"},
  "dextrose":                {code:"1702.30",cd:20,gst:17,acd:2,wht:5.5,label:"Dextrose",cat:"Sweetener"},
  "fructose":                {code:"1702.50",cd:20,gst:17,acd:2,wht:5.5,label:"Fructose",cat:"Sweetener"},
  "stevia":                  {code:"2940.00",cd:20,gst:17,acd:2,wht:5.5,label:"Stevia Extract",cat:"Sweetener"},
  "glycerol":                {code:"2905.45",cd:11,gst:17,acd:2,wht:5.5,label:"Glycerol",cat:"Food/Industrial"},
  "glycerin":                {code:"2905.45",cd:11,gst:17,acd:2,wht:5.5,label:"Glycerin",cat:"Food/Industrial"},
  "propylene glycol":        {code:"2905.32",cd:20,gst:17,acd:2,wht:5.5,label:"Propylene Glycol",cat:"Food Additive"},
  "mcc":                     {code:"3912.90",cd:20,gst:17,acd:2,wht:5.5,label:"Microcrystalline Cellulose",cat:"Pharma Excipient"},
  "microcrystalline cellulose":{code:"3912.90",cd:20,gst:17,acd:2,wht:5.5,label:"MCC",cat:"Pharma Excipient"},
};

const FREIGHT = {
  "China":       {"20ft FCL":850, "40ft FCL":1350,"40ft HQ":1500,"LCL":45},
  "India":       {"20ft FCL":600, "40ft FCL":950, "40ft HQ":1100,"LCL":32},
  "UAE":         {"20ft FCL":380, "40ft FCL":620, "40ft HQ":700, "LCL":22},
  "Germany":     {"20ft FCL":1800,"40ft FCL":2900,"40ft HQ":3200,"LCL":68},
  "Netherlands": {"20ft FCL":1820,"40ft FCL":2870,"40ft HQ":3150,"LCL":65},
  "UK":          {"20ft FCL":1750,"40ft FCL":2800,"40ft HQ":3100,"LCL":63},
  "USA":         {"20ft FCL":2200,"40ft FCL":3500,"40ft HQ":4000,"LCL":82},
  "Malaysia":    {"20ft FCL":750, "40ft FCL":1200,"40ft HQ":1400,"LCL":40},
  "Singapore":   {"20ft FCL":700, "40ft FCL":1100,"40ft HQ":1300,"LCL":38},
  "Thailand":    {"20ft FCL":780, "40ft FCL":1250,"40ft HQ":1450,"LCL":42},
  "France":      {"20ft FCL":1850,"40ft FCL":2950,"40ft HQ":3250,"LCL":70},
  "Italy":       {"20ft FCL":1800,"40ft FCL":2900,"40ft HQ":3200,"LCL":68},
  "Japan":       {"20ft FCL":900, "40ft FCL":1450,"40ft HQ":1650,"LCL":50},
  "South Korea": {"20ft FCL":850, "40ft FCL":1400,"40ft HQ":1600,"LCL":48},
  "Other":       {"20ft FCL":1200,"40ft FCL":2000,"40ft HQ":2300,"LCL":55},
};

const PORTS = {
  "China":       ["Shanghai","Ningbo","Qingdao","Shenzhen","Guangzhou","Tianjin","Xiamen"],
  "India":       ["Nhava Sheva (Mumbai)","Mundra","Chennai","Kolkata","Kochi"],
  "UAE":         ["Jebel Ali (Dubai)","Abu Dhabi","Sharjah"],
  "Germany":     ["Hamburg","Bremen","Bremerhaven"],
  "Netherlands": ["Rotterdam","Amsterdam"],
  "UK":          ["Felixstowe","Southampton","London Gateway"],
  "USA":         ["Los Angeles","Long Beach","New York","Houston","Seattle"],
  "Malaysia":    ["Port Klang","Penang","Johor Bahru"],
  "Singapore":   ["Singapore"],
  "Thailand":    ["Laem Chabang","Bangkok (LCBT)"],
  "France":      ["Le Havre","Marseille"],
  "Italy":       ["Genoa","La Spezia","Naples"],
  "Japan":       ["Yokohama","Tokyo","Osaka","Nagoya"],
  "South Korea": ["Busan","Incheon"],
  "Other":       ["Origin Port"],
};

const DEST_PORTS  = ["Karachi Port (KPT)","Hawksbay Terminal","PICT (Port Qasim)","QICT (Port Qasim)"];
const COUNTRIES   = Object.keys(FREIGHT);
const CURRENCIES  = Object.keys(FX);
const INCOTERMS   = ["FOB","CFR","CIF","EXW"];
const CONTAINERS  = ["20ft FCL","40ft FCL","40ft HQ","LCL"];
const ALLOC_OPTS  = [{v:"value",l:"By Cargo Value %"},{v:"weight",l:"By Weight %"},{v:"cbm",l:"By CBM %"}];
const CC = ["#F59E0B","#14B8A6","#6366F1","#EF4444","#8B5CF6","#EC4899","#F97316","#10B981","#64748B"];
const NAV = [{id:"calc",icon:"⚖️",label:"Calculator"},{id:"freight",icon:"🚢",label:"Freight Rates"},{id:"hs",icon:"🔍",label:"HS Code Lookup"},{id:"history",icon:"📋",label:"History"}];

/* ═══ HELPERS ══════════════════════════════════════════════ */
const pkr  = n => "PKR " + Math.round(n||0).toLocaleString("en-PK");
const usd  = n => "$"   + (n||0).toLocaleString("en-US",{maximumFractionDigits:0});
const pct  = (a,b) => b>0 ? ((a/b)*100).toFixed(1)+"%" : "0%";
const newItem = id => ({id,name:"",unitPrice:"",currency:"USD",qty:"",weight:"",cbm:"",unit:"KG",hsCode:"",label:"",cat:"",cd:"",gst:"",acd:"",wht:"5.5",hsStatus:"idle"});

function lookupLocal(name) {
  const k = (name||"").toLowerCase().trim();
  if (!k) return null;
  if (HS_DB[k]) return HS_DB[k];
  for (const [key,val] of Object.entries(HS_DB)) {
    if (k.includes(key)||key.includes(k)) return val;
  }
  return null;
}

async function aiClassify(productName) {
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:250,
      messages:[{role:"user",content:
`Pakistan Customs 2026. Product: "${productName}".
Rules: Pharma APIs=cd:0,gst:0,acd:0. Food additives common=cd:11,gst:17,acd:2. Food additives high=cd:20,gst:17,acd:2. Hydrocolloids/sweeteners=cd:20,gst:17,acd:2. WHT always 5.5.
Return ONLY valid JSON, no markdown: {"code":"2918.14","cd":11,"gst":17,"acd":2,"wht":5.5,"label":"Official Name","cat":"Category"}`
      }]
    })
  });
  const d = await res.json();
  const txt = (d.content&&d.content[0]&&d.content[0].text)||"{}";
  return JSON.parse(txt.replace(/```json|```/g,"").trim());
}

function calcItem(item, shipment, freightShareUSD, portSharePKR, fx) {
  const _FX = fx || FX_FALLBACK;
  const rate    = _FX[item.currency]||1;
  const prodUSD = (parseFloat(item.unitPrice)||0)*rate*(parseFloat(item.qty)||0);
  const origUSD = shipment.incoterm==="EXW" ? prodUSD*0.025 : 0;
  const fobUSD  = prodUSD+origUSD;
  const noFr    = shipment.incoterm==="CIF"||shipment.incoterm==="CFR";
  const addFr   = noFr ? 0 : (freightShareUSD||0);
  const cfrUSD  = fobUSD+addFr;
  const insUSD  = shipment.incoterm==="CIF" ? 0 : cfrUSD*(parseFloat(shipment.insuranceRate)||0.8)/100;
  const cifUSD  = cfrUSD+insUSD;
  const _USDPKR = shipment.usdPkr || 278.5;
  const cifPKR  = cifUSD*_USDPKR;
  const cd  = parseFloat(item.cd)||0;
  const gst = parseFloat(item.gst)||0;
  const acd = parseFloat(item.acd)||0;
  const wht = parseFloat(item.wht)||5.5;
  const cdP   = cifPKR*(cd/100);
  const acdP  = (cifPKR+cdP)*(acd/100);
  const gstP  = (cifPKR+cdP+acdP)*(gst/100);
  const whtP  = cifPKR*(wht/100);
  const portP = portSharePKR!==undefined ? portSharePKR : PORT_CHARGES_PKR;
  const prodPKR=prodUSD*_USDPKR, origPKR=origUSD*_USDPKR, frPKR=addFr*_USDPKR, insPKR=insUSD*_USDPKR;
  const grand = prodPKR+origPKR+frPKR+insPKR+cdP+acdP+gstP+whtP+portP;
  const qty   = parseFloat(item.qty)||1;
  const wkilo = parseFloat(item.weight)||0;
  return {productP:prodPKR,originP:origPKR,freightP:frPKR,insP:insPKR,cdP,acdP,gstP,whtP,portP,
    total:grand,cifPKR,productUSD:prodUSD,cifUSD,perUnit:grand/qty,perKg:wkilo>0?grand/wkilo:null,rates:{cd,gst,acd,wht}};
}

/* ═══ MAIN APP ════════════════════════════════════════════ */
export default function App() {
  const [dark,   setDark]  = useState(true);

  // Live exchange rates state
  const [xRate,    setXRate]   = useState({ usdPkr: USD_PKR_FALLBACK, fx: FX_FALLBACK, source: "fallback", lastUpdated: null, stale: true });
  const [xLoading, setXLoad]  = useState(false);
  const [view,   setView]  = useState("calc");
  const [side,   setSide]  = useState(true);
  const [g, setG] = useState({incoterm:"FOB",containerType:"20ft FCL",originCountry:"China",
    originPort:"Shanghai",destPort:"Karachi Port (KPT)",insuranceRate:"0.8",freightOverride:"",allocationMethod:"value"});
  const [items,   setItems]  = useState([newItem(1)]);
  const [nextId,  setNxtId]  = useState(2);
  const [results, setRes]    = useState(null);
  const [history, setHist]   = useState([]);
  const [actH,    setActH]   = useState(null);
  const [margin,  setMargin] = useState("");
  const [err,     setErr]    = useState("");
  const [detOpen, setDetOpen]= useState(false);
  const [frRates, setFR]     = useState(FREIGHT);
  const [frUpd,   setFRUpd]  = useState(null);
  const [frLoad,  setFRLoad] = useState(false);
  const [frConf,  setFRConf] = useState(null);
  const [oPorts,  setOPorts] = useState(PORTS["China"]);
  const [aiLoad,  setAiLoad] = useState({});
  const [hsQ,     setHsQ]    = useState("");
  const [hsRes,   setHsRes]  = useState(null);
  const [hsLoad,  setHsLoad] = useState(false);

  // Update origin port list when country changes
  useEffect(()=>{
    const pts = PORTS[g.originCountry]||["Origin Port"];
    setOPorts(pts);
    setG(p=>({...p,originPort:pts[0]}));
  },[g.originCountry]);

  const upG    = (k,v) => setG(p=>({...p,[k]:v}));
  const upItem = (id,k,v) => setItems(p=>p.map(i=>i.id===id?{...i,[k]:v}:i));
  const addItem  = () => { if(items.length>=10)return; setItems(p=>[...p,newItem(nextId)]); setNxtId(n=>n+1); };
  const rmItem   = id => setItems(p=>p.filter(i=>i.id!==id));

  const lookupItemHS = async id => {
    const item = items.find(i=>i.id===id);
    if (!item||!item.name.trim()) return;
    setAiLoad(a=>({...a,[id]:true}));
    upItem(id,"hsStatus","loading");
    const local = lookupLocal(item.name);
    if (local) {
      setItems(p=>p.map(i=>i.id===id?{...i,hsCode:local.code,label:local.label,cat:local.cat,
        cd:String(local.cd),gst:String(local.gst),acd:String(local.acd),wht:String(local.wht),hsStatus:"found"}:i));
      setAiLoad(a=>({...a,[id]:false}));
      return;
    }
    try {
      const ai = await aiClassify(item.name);
      if (ai && ai.code) {
        setItems(p=>p.map(i=>i.id===id?{...i,hsCode:ai.code,label:ai.label||item.name,cat:ai.cat||"Chemical",
          cd:String(ai.cd||0),gst:String(ai.gst||0),acd:String(ai.acd||0),wht:String(ai.wht||5.5),hsStatus:"ai"}:i));
      } else { upItem(id,"hsStatus","error"); }
    } catch { upItem(id,"hsStatus","error"); }
    setAiLoad(a=>({...a,[id]:false}));
  };

  // Fetch live exchange rates from backend → exchangerate-api.com
  const fetchLiveRates = async (silent=false) => {
    if(!silent) setXLoad(true);
    try {
      const res = await fetch("/api/rates");
      if(res.ok){
        const d = await res.json();
        if(d.success && d.data){
          const r = d.data.rates;
          const fx = { USD:1, EUR:r.EUR?1/r.EUR:FX_FALLBACK.EUR, GBP:r.GBP?1/r.GBP:FX_FALLBACK.GBP,
            CNY:r.CNY?1/r.CNY:FX_FALLBACK.CNY, AED:r.AED?1/r.AED:FX_FALLBACK.AED,
            SGD:r.SGD?1/r.SGD:FX_FALLBACK.SGD, JPY:r.JPY?1/r.JPY:FX_FALLBACK.JPY,
            INR:r.INR?1/r.INR:FX_FALLBACK.INR };
          setXRate({ usdPkr:r.PKR||USD_PKR_FALLBACK, fx, source:d.data.source, lastUpdated:d.data.lastUpdated, stale:d.data.stale||false });
        }
      }
    } catch(_){ /* backend offline — use fallback silently */ }
    if(!silent) setXLoad(false);
  };

  // Fetch rates on mount and every 30 min
  useEffect(()=>{
    fetchLiveRates(true);
    const t = setInterval(()=>fetchLiveRates(true), 30*60*1000);
    return ()=>clearInterval(t);
  },[]);

  // Convenience aliases so rest of code doesn't change
  const USD_PKR = xRate.usdPkr;
  const FX      = xRate.fx;

  // Freight: update from AI (market estimate — not the old bad fetchAIFreight)
  // This calls Claude to get updated market estimates based on current date
  const updateFreight = async () => {
    setFRLoad(true); setFRConf(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:800,
          messages:[{role:"user",content:
`You are a freight market expert. Provide current all-inclusive ocean freight rates (USD) from various origins to Karachi Port, Pakistan as of ${new Date().toLocaleDateString("en-PK")}.
Include BAF, CAF, THC in all rates. LCL is per CBM.
Return ONLY valid JSON with exactly these country keys: China, India, UAE, Germany, Netherlands, UK, USA, Malaysia, Singapore, Thailand, France, Italy, Japan, South Korea, Other.
Each key: {"20ft FCL":850,"40ft FCL":1350,"40ft HQ":1500,"LCL":45}
Adjust values based on current 2026 market conditions. No text before or after JSON.`
          }]
        })
      });
      const d = await res.json();
      const txt = ((d.content&&d.content[0]&&d.content[0].text)||"{}").replace(/```json|```/g,"").trim();
      const newRates = JSON.parse(txt);
      if (newRates && Object.keys(newRates).length >= 5) {
        setFR(prev=>({...prev,...newRates}));
        setFRUpd(new Date().toLocaleString("en-PK"));
        setFRConf("AI Market Estimate");
      }
    } catch(e){ console.error("Freight update failed:",e); }
    setFRLoad(false);
  };

  const handleCalculate = () => {
    setErr(""); setDetOpen(false);
    const valid = items.filter(i=>i.name&&parseFloat(i.unitPrice)>0&&parseFloat(i.qty)>0);
    if (!valid.length){ setErr("Fill in at least one item with name, price, and quantity."); return; }
    const rates = frRates[g.originCountry]||frRates["Other"];
    let totalFr = parseFloat(g.freightOverride)||0;
    if (!totalFr) {
      if (g.containerType==="LCL") {
        const kg  = items.reduce((s,i)=>s+(parseFloat(i.weight)||0),0);
        const cbm = items.reduce((s,i)=>s+(parseFloat(i.cbm)||0),0);
        totalFr   = (rates["LCL"]||55)*Math.max(cbm,kg/1000,1);
      } else {
        totalFr = rates[g.containerType]||1200;
      }
    }
    const totalFob = items.reduce((s,i)=>{const r=FX[i.currency]||1;return s+(parseFloat(i.unitPrice)||0)*r*(parseFloat(i.qty)||0);},0);
    const totalWt  = items.reduce((s,i)=>s+(parseFloat(i.weight)||0),0);
    const totalCbm = items.reduce((s,i)=>s+(parseFloat(i.cbm)||0),0);
    const portSh   = PORT_CHARGES_PKR/items.length;
    const itemRes  = items.map(item=>{
      const fxR=FX[item.currency]||1;
      const val=(parseFloat(item.unitPrice)||0)*fxR*(parseFloat(item.qty)||0);
      const wt=parseFloat(item.weight)||0, cb=parseFloat(item.cbm)||0;
      let sh;
      if (g.allocationMethod==="weight") sh=totalWt>0?(wt/totalWt)*totalFr:totalFr/items.length;
      else if (g.allocationMethod==="cbm") sh=totalCbm>0?(cb/totalCbm)*totalFr:totalFr/items.length;
      else sh=totalFob>0?(val/totalFob)*totalFr:totalFr/items.length;
      return {...calcItem(item,{...g,usdPkr:USD_PKR},sh,portSh,FX),name:item.name||"Item",id:item.id,unit:item.unit,
        hsCode:item.hsCode,qty:parseFloat(item.qty)||0,weight:parseFloat(item.weight)||0};
    });
    const grand=itemRes.reduce((s,r)=>s+r.total,0);
    const rec={items:itemRes,grand,freightUsed:totalFr,g:{...g},timestamp:new Date().toLocaleString("en-PK")};
    setRes(rec); setActH(null); setHist(h=>[rec,...h.slice(0,9)]);
  };

  const lookupHS = async () => {
    if (!hsQ.trim()) return;
    setHsLoad(true); setHsRes(null);
    const loc=lookupLocal(hsQ);
    if (loc){ setHsRes(loc); setHsLoad(false); return; }
    try { const ai=await aiClassify(hsQ); if(ai&&ai.code) setHsRes({code:ai.code,label:ai.label||hsQ,cat:ai.cat||"Chemical",cd:ai.cd||0,gst:ai.gst||0,acd:ai.acd||0,wht:ai.wht||5.5}); }
    catch{ setHsRes(null); }
    setHsLoad(false);
  };

  const displayRes = actH!==null ? history[actH] : results;
  const pieData = displayRes?[
    {name:"Product Cost",  value:Math.round(displayRes.items.reduce((s,r)=>s+r.productP,0))},
    {name:"Freight",       value:Math.round(displayRes.items.reduce((s,r)=>s+r.freightP,0))},
    {name:"Insurance",     value:Math.round(displayRes.items.reduce((s,r)=>s+r.insP,0))},
    {name:"Customs Duty",  value:Math.round(displayRes.items.reduce((s,r)=>s+r.cdP,0))},
    {name:"GST",           value:Math.round(displayRes.items.reduce((s,r)=>s+r.gstP,0))},
    {name:"WHT",           value:Math.round(displayRes.items.reduce((s,r)=>s+r.whtP,0))},
    {name:"Port+Clearing", value:Math.round(displayRes.items.reduce((s,r)=>s+r.portP,0))},
  ].filter(d=>d.value>0):[];

  const T={bg:dark?"#080C16":"#EFF3FB",surf:dark?"#0E1625":"#FFFFFF",s2:dark?"#141E30":"#F4F7FD",
    s3:dark?"#1A2438":"#E8EDF8",border:dark?"#1E2D47":"#D0DAF0",text:dark?"#DDE3F0":"#111827",
    muted:dark?"#5A6E8A":"#6B7280",accent:"#F59E0B",teal:"#14B8A6",purple:"#818CF8",danger:"#F87171",green:"#34D399"};
  const card={background:T.surf,border:`1px solid ${T.border}`,borderRadius:"14px",padding:"20px",marginBottom:"16px"};
  const inp ={background:T.s2,border:`1px solid ${T.border}`,color:T.text,borderRadius:"8px",padding:"9px 12px",fontSize:"13px",width:"100%",outline:"none",fontFamily:"inherit"};
  const lbl ={fontSize:"10px",fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:"5px",display:"block"};
  const btnA={border:"none",borderRadius:"9px",padding:"9px 18px",fontSize:"13px",fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"6px",fontFamily:"inherit",background:T.accent,color:"#000"};
  const btnT={...btnA,background:T.teal,color:"#000"};
  const btnS={...btnA,background:T.s3,color:T.text};
  const uniqueHS=[...new Map(Object.values(HS_DB).map(v=>[v.code,v])).values()];

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:${dark?"#1E2D47":"#C7D2E8"};border-radius:4px}
        input::placeholder{color:${T.muted}!important}
        select option{background:${T.surf};color:${T.text}}
        .nb:hover{background:${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)"}!important}
        .rh:hover{background:${dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.025)"}!important}
        .ch:hover{background:${dark?"#1A2840":"#EEF4FF"}!important;cursor:pointer}
        input:focus,select:focus{border-color:${T.accent}!important;outline:none}
        @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .fade{animation:fadein 0.22s ease}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin{display:inline-block;animation:spin 1s linear infinite}
        @media(max-width:700px){.sb{display:none!important}.mp{padding:12px!important}}
      `}</style>

      <div style={{display:"flex",height:"100vh",overflow:"hidden",background:T.bg,color:T.text,fontFamily:"'Outfit',sans-serif"}}>

        {/* ── SIDEBAR ── */}
        <aside className="sb" style={{width:side?224:60,minWidth:side?224:60,background:T.surf,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",transition:"width 0.2s",overflow:"hidden",flexShrink:0}}>
          <div style={{padding:"18px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:"10px",minHeight:70}}>
            <div style={{width:38,height:38,background:`linear-gradient(135deg,${T.accent},#D97706)`,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0,boxShadow:`0 4px 14px ${T.accent}50`}}>⚓</div>
            {side&&<div><div style={{fontSize:"12.5px",fontWeight:800,lineHeight:1.2}}>A.J. Nawab & Co.</div><div style={{fontSize:"10px",color:T.muted}}>Import Cost System</div></div>}
          </div>
          <nav style={{flex:1,padding:"10px 8px"}}>
            {NAV.map(n=>(
              <button key={n.id} className="nb" onClick={()=>setView(n.id)}
                style={{display:"flex",alignItems:"center",gap:"11px",width:"100%",padding:"10px",borderRadius:"10px",
                  background:view===n.id?(dark?"rgba(245,158,11,0.12)":"rgba(245,158,11,0.1)"):"transparent",
                  border:view===n.id?`1px solid ${T.accent}40`:"1px solid transparent",
                  cursor:"pointer",color:view===n.id?T.accent:T.muted,fontSize:"13px",fontWeight:view===n.id?700:400,
                  fontFamily:"inherit",textAlign:"left",marginBottom:"3px"}}>
                <span style={{fontSize:"18px",flexShrink:0}}>{n.icon}</span>
                {side&&<span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{n.label}</span>}
              </button>
            ))}
          </nav>
          <div style={{padding:"10px 8px",borderTop:`1px solid ${T.border}`}}>
            <button className="nb" onClick={()=>setDark(d=>!d)} style={{display:"flex",alignItems:"center",gap:"11px",width:"100%",padding:"9px 10px",borderRadius:"9px",background:"transparent",border:"none",cursor:"pointer",color:T.muted,fontSize:"13px",fontFamily:"inherit",marginBottom:"3px"}}>
              <span style={{flexShrink:0}}>{dark?"☀️":"🌙"}</span>{side&&<span>{dark?"Light Mode":"Dark Mode"}</span>}
            </button>
            <button className="nb" onClick={()=>setSide(s=>!s)} style={{display:"flex",alignItems:"center",gap:"11px",width:"100%",padding:"9px 10px",borderRadius:"9px",background:"transparent",border:"none",cursor:"pointer",color:T.muted,fontSize:"13px",fontFamily:"inherit"}}>
              <span style={{flexShrink:0}}>{side?"◀":"▶"}</span>{side&&<span>Collapse</span>}
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
          {/* Header */}
          <header style={{padding:"12px 22px",background:T.surf,borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,gap:"12px"}}>
            <div>
              <div style={{fontSize:"16px",fontWeight:800,letterSpacing:"-0.02em"}}>{(NAV.find(n=>n.id===view)||NAV[0]).icon} {(NAV.find(n=>n.id===view)||NAV[0]).label}</div>
              <div style={{fontSize:"11px",color:T.muted}}>Pakistan Import Cost System · Karachi/Hawksbay · 2026</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"16px",flexShrink:0}}>
              <div style={{textAlign:"right",cursor:"pointer"}} onClick={fetchLiveRates} title="Click to refresh">
                <div style={{fontSize:"9px",color:T.muted,textTransform:"uppercase",display:"flex",alignItems:"center",gap:"4px"}}>
                  USD/PKR
                  <span style={{width:6,height:6,borderRadius:"50%",background:xRate.stale?"#F97316":xRate.source==="live"?"#34D399":"#F59E0B",flexShrink:0}}/>
                  {xLoading&&<span className="spin" style={{fontSize:"9px"}}>⟳</span>}
                </div>
                <div style={{fontSize:"16px",fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:T.accent,lineHeight:1.2}}>{USD_PKR.toFixed(1)}</div>
                <div style={{fontSize:"9px",color:T.muted}}>{xRate.source==="live"?"🟢 Live":xRate.source==="cached"?"🔵 Cached":"🟡 Fallback"}</div>
              </div>
              <div style={{width:1,height:30,background:T.border}}/>
              <div style={{fontSize:"11px",color:T.muted}}>{new Date().toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"})}</div>
            </div>
          </header>

          {/* Scrollable content */}
          <div className="mp" style={{flex:1,overflowY:"auto",padding:"20px 22px"}}>

            {/* ════ CALCULATOR ════ */}
            {view==="calc"&&(
              <div className="fade">
                <div style={{marginBottom:"14px",padding:"9px 14px",background:dark?"rgba(245,158,11,0.07)":"rgba(245,158,11,0.09)",border:`1px solid ${T.accent}35`,borderRadius:"10px",fontSize:"12px",color:T.muted,display:"flex",gap:"16px",flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{color:T.accent,fontWeight:700,fontSize:"11px",textTransform:"uppercase"}}>Incoterm Guide</span>
                  <span><strong style={{color:T.accent}}>FOB</strong> Buyer pays freight+ins</span>
                  <span><strong style={{color:T.teal}}>CFR</strong> Freight in price</span>
                  <span><strong style={{color:T.purple}}>CIF</strong> Freight+ins in price</span>
                  <span><strong style={{color:T.danger}}>EXW</strong> All on buyer (+2.5%)</span>
                </div>
                {/* Exchange Rate Status Bar */}
                <div style={{marginBottom:"14px",padding:"8px 14px",background:dark?"rgba(52,211,153,0.07)":"rgba(52,211,153,0.07)",border:`1px solid ${T.green}30`,borderRadius:"9px",display:"flex",alignItems:"center",gap:"14px",flexWrap:"wrap",fontSize:"11px"}}>
                  <span style={{color:T.green,fontWeight:700}}>💱 Exchange Rates</span>
                  <span style={{color:T.text}}>1 USD = <strong style={{fontFamily:"'JetBrains Mono',monospace",color:T.accent}}>{USD_PKR.toFixed(2)} PKR</strong></span>
                  <span style={{color:T.muted}}>CNY: {xRate.fx.CNY?(1/xRate.fx.CNY).toFixed(3):"—"} · EUR: {xRate.fx.EUR?(1/xRate.fx.EUR).toFixed(4):"—"} · AED: {xRate.fx.AED?(1/xRate.fx.AED).toFixed(4):"—"}</span>
                  <span style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{color:xRate.stale?T.accent:T.teal}}>{xRate.source==="live"?"🟢 Live rates":xRate.source==="cached"?"🔵 Cached":"🟡 Fallback rates"}</span>
                    {xRate.lastUpdated&&<span style={{color:T.muted}}>Updated: {new Date(xRate.lastUpdated).toLocaleTimeString("en-PK",{hour:"2-digit",minute:"2-digit"})}</span>}
                    <button onClick={fetchLiveRates} disabled={xLoading} style={{...btnS,padding:"3px 10px",fontSize:"10px",opacity:xLoading?0.6:1}}>
                      {xLoading?<><span className="spin">⟳</span>&nbsp;Updating</>:"⟳ Refresh"}
                    </button>
                  </span>
                </div>

                {/* Shipment config */}
                <div style={card}>
                  <div style={{fontSize:"13px",fontWeight:700,marginBottom:"14px"}}>🚢 Shipment Configuration</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"12px",marginBottom:"12px"}}>
                    {[
                      {l:"Incoterm",k:"incoterm",opts:INCOTERMS},
                      {l:"Container Type",k:"containerType",opts:CONTAINERS},
                    ].map(({l,k,opts})=>(
                      <div key={k}><label style={lbl}>{l}</label>
                        <select value={g[k]} onChange={e=>upG(k,e.target.value)} style={inp}>{opts.map(o=><option key={o}>{o}</option>)}</select>
                      </div>
                    ))}
                    <div><label style={lbl}>Origin Country</label>
                      <select value={g.originCountry} onChange={e=>upG("originCountry",e.target.value)} style={inp}>
                        {COUNTRIES.map(o=><option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div><label style={lbl}>Origin Port</label>
                      <select value={g.originPort} onChange={e=>upG("originPort",e.target.value)} style={inp}>
                        {oPorts.map(o=><option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div><label style={lbl}>Destination Port</label>
                      <select value={g.destPort} onChange={e=>upG("destPort",e.target.value)} style={inp}>
                        {DEST_PORTS.map(o=><option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div><label style={lbl}>Allocation Method</label>
                      <select value={g.allocationMethod} onChange={e=>upG("allocationMethod",e.target.value)} style={inp}>
                        {ALLOC_OPTS.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </div>
                    <div><label style={lbl}>Insurance Rate %</label>
                      <input type="number" step="0.1" min="0" max="5" value={g.insuranceRate} onChange={e=>upG("insuranceRate",e.target.value)} style={inp} placeholder="0.8"/>
                    </div>
                    <div><label style={lbl}>Freight Override (USD)</label>
                      <input type="number" value={g.freightOverride} onChange={e=>upG("freightOverride",e.target.value)} style={inp} placeholder={`Auto: ${usd(frRates[g.originCountry]?.[g.containerType]||0)}`}/>
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px",padding:"9px 13px",background:T.s2,borderRadius:"8px"}}>
                    <span style={{fontSize:"11px",color:T.muted}}>
                      📌 {g.originPort} → {g.destPort} · Auto freight: <strong style={{color:T.accent,fontFamily:"'JetBrains Mono',monospace"}}>{usd(frRates[g.originCountry]?.[g.containerType]||0)}</strong>
                      {frConf&&<span style={{color:T.teal,marginLeft:"8px"}}>· {frConf}</span>}
                      {frUpd&&<span style={{marginLeft:"8px",color:T.muted}}>Updated: {frUpd}</span>}
                    </span>
                    <button onClick={updateFreight} disabled={frLoad} style={{...btnA,padding:"6px 14px",fontSize:"12px",opacity:frLoad?0.65:1}}>
                      {frLoad?<><span className="spin">🔄</span>&nbsp;Fetching…</>:"🔄 Update Market Freight"}
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div style={card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px",flexWrap:"wrap",gap:"8px"}}>
                    <div style={{fontSize:"13px",fontWeight:700}}>📦 Consignment Items <span style={{color:T.muted,fontWeight:400,fontSize:"12px"}}>({items.length}/10)</span></div>
                    <button onClick={addItem} style={{...btnT,padding:"7px 14px",fontSize:"12px",opacity:items.length>=10?0.5:1}} disabled={items.length>=10}>+ Add Item</button>
                  </div>

                  {items.map((item,idx)=>(
                    <div key={item.id} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:"12px",padding:"14px",marginBottom:"10px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px",flexWrap:"wrap",gap:"6px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
                          <span style={{fontSize:"11px",fontWeight:800,background:T.accent,color:"#000",padding:"2px 9px",borderRadius:"20px",fontFamily:"'JetBrains Mono',monospace"}}>#{idx+1}</span>
                          {item.hsStatus==="loading"&&<span style={{fontSize:"11px",color:T.teal}}>⏳ Classifying…</span>}
                          {item.hsStatus==="found"&&<span style={{fontSize:"11px",background:"#059669",color:"#fff",padding:"2px 9px",borderRadius:"20px"}}>✓ DB</span>}
                          {item.hsStatus==="ai"&&<span style={{fontSize:"11px",background:T.teal,color:"#000",padding:"2px 9px",borderRadius:"20px"}}>✦ AI</span>}
                          {item.hsStatus==="error"&&<span style={{fontSize:"11px",background:T.danger,color:"#fff",padding:"2px 9px",borderRadius:"20px"}}>⚠ Error</span>}
                          {item.label&&<span style={{fontSize:"11px",color:T.muted}}>{item.label} · <span style={{color:T.teal}}>{item.cat}</span></span>}
                        </div>
                        {items.length>1&&<button onClick={()=>rmItem(item.id)} style={{background:"transparent",border:"none",cursor:"pointer",color:T.danger,fontSize:"18px",lineHeight:1,padding:"0 2px"}}>✕</button>}
                      </div>
                      {/* Row 1 */}
                      <div style={{display:"grid",gridTemplateColumns:"2fr 1.1fr 0.8fr 0.9fr 0.8fr",gap:"9px",marginBottom:"9px"}}>
                        <div><label style={lbl}>Product Name</label>
                          <input value={item.name} onChange={e=>upItem(item.id,"name",e.target.value)} style={inp} placeholder="Citric Acid, CMC, Paracetamol…"/>
                        </div>
                        <div><label style={lbl}>Unit Price</label>
                          <input type="number" min="0" step="0.001" value={item.unitPrice} onChange={e=>upItem(item.id,"unitPrice",e.target.value)} style={inp} placeholder="0.00"/>
                        </div>
                        <div><label style={lbl}>Currency</label>
                          <select value={item.currency} onChange={e=>upItem(item.id,"currency",e.target.value)} style={inp}>{CURRENCIES.map(c=><option key={c}>{c}</option>)}</select>
                        </div>
                        <div><label style={lbl}>Quantity</label>
                          <input type="number" min="0" value={item.qty} onChange={e=>upItem(item.id,"qty",e.target.value)} style={inp} placeholder="0"/>
                        </div>
                        <div><label style={lbl}>Unit</label>
                          <select value={item.unit} onChange={e=>upItem(item.id,"unit",e.target.value)} style={inp}>{["KG","MT","Bags","Drums","Pcs","Ltrs","CBM"].map(u=><option key={u}>{u}</option>)}</select>
                        </div>
                      </div>
                      {/* Row 2 */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1.3fr 0.8fr 0.8fr 0.8fr 1.4fr",gap:"9px",paddingTop:"9px",borderTop:`1px dashed ${T.border}`}}>
                        <div><label style={lbl}>Weight (KG)</label>
                          <input type="number" min="0" value={item.weight} onChange={e=>upItem(item.id,"weight",e.target.value)} style={inp} placeholder="0"/>
                        </div>
                        <div><label style={lbl}>Volume (CBM)</label>
                          <input type="number" min="0" step="0.01" value={item.cbm} onChange={e=>upItem(item.id,"cbm",e.target.value)} style={inp} placeholder="0.00"/>
                        </div>
                        <div><label style={lbl}>HS Code</label>
                          <input value={item.hsCode} onChange={e=>upItem(item.id,"hsCode",e.target.value)} style={inp} placeholder="e.g. 2918.14"/>
                        </div>
                        <div><label style={lbl}>CD %</label>
                          <input type="number" min="0" max="100" value={item.cd} onChange={e=>upItem(item.id,"cd",e.target.value)} style={inp} placeholder="0"/>
                        </div>
                        <div><label style={lbl}>GST %</label>
                          <input type="number" min="0" max="100" value={item.gst} onChange={e=>upItem(item.id,"gst",e.target.value)} style={inp} placeholder="17"/>
                        </div>
                        <div><label style={lbl}>ACD %</label>
                          <input type="number" min="0" max="100" value={item.acd} onChange={e=>upItem(item.id,"acd",e.target.value)} style={inp} placeholder="2"/>
                        </div>
                        <div style={{display:"flex",alignItems:"flex-end"}}>
                          <button onClick={()=>lookupItemHS(item.id)} disabled={!!aiLoad[item.id]||!item.name.trim()}
                            style={{...btnT,width:"100%",justifyContent:"center",opacity:(aiLoad[item.id]||!item.name.trim())?0.5:1,fontSize:"12px"}}>
                            {aiLoad[item.id]?<><span className="spin">⏳</span>&nbsp;Classifying…</>:"🤖 AI HS Lookup"}
                          </button>
                        </div>
                      </div>
                      {item.unitPrice&&item.qty&&(
                        <div style={{marginTop:"7px",fontSize:"11px",color:T.muted}}>
                          FOB Value: <strong style={{color:T.text,fontFamily:"'JetBrains Mono',monospace"}}>{usd((parseFloat(item.unitPrice)||0)*(FX[item.currency]||1)*(parseFloat(item.qty)||0))}</strong>
                          {!item.cd&&!item.gst&&<span style={{color:T.accent,marginLeft:"10px"}}>⚠ Use AI HS Lookup to auto-fill duty rates</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {err&&<div style={{marginBottom:"12px",padding:"10px 15px",background:`${T.danger}18`,border:`1px solid ${T.danger}50`,borderRadius:"9px",fontSize:"13px",color:T.danger}}>⚠ {err}</div>}

                <button onClick={handleCalculate} style={{...btnA,width:"100%",padding:"15px",fontSize:"15px",borderRadius:"12px",justifyContent:"center",marginBottom:"22px",fontWeight:900,boxShadow:`0 8px 24px ${T.accent}40`}}>
                  ⚖️ &nbsp; Calculate True Landed Cost
                </button>

                {/* RESULTS */}
                {displayRes&&(
                  <div className="fade">
                    {actH!==null&&(
                      <div style={{marginBottom:"12px",padding:"9px 14px",background:dark?"rgba(129,140,248,0.1)":"rgba(129,140,248,0.1)",border:`1px solid ${T.purple}50`,borderRadius:"9px",fontSize:"12px",color:T.purple,display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
                        📋 History record — {displayRes.timestamp}
                        <button onClick={()=>setActH(null)} style={{...btnS,padding:"3px 10px",fontSize:"11px",marginLeft:"auto"}}>← Live Results</button>
                      </div>
                    )}
                    {/* KPI */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"12px",marginBottom:"16px"}}>
                      {[
                        {l:"Ex-Warehouse Total",v:pkr(displayRes.grand),c:T.accent,sub:`${displayRes.g.incoterm} · ${displayRes.g.originPort} → ${displayRes.g.destPort}`},
                        {l:"Ocean Freight",v:usd(displayRes.freightUsed),c:T.teal,sub:`= ${pkr(displayRes.freightUsed*USD_PKR)}`},
                        {l:"Duties + Taxes",v:pkr(displayRes.items.reduce((s,r)=>s+r.cdP+r.acdP+r.gstP+r.whtP,0)),c:T.purple,sub:"CD + ACD + GST + WHT"},
                        {l:"Port, Clearing & Logistics",v:pkr(displayRes.items.reduce((s,r)=>s+r.portP,0)),c:T.danger,sub:"THC · agent · transport · whse"},
                        ...( ()=>{ const totalKG=displayRes.items.reduce((s,r)=>s+(r.weight||0),0); return totalKG>0?[{l:"Ex-Warehouse Per KG",v:pkr(displayRes.grand/totalKG),c:T.green,sub:`Total ${totalKG.toLocaleString()} KG · Rate: ${USD_PKR.toFixed(1)} PKR/USD`}]:[] })(),
                      ].map((c,i)=>(
                        <div key={i} style={{background:T.surf,border:`1px solid ${T.border}`,borderRadius:"12px",padding:"16px",borderLeft:`3px solid ${c.c}`}}>
                          <div style={{fontSize:"10px",fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em"}}>{c.l}</div>
                          <div style={{fontSize:"20px",fontWeight:900,fontFamily:"'JetBrains Mono',monospace",color:c.c,margin:"7px 0 4px",letterSpacing:"-0.02em"}}>{c.v}</div>
                          <div style={{fontSize:"11px",color:T.muted}}>{c.sub}</div>
                        </div>
                      ))}
                    </div>
                    {/* Margin */}
                    <div style={{...card,display:"flex",gap:"12px",alignItems:"center",flexWrap:"wrap",padding:"14px 20px"}}>
                      <span style={{fontSize:"13px",color:T.muted,flexShrink:0}}>📈 Profit Margin:</span>
                      <input type="number" value={margin} onChange={e=>setMargin(e.target.value)} style={{...inp,width:"85px"}} placeholder="%"/>
                      {margin&&parseFloat(margin)>0&&(
                        <>
                          <div><div style={{fontSize:"10px",color:T.muted,textTransform:"uppercase"}}>Selling Price</div><div style={{fontSize:"18px",fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:T.green}}>{pkr(displayRes.grand*(1+parseFloat(margin)/100))}</div></div>
                          <div><div style={{fontSize:"10px",color:T.muted,textTransform:"uppercase"}}>Gross Profit</div><div style={{fontSize:"18px",fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:T.accent}}>{pkr(displayRes.grand*parseFloat(margin)/100)}</div></div>
                        </>
                      )}
                    </div>
                    {/* Chart + breakdown */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:"14px",marginBottom:"14px"}}>
                      <div style={card}>
                        <div style={{fontSize:"13px",fontWeight:700,marginBottom:"12px"}}>Cost Composition</div>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={78} innerRadius={40} dataKey="value" paddingAngle={2} strokeWidth={0}>
                            {pieData.map((_,i)=><Cell key={i} fill={CC[i%CC.length]}/>)}
                          </Pie><Tooltip formatter={v=>pkr(v)} contentStyle={{background:T.surf,border:`1px solid ${T.border}`,borderRadius:"8px",color:T.text,fontSize:"11px"}}/></PieChart>
                        </ResponsiveContainer>
                        <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginTop:"6px"}}>
                          {pieData.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:"4px",fontSize:"10px",color:T.muted}}><div style={{width:8,height:8,borderRadius:"2px",background:CC[i%CC.length],flexShrink:0}}/><span>{d.name}</span></div>)}
                        </div>
                      </div>
                      <div style={card}>
                        <div style={{fontSize:"13px",fontWeight:700,marginBottom:"12px"}}>Cost Breakdown (PKR)</div>
                        {[
                          {l:"Product Cost",k:"productP",c:CC[0]},{l:"Origin Transport",k:"originP",c:"#94A3B8"},
                          {l:"Ocean Freight",k:"freightP",c:CC[1]},{l:"Marine Insurance",k:"insP",c:CC[2]},
                          {l:"Customs Duty (CD)",k:"cdP",c:CC[3]},{l:"Addl. Customs Duty",k:"acdP",c:CC[4]},
                          {l:"Sales Tax GST 17%",k:"gstP",c:CC[5]},{l:"Withholding Tax 5.5%",k:"whtP",c:CC[6]},
                          {l:"Port, Clearing & Whse",k:"portP",c:CC[7]},
                        ].map(({l,k,c})=>{
                          const val=displayRes.items.reduce((s,r)=>s+(r[k]||0),0);
                          if(val<=0)return null;
                          const p=((val/displayRes.grand)*100).toFixed(1);
                          return(<div key={k} style={{marginBottom:"8px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{width:9,height:9,background:c,borderRadius:"2px",flexShrink:0}}/><span style={{fontSize:"11px",color:T.muted}}>{l}</span></div>
                              <div style={{display:"flex",gap:"8px",alignItems:"center"}}><span style={{fontSize:"10px",color:T.muted}}>{p}%</span><span style={{fontSize:"12px",fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:T.text}}>{pkr(val)}</span></div>
                            </div>
                            <div style={{height:4,background:T.s3,borderRadius:"4px",overflow:"hidden"}}><div style={{height:"100%",width:`${p}%`,background:c,borderRadius:"4px",transition:"width 0.5s ease"}}/></div>
                          </div>);
                        })}
                        <div style={{borderTop:`1px solid ${T.border}`,marginTop:"10px",paddingTop:"9px",display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:"14px"}}>
                          <span>EX-WAREHOUSE TOTAL</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:T.accent}}>{pkr(displayRes.grand)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed ex-warehouse breakdown */}
                    <div style={card}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",marginBottom:detOpen?"14px":0}} onClick={()=>setDetOpen(o=>!o)}>
                        <div style={{fontSize:"13px",fontWeight:700}}>🏭 Detailed Ex-Warehouse Cost Breakdown</div>
                        <span style={{fontSize:"13px",color:T.accent,fontWeight:700}}>{detOpen?"▲ Hide":"▼ Expand"}</span>
                      </div>
                      {detOpen&&(
                        <div>
                          <div style={{marginBottom:"14px",padding:"10px 13px",background:dark?"rgba(245,158,11,0.07)":"rgba(245,158,11,0.09)",borderRadius:"8px",fontSize:"11px",color:T.muted,lineHeight:1.7}}>
                            <strong style={{color:T.accent}}>Formula:</strong> CIF = FOB + Freight + Insurance → CD = CIF × CD% → ACD = (CIF+CD) × ACD% → GST = (CIF+CD+ACD) × 17% → WHT = CIF × 5.5% → Ex-Warehouse = Total + Port/Clearing/Logistics
                          </div>
                          {[
                            {l:"Product Cost (FOB/EXW)",f:"Unit Price × Qty × FX Rate",k:"productP",c:CC[0]},
                            {l:"Origin Transport (EXW only)",f:"FOB Value × 2.5%",k:"originP",c:"#94A3B8"},
                            {l:"Ocean Freight",f:`${usd(displayRes.freightUsed)} × ${USD_PKR} PKR/USD`,k:"freightP",c:CC[1]},
                            {l:"Marine Insurance",f:`CIF × ${displayRes.g.insuranceRate}%`,k:"insP",c:CC[2]},
                            {l:"Customs Duty (CD)",f:`CIF × ${displayRes.items[0]&&displayRes.items[0].rates?displayRes.items[0].rates.cd:0}%`,k:"cdP",c:CC[3]},
                            {l:"Addl. Customs Duty (ACD)",f:`(CIF+CD) × ${displayRes.items[0]&&displayRes.items[0].rates?displayRes.items[0].rates.acd:0}%`,k:"acdP",c:CC[4]},
                            {l:"Sales Tax / GST",f:"(CIF+CD+ACD) × 17%",k:"gstP",c:CC[5]},
                            {l:"Withholding Tax (WHT)",f:"CIF × 5.5% [Sec.148 ITO 2001]",k:"whtP",c:CC[6]},
                          ].map(({l,f,k,c})=>{
                            const val=displayRes.items.reduce((s,r)=>s+(r[k]||0),0);
                            if(val<=0)return null;
                            return(<div key={k} className="rh" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                              <div><div style={{display:"flex",alignItems:"center",gap:"8px"}}><div style={{width:10,height:10,background:c,borderRadius:"2px",flexShrink:0}}/><span style={{fontSize:"12px",fontWeight:600,color:T.text}}>{l}</span></div><span style={{fontSize:"10px",color:T.muted,marginLeft:"18px"}}>{f}</span></div>
                              <div style={{textAlign:"right"}}><div style={{fontSize:"13px",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:T.text}}>{pkr(val)}</div><div style={{fontSize:"10px",color:T.muted}}>{pct(val,displayRes.grand)}</div></div>
                            </div>);
                          })}
                          {/* Port cost detail */}
                          <div style={{marginTop:"12px",background:T.s2,borderRadius:"10px",padding:"12px 14px"}}>
                            <div style={{fontSize:"12px",fontWeight:700,marginBottom:"10px",color:T.danger}}>🏗 Port, Clearing & Logistics Breakdown (per container)</div>
                            {[
                              {l:"Terminal Handling Charges (THC)",    v:PORT_COSTS.terminalHandling,   r:"KPT/PICT standard"},
                              {l:"Customs Clearing Agent Fee",          v:PORT_COSTS.customsAgent,       r:"PIFFA licensed agent"},
                              {l:"Documentation (B/L, COO, Phyto)",    v:PORT_COSTS.documentation,      r:"Shipping line + govt fees"},
                              {l:"Port Security Charge (PSC)",          v:PORT_COSTS.portSecurity,       r:"KPT levy"},
                              {l:"Miscellaneous Port (Wharfage+Survey)",v:PORT_COSTS.miscPort,           r:"Port dues"},
                              {l:"Local Transport — Port → Warehouse",  v:PORT_COSTS.localTransport,     r:"Avg 40km, Karachi"},
                              {l:"Warehouse Handling + 3-Day Storage",  v:PORT_COSTS.warehouseHandling,  r:"Hawksbay / SITE"},
                              {l:"Bank Charges (LC/TT)",                v:PORT_COSTS.bankCharges,        r:"Commercial bank"},
                            ].map(({l,v,r})=>(
                              <div key={l} className="rh" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px dashed ${T.border}`}}>
                                <div><div style={{fontSize:"11px",color:T.text}}>{l}</div><div style={{fontSize:"10px",color:T.muted}}>{r}</div></div>
                                <span style={{fontSize:"12px",fontFamily:"'JetBrains Mono',monospace",color:T.danger}}>{pkr(v)}</span>
                              </div>
                            ))}
                            <div style={{display:"flex",justifyContent:"space-between",marginTop:"8px",fontWeight:800,fontSize:"13px"}}>
                              <span>TOTAL PORT & LOGISTICS</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:T.danger}}>{pkr(PORT_CHARGES_PKR)}</span>
                            </div>
                          </div>
                          {/* Per-item summary */}
                          <div style={{marginTop:"12px",padding:"14px",background:dark?"rgba(245,158,11,0.07)":"rgba(245,158,11,0.07)",borderRadius:"10px",border:`1px solid ${T.accent}30`}}>
                            <div style={{fontSize:"12px",fontWeight:700,marginBottom:"10px",color:T.accent}}>📦 Ex-Warehouse Per Item</div>
                            {displayRes.items.map((r,i)=>(
                              <div key={i} style={{marginBottom:"8px",padding:"10px",background:T.surf,borderRadius:"8px",border:`1px solid ${T.border}`}}>
                                <div style={{fontSize:"12px",fontWeight:700,color:T.accent,marginBottom:"6px"}}>{r.name} {r.hsCode&&<span style={{fontSize:"10px",fontFamily:"'JetBrains Mono',monospace",color:T.muted}}>({r.hsCode})</span>}</div>
                                <div style={{display:"flex",gap:"20px",flexWrap:"wrap",marginBottom:"6px"}}>
                                  <div><div style={{fontSize:"10px",color:T.muted,textTransform:"uppercase"}}>Total Landed</div><div style={{fontSize:"17px",fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:T.accent}}>{pkr(r.total)}</div></div>
                                  <div><div style={{fontSize:"10px",color:T.muted,textTransform:"uppercase"}}>Per {r.unit||"Unit"}</div><div style={{fontSize:"17px",fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:T.teal}}>{pkr(r.perUnit)}</div></div>
                                  {r.perKg&&<div><div style={{fontSize:"10px",color:T.muted,textTransform:"uppercase"}}>Per KG</div><div style={{fontSize:"17px",fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:T.green}}>{pkr(r.perKg)}</div></div>}
                                  <div><div style={{fontSize:"10px",color:T.muted,textTransform:"uppercase"}}>CIF Value</div><div style={{fontSize:"17px",fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:T.purple}}>{usd(r.cifUSD)}</div></div>
                                </div>
                                <div style={{fontSize:"10px",color:T.muted,background:T.s2,padding:"6px 10px",borderRadius:"6px",fontFamily:"'JetBrains Mono',monospace"}}>
                                  CD:{pkr(r.cdP)} · ACD:{pkr(r.acdP)} · GST:{pkr(r.gstP)} · WHT:{pkr(r.whtP)} · Fr:{pkr(r.freightP)} · Ins:{pkr(r.insP)} · Port:{pkr(r.portP)}
                                </div>
                              </div>
                            ))}
                            <div style={{display:"flex",justifyContent:"space-between",fontWeight:900,fontSize:"14px",marginTop:"10px",padding:"12px 14px",background:T.accent,borderRadius:"9px",color:"#000"}}>
                              <span>GRAND EX-WAREHOUSE TOTAL</span><span style={{fontFamily:"'JetBrains Mono',monospace"}}>{pkr(displayRes.grand)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Multi-item table */}
                    {displayRes.items.length>1&&(
                      <div style={card}>
                        <div style={{fontSize:"13px",fontWeight:700,marginBottom:"12px"}}>📊 Per-Item Allocation ({displayRes.g.allocationMethod} method)</div>
                        <div style={{overflowX:"auto"}}>
                          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"11px",minWidth:700}}>
                            <thead><tr style={{borderBottom:`2px solid ${T.border}`}}>
                              {["Item","HS Code","Freight","Insurance","Duty+Tax","Port","TOTAL","Per Unit","Per KG"].map(h=>(
                                <th key={h} style={{padding:"7px 9px",textAlign:h==="Item"||h==="HS Code"?"left":"right",color:T.muted,fontWeight:700,fontSize:"9px",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                              ))}
                            </tr></thead>
                            <tbody>
                              {displayRes.items.map((r,i)=>(
                                <tr key={i} className="rh" style={{borderBottom:`1px solid ${T.border}`}}>
                                  <td style={{padding:"8px 9px",color:T.accent,fontWeight:700,maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</td>
                                  <td style={{padding:"8px 9px",fontFamily:"'JetBrains Mono',monospace",color:T.teal,whiteSpace:"nowrap"}}>{r.hsCode||"—"}</td>
                                  {[r.freightP,r.insP,r.cdP+r.acdP+r.gstP+r.whtP,r.portP].map((v,vi)=>(
                                    <td key={vi} style={{padding:"8px 9px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",color:T.text,whiteSpace:"nowrap"}}>{pkr(v||0)}</td>
                                  ))}
                                  <td style={{padding:"8px 9px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:T.accent,whiteSpace:"nowrap"}}>{pkr(r.total)}</td>
                                  <td style={{padding:"8px 9px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",color:T.teal,whiteSpace:"nowrap"}}>{pkr(r.perUnit)}/{r.unit||"u"}</td>
                                  <td style={{padding:"8px 9px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",color:T.muted,whiteSpace:"nowrap"}}>{r.perKg?pkr(r.perKg):"—"}</td>
                                </tr>
                              ))}
                              <tr style={{background:dark?"rgba(245,158,11,0.07)":"rgba(245,158,11,0.05)",borderTop:`2px solid ${T.accent}50`}}>
                                <td colSpan={6} style={{padding:"9px 9px",fontWeight:800,fontSize:"13px"}}>CONTAINER TOTAL</td>
                                <td style={{padding:"9px 9px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",fontWeight:900,color:T.accent,fontSize:"14px"}}>{pkr(displayRes.grand)}</td>
                                <td colSpan={2}/>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ════ FREIGHT RATES ════ */}
            {view==="freight"&&(
              <div className="fade">
                <div style={card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"16px",gap:"12px",flexWrap:"wrap"}}>
                    <div>
                      <div style={{fontSize:"14px",fontWeight:700}}>🚢 Ocean Freight Rates → Karachi Port</div>
                      <div style={{fontSize:"12px",color:T.muted,marginTop:"4px"}}>{frUpd?`Updated: ${frUpd}`:"Baseline market rates (all-in: BAF+CAF+THC). Click Update for current estimates."}</div>
                    </div>
                    <div style={{display:"flex",gap:"8px",alignItems:"flex-end",flexWrap:"wrap"}}>
                      <div>
                        <label style={lbl}>Quick Route</label>
                        <select value={g.originCountry} onChange={e=>upG("originCountry",e.target.value)} style={{...inp,width:"auto"}}>
                          {COUNTRIES.map(c=><option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <button onClick={updateFreight} disabled={frLoad} style={{...btnA,opacity:frLoad?0.65:1,marginBottom:"1px"}}>
                        {frLoad?<><span className="spin">🔄</span>&nbsp;Updating…</>:"🔄 Update Market Rates"}
                      </button>
                    </div>
                  </div>
                  {frConf&&<div style={{marginBottom:"12px",padding:"7px 12px",background:dark?"rgba(20,184,166,0.1)":"rgba(20,184,166,0.1)",border:`1px solid ${T.teal}40`,borderRadius:"8px",fontSize:"11px",color:T.teal}}>✅ {frConf} · Updated: {frUpd}</div>}
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px",minWidth:500}}>
                      <thead><tr style={{borderBottom:`2px solid ${T.border}`}}>
                        <th style={{padding:"9px 12px",textAlign:"left",color:T.muted,fontWeight:700,fontSize:"10px",textTransform:"uppercase"}}>Country</th>
                        {CONTAINERS.map(c=><th key={c} style={{padding:"9px 12px",textAlign:"right",color:T.muted,fontWeight:700,fontSize:"10px",textTransform:"uppercase",whiteSpace:"nowrap"}}>{c}</th>)}
                        <th style={{padding:"9px 12px",textAlign:"right",color:T.muted,fontWeight:700,fontSize:"10px",textTransform:"uppercase"}}>PKR (20ft)</th>
                      </tr></thead>
                      <tbody>
                        {Object.entries(frRates).map(([country,rates])=>(
                          <tr key={country} className="rh" style={{borderBottom:`1px solid ${T.border}`}}>
                            <td style={{padding:"10px 12px",fontWeight:600}}>{country}</td>
                            {CONTAINERS.map(c=>(
                              <td key={c} style={{padding:"10px 12px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",color:c==="LCL"?T.teal:T.accent,fontWeight:600,whiteSpace:"nowrap"}}>
                                {rates[c]?usd(rates[c]):"—"}{c==="LCL"&&rates[c]&&<span style={{fontSize:"10px",color:T.muted}}>/CBM</span>}
                              </td>
                            ))}
                            <td style={{padding:"10px 12px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",color:T.muted,fontSize:"11px"}}>{rates["20ft FCL"]?pkr(rates["20ft FCL"]*USD_PKR):"—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{marginTop:"12px",padding:"10px 13px",background:T.s2,borderRadius:"8px",fontSize:"11px",color:T.muted,lineHeight:1.6}}>
                    All-in estimates (BAF+CAF+THC). LCL: per CBM chargeable weight. "Update Market Rates" uses AI to estimate current market rates. In production deployment, connects to backend ZenRows/Freightos for real scraped data.
                  </div>
                </div>
                {/* Quick estimator */}
                <div style={card}>
                  <div style={{fontSize:"13px",fontWeight:700,marginBottom:"14px"}}>⚡ Quick Freight Estimator</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:"12px",marginBottom:"14px"}}>
                    <div><label style={lbl}>Origin Country</label>
                      <select value={g.originCountry} onChange={e=>upG("originCountry",e.target.value)} style={inp}>{COUNTRIES.map(c=><option key={c}>{c}</option>)}</select>
                    </div>
                    <div><label style={lbl}>Origin Port</label>
                      <select value={g.originPort} onChange={e=>upG("originPort",e.target.value)} style={inp}>{oPorts.map(p=><option key={p}>{p}</option>)}</select>
                    </div>
                    <div><label style={lbl}>Container Type</label>
                      <select value={g.containerType} onChange={e=>upG("containerType",e.target.value)} style={inp}>{CONTAINERS.map(c=><option key={c}>{c}</option>)}</select>
                    </div>
                  </div>
                  <div style={{padding:"16px 18px",background:dark?"#0A1A2E":"#EEF8FF",borderRadius:"11px",border:`1px solid ${T.teal}40`}}>
                    <div style={{fontSize:"11px",color:T.muted,marginBottom:"6px"}}>{g.originPort} → Karachi Port ({g.containerType})</div>
                    <div style={{fontSize:"28px",fontWeight:900,fontFamily:"'JetBrains Mono',monospace",color:T.accent,letterSpacing:"-0.02em"}}>{usd(frRates[g.originCountry]?.[g.containerType]||0)}</div>
                    <div style={{fontSize:"13px",color:T.muted,marginTop:"4px"}}>= <strong style={{color:T.text,fontFamily:"'JetBrains Mono',monospace"}}>{pkr((frRates[g.originCountry]?.[g.containerType]||0)*USD_PKR)}</strong> at {USD_PKR} PKR/USD</div>
                  </div>
                </div>
              </div>
            )}

            {/* ════ HS LOOKUP ════ */}
            {view==="hs"&&(
              <div className="fade">
                <div style={card}>
                  <div style={{fontSize:"14px",fontWeight:700,marginBottom:"6px"}}>🤖 AI HS Code Identifier — Pakistan Customs 2026</div>
                  <div style={{fontSize:"12px",color:T.muted,marginBottom:"16px"}}>50+ products in local database. Unknown products classified by AI.</div>
                  <div style={{display:"flex",gap:"10px",marginBottom:"18px",flexWrap:"wrap"}}>
                    <input value={hsQ} onChange={e=>setHsQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&lookupHS()} style={{...inp,flex:1,minWidth:200}} placeholder="Calcium Propionate, Xanthan Gum, Ibuprofen API…"/>
                    <button onClick={lookupHS} disabled={hsLoad||!hsQ.trim()} style={{...btnA,flexShrink:0,opacity:hsLoad||!hsQ.trim()?0.6:1}}>
                      {hsLoad?"⏳ Classifying…":"🔍 Lookup"}
                    </button>
                  </div>
                  {hsRes&&(
                    <div style={{background:dark?"#091826":"#EFF8FF",border:`1px solid ${T.teal}50`,borderRadius:"12px",padding:"18px",marginBottom:"20px"}}>
                      <div style={{display:"flex",gap:"10px",alignItems:"center",marginBottom:"14px",flexWrap:"wrap"}}>
                        <div style={{background:T.teal,color:"#000",padding:"5px 14px",borderRadius:"20px",fontSize:"15px",fontWeight:800,fontFamily:"'JetBrains Mono',monospace"}}>{hsRes.code}</div>
                        <div style={{fontSize:"17px",fontWeight:800}}>{hsRes.label}</div>
                        <div style={{fontSize:"11px",color:T.muted,background:T.s2,padding:"3px 11px",borderRadius:"20px"}}>{hsRes.cat}</div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:"9px",marginBottom:"12px"}}>
                        {[
                          {l:"Customs Duty",v:`${hsRes.cd}%`,c:T.danger},{l:"GST/Sales Tax",v:`${hsRes.gst}%`,c:"#F97316"},
                          {l:"Addl. CD",v:`${hsRes.acd}%`,c:T.purple},{l:"WHT Sec.148",v:`${hsRes.wht}%`,c:T.muted},
                          {l:"Total Est. Load",v:`~${(+hsRes.cd+ +hsRes.gst+ +hsRes.acd+ +hsRes.wht).toFixed(1)}%`,c:T.accent},
                        ].map(({l,v,c})=>(
                          <div key={l} style={{textAlign:"center",padding:"12px 8px",background:T.surf,borderRadius:"9px",border:`1px solid ${T.border}`}}>
                            <div style={{fontSize:"22px",fontWeight:900,fontFamily:"'JetBrains Mono',monospace",color:c}}>{v}</div>
                            <div style={{fontSize:"9px",color:T.muted,marginTop:"4px",lineHeight:1.3}}>{l}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{fontSize:"11px",color:T.muted,padding:"9px 12px",background:T.s2,borderRadius:"8px"}}>📌 Pakistan Customs Tariff 2025-26. Verify at customs.gov.pk or FBR IRIS.</div>
                    </div>
                  )}
                  <div style={{fontSize:"11px",fontWeight:700,color:T.muted,textTransform:"uppercase",marginBottom:"10px"}}>Quick Reference — {uniqueHS.length} Pre-Mapped Products (click to load)</div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px",minWidth:480}}>
                      <thead><tr style={{borderBottom:`2px solid ${T.border}`}}>
                        {["Product","HS Code","Category","CD%","GST%","ACD%","Total"].map(h=>(
                          <th key={h} style={{padding:"7px 10px",textAlign:"left",color:T.muted,fontWeight:700,fontSize:"9px",textTransform:"uppercase"}}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {uniqueHS.map((v,i)=>(
                          <tr key={i} className="ch" style={{borderBottom:`1px solid ${T.border}`}} onClick={()=>{setHsRes(v);setHsQ(v.label);}}>
                            <td style={{padding:"7px 10px",fontWeight:600,color:T.text}}>{v.label}</td>
                            <td style={{padding:"7px 10px",fontFamily:"'JetBrains Mono',monospace",color:T.teal,fontWeight:600}}>{v.code}</td>
                            <td style={{padding:"7px 10px",color:T.muted,fontSize:"11px"}}>{v.cat}</td>
                            <td style={{padding:"7px 10px",color:T.danger,fontWeight:700}}>{v.cd}%</td>
                            <td style={{padding:"7px 10px",color:"#F97316",fontWeight:700}}>{v.gst}%</td>
                            <td style={{padding:"7px 10px",color:T.purple,fontWeight:700}}>{v.acd}%</td>
                            <td style={{padding:"7px 10px",color:T.accent,fontWeight:800,fontFamily:"'JetBrains Mono',monospace"}}>{v.cd+v.gst+v.acd}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ════ HISTORY ════ */}
            {view==="history"&&(
              <div className="fade">
                <div style={card}>
                  <div style={{fontSize:"14px",fontWeight:700,marginBottom:"14px"}}>📋 Calculation History <span style={{fontWeight:400,fontSize:"12px",color:T.muted}}>({history.length} records)</span></div>
                  {history.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:T.muted}}><div style={{fontSize:"38px",marginBottom:"10px"}}>📭</div>No calculations yet.</div>}
                  {history.map((h,i)=>(
                    <div key={i} className="rh" style={{border:`1px solid ${i===actH?T.accent:T.border}`,borderRadius:"11px",padding:"15px",marginBottom:"10px",cursor:"pointer",background:i===actH?(dark?"rgba(245,158,11,0.07)":"rgba(245,158,11,0.04)"):"transparent"}}
                      onClick={()=>{setActH(i);setView("calc");}}>
                      <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"8px",alignItems:"flex-start"}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:"13px",marginBottom:"4px"}}>{h.items.length} item{h.items.length>1?"s":""} · {h.g.originPort} → {h.g.destPort} · {h.g.incoterm} · {h.g.containerType}</div>
                          <div style={{fontSize:"11px",color:T.muted}}>{h.timestamp}</div>
                          <div style={{fontSize:"11px",color:T.muted,marginTop:"3px"}}>{h.items.map(it=>it.name).filter(Boolean).join(" · ")}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:"10px",color:T.muted,textTransform:"uppercase"}}>Ex-Warehouse Total</div>
                          <div style={{fontSize:"20px",fontWeight:900,fontFamily:"'JetBrains Mono',monospace",color:T.accent}}>{pkr(h.grand)}</div>
                          <div style={{fontSize:"11px",color:T.teal}}>Freight: {usd(h.freightUsed)}</div>
                        </div>
                      </div>
                      <div style={{marginTop:"9px",display:"flex",gap:"7px",flexWrap:"wrap"}}>
                        {h.items.map((it,j)=>(
                          <div key={j} style={{fontSize:"11px",background:T.s2,padding:"3px 10px",borderRadius:"20px",border:`1px solid ${T.border}`,color:T.muted}}>
                            {it.name}: <span style={{color:T.accent,fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>{pkr(it.total)}</span>
                          </div>
                        ))}
                      </div>
                      {i===actH&&<div style={{marginTop:"7px",fontSize:"11px",color:T.accent,fontWeight:700}}>← Viewing in Calculator</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{marginTop:"8px",padding:"10px 14px",background:T.s2,borderRadius:"9px",border:`1px solid ${T.border}`,fontSize:"10px",color:T.muted,lineHeight:1.6}}>
              <strong style={{color:T.text}}>A.J. Nawab &amp; Co. Import Cost Calculator v2.0</strong> — Planning estimates only.
              Duty rates: Pakistan Customs Tariff 2025-26. Rate: {USD_PKR} PKR/USD. Port charges are indicative averages.
              Verify HS codes with a licensed customs agent (PCA/PIFFA) before finalizing.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
