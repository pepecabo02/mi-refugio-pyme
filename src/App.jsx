import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  AreaChart, Area
} from "recharts";

const styleEl = document.createElement("style");
styleEl.textContent = "@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap');";
document.head.appendChild(styleEl);

const P = {
  bg:"#f4f6fb", surface:"#ffffff", surface2:"#f0f3fa", border:"#dde2f0",
  text:"#1e2540", muted:"#7a85a3", gold:"#b8860b", goldLt:"#f5e9c8",
  blue:"#3b6fd4", green:"#2d9e6b", red:"#d94f4f", orange:"#d4730a",
};

const ASSETS = [
  {id:"oro",     name:"Oro (XAU)",         flag:"",   cat:"Materia Prima", corr:0.02, corrCrisis:0.05, sharpe:0.57, vol:17.0, var95:-5.2,  drawdown:-43.5, liquidity:10, pctPositivo:70},
  {id:"nzx",     name:"NZX 50 N. Zelanda", flag:"🇳🇿", cat:"Bursátil",      corr:0.52, corrCrisis:0.38, sharpe:0.45, vol:11.6, var95:-6.1,  drawdown:-49.2, liquidity:8,  pctPositivo:62},
  {id:"klci",    name:"KLCI Malasia",       flag:"🇲🇾", cat:"Bursátil",      corr:0.48, corrCrisis:0.21, sharpe:0.11, vol:11.7, var95:-5.8,  drawdown:-38.1, liquidity:7,  pctPositivo:58},
  {id:"ipsa",    name:"IPSA Chile",         flag:"🇨🇱", cat:"Bursátil",      corr:0.45, corrCrisis:0.41, sharpe:0.42, vol:16.5, var95:-8.9,  drawdown:-52.3, liquidity:7,  pctPositivo:57},
  {id:"idx",     name:"IDX Indonesia",      flag:"🇮🇩", cat:"Bursátil",      corr:0.48, corrCrisis:0.35, sharpe:0.40, vol:18.9, var95:-9.8,  drawdown:-61.2, liquidity:7,  pctPositivo:55},
  {id:"psei",    name:"PSEi Filipinas",     flag:"🇵🇭", cat:"Bursátil",      corr:0.47, corrCrisis:0.39, sharpe:0.19, vol:18.3, var95:-9.2,  drawdown:-58.4, liquidity:6,  pctPositivo:52},
  {id:"sempra",  name:"Sempra USA",         flag:"🇺🇸", cat:"Inmobiliario",  corr:0.38, corrCrisis:0.42, sharpe:0.34, vol:18.0, var95:-7.8,  drawdown:-34.5, liquidity:9,  pctPositivo:54},
  {id:"vnindex", name:"VN-Index Vietnam",   flag:"🇻🇳", cat:"Bursátil",      corr:0.38, corrCrisis:0.51, sharpe:0.27, vol:28.7, var95:-14.1, drawdown:-78.4, liquidity:5,  pctPositivo:48},
  {id:"plata",   name:"Plata (XAG)",        flag:"",   cat:"Materia Prima", corr:0.14, corrCrisis:0.28, sharpe:0.31, vol:32.0, var95:-12.3, drawdown:-67.8, liquidity:10, pctPositivo:56},
  {id:"mitsui",  name:"Mitsui Fudosan",     flag:"🇯🇵", cat:"Inmobiliario",  corr:0.50, corrCrisis:0.68, sharpe:0.16, vol:30.2, var95:-13.5, drawdown:-71.3, liquidity:5,  pctPositivo:43},
];

const CAT_COLORS = {"Materia Prima":P.gold,"Bursátil":P.blue,"Inmobiliario":P.green};

const CRISES = {
  subprime:{
    label:"Crisis Subprime (2008-09)", short:"2008-09", ibexDrop:-42.39,
    data:[
      {m:"Ene-08",A:1000000,B:1000000,C:1000000},{m:"Mar-08",A:921000,B:945000,C:968000},
      {m:"Jun-08",A:851000,B:892000,C:932000},{m:"Sep-08",A:703000,B:769000,C:828000},
      {m:"Dic-08",A:620000,B:712000,C:779000},{m:"Mar-09",A:591000,B:698000,C:769000},
      {m:"Jun-09",A:648000,B:741000,C:826000},{m:"Sep-09",A:788000,B:872000,C:962000},
      {m:"Dic-09",A:902563,B:960501,C:1032083},
    ],
    results:{
      A:{final:902563, maxDrop:-42.4, sharpe:-0.5176},
      B:{final:960501, maxDrop:-35.9, sharpe:-0.3582},
      C:{final:1032083,maxDrop:-27.9, sharpe:-0.0065},
    },
    assetReturns:{ibex:-0.424,oro:0.151,nzx:-0.089,klci:-0.065,ipsa:-0.122,idx:-0.138,psei:-0.160,sempra:0.019,vnindex:-0.185,plata:0.062,mitsui:-0.210},
  },
  deuda:{
    label:"Crisis Deuda Soberana (2010-12)", short:"2010-12", ibexDrop:-44.37,
    data:[
      {m:"Ene-10",A:1000000,B:1000000,C:1000000},{m:"Jun-10",A:852000,B:952000,C:1089000},
      {m:"Dic-10",A:798000,B:987000,C:1178000},{m:"Jun-11",A:712000,B:961000,C:1298000},
      {m:"Dic-11",A:631000,B:924000,C:1389000},{m:"Jun-12",A:598000,B:918000,C:1401000},
      {m:"Sep-12",A:668000,B:968000,C:1445000},{m:"Dic-12",A:746047,B:1018310,C:1470188},
    ],
    results:{
      A:{final:746047,  maxDrop:-44.4, sharpe:-0.5711},
      B:{final:1018310, maxDrop:-16.4, sharpe:-0.1687},
      C:{final:1470188, maxDrop:0.0,   sharpe:0.9923},
    },
    assetReturns:{ibex:-0.443,oro:0.312,nzx:0.121,klci:0.089,ipsa:0.072,idx:0.198,psei:0.055,sempra:0.089,vnindex:0.241,plata:0.201,mitsui:-0.098},
  },
  covid:{
    label:"Crisis COVID-19 (2020-21)", short:"2020-21", ibexDrop:-31.12,
    data:[
      {m:"Ene-20",A:1000000,B:1000000,C:1000000},{m:"Feb-20",A:942000,B:958000,C:971000},
      {m:"Mar-20",A:688756,B:767639,C:825292},{m:"Jun-20",A:752000,B:812000,C:882000},
      {m:"Sep-20",A:801000,B:858000,C:942000},{m:"Dic-20",A:841000,B:901000,C:998000},
      {m:"Jun-21",A:892000,B:951000,C:1048000},{m:"Dic-21",A:930176,B:996630,C:1095176},
    ],
    results:{
      A:{final:930176, maxDrop:-31.1, sharpe:-0.2228},
      B:{final:996630, maxDrop:-23.2, sharpe:-0.0951},
      C:{final:1095176,maxDrop:-17.5, sharpe:0.2593},
    },
    assetReturns:{ibex:-0.311,oro:0.198,nzx:0.089,klci:0.012,ipsa:-0.041,idx:0.042,psei:-0.052,sempra:0.095,vnindex:0.108,plata:0.142,mitsui:-0.072},
  },
};

// IPC acumulado España base 2005=1.000 (fuente: INE / Eurostat)
// Cada valor = cuánto cuestan en ese año los mismos bienes que costaban 1€ en 2005
const IPC_ES = {
  "2005":1.000,"2006":1.036,"2007":1.063,"2008":1.105,"2009":1.100,
  "2010":1.118,"2011":1.151,"2012":1.183,"2013":1.193,"2014":1.191,
  "2015":1.191,"2016":1.189,"2017":1.210,"2018":1.231,"2019":1.239,
  "2020":1.232,"2021":1.265,"2022":1.378,"2023":1.441,"2024":1.474,
  "2025":1.506,"Mar-26":1.521,
};

const LIFETIME_PTS = [
  {m:"2005",A:1000000,B:1000000,C:1000000,yr:0},
  {m:"2006",A:1218000,B:1289000,C:1341000,yr:1},
  {m:"2007",A:1489000,B:1548000,C:1612000,yr:2},
  {m:"2008",A:858000, B:1012000,C:1201000,yr:3},
  {m:"2009",A:1108000,B:1198000,C:1389000,yr:4},
  {m:"2010",A:1082000,B:1321000,C:1698000,yr:5},
  {m:"2011",A:891000, B:1241000,C:1872000,yr:6},
  {m:"2012",A:812000, B:1289000,C:1942000,yr:7},
  {m:"2013",A:1021000,B:1498000,C:2089000,yr:8},
  {m:"2014",A:1189000,B:1712000,C:2301000,yr:9},
  {m:"2015",A:1089000,B:1698000,C:2398000,yr:10},
  {m:"2016",A:1042000,B:1698000,C:2512000,yr:11},
  {m:"2017",A:1289000,B:2012000,C:2798000,yr:12},
  {m:"2018",A:1198000,B:1942000,C:2721000,yr:13},
  {m:"2019",A:1389000,B:2201000,C:3012000,yr:14},
  {m:"2020",A:1212000,B:2089000,C:3198000,yr:15},
  {m:"2021",A:1398000,B:2389000,C:3498000,yr:16},
  {m:"2022",A:1189000,B:2212000,C:3312000,yr:17},
  {m:"2023",A:1289000,B:2398000,C:3621000,yr:18},
  {m:"2024",A:1412000,B:2598000,C:3921000,yr:19},
  {m:"2025",A:1498000,B:2798000,C:4198000,yr:20},
  {m:"Mar-26",A:1521000,B:2841000,C:4289000,yr:21.25},
];

const WEIGHT_LABELS = {
  corr:"Correlación IBEX (completo)", corrCrisis:"Correlación IBEX en crisis",
  sharpe:"Ratio Sharpe ajustado (€)", vol:"Volatilidad anualizada",
  liquidity:"Liquidez y accesibilidad", drawdown:"Máximo Drawdown",
  var95:"VaR histórico 95% mensual", pctPositivo:"% meses positivos (IBEX cae)",
};
const WEIGHTS_DEFAULT = {corr:5,corrCrisis:18,sharpe:22,vol:15,liquidity:6,drawdown:12,var95:12,pctPositivo:10};

const ANNUAL_MU  = {ibex:0.035,oro:0.045,nzx:0.070,klci:0.055,ipsa:0.050,idx:0.075,psei:0.058,sempra:0.060,vnindex:0.080,plata:0.035,mitsui:0.030};
const ANNUAL_RET = {ibex:0.021,oro:0.081,nzx:0.098,klci:0.052,ipsa:0.071,idx:0.103,psei:0.064,sempra:0.087,vnindex:0.121,plata:0.058,mitsui:0.042};
const ANNUAL_VOL = {ibex:0.220,oro:0.160,nzx:0.120,klci:0.120,ipsa:0.170,idx:0.190,psei:0.185,sempra:0.175,vnindex:0.280,plata:0.310,mitsui:0.302};

function normMinMax(vals, hi) {
  const mn = Math.min(...vals), mx = Math.max(...vals);
  if (mx === mn) return vals.map(() => 5.5);
  return vals.map(v => hi ? 1+9*(v-mn)/(mx-mn) : 1+9*(mx-v)/(mx-mn));
}

function computeScores(weights) {
  const tot = Object.values(weights).reduce((a,b) => a+b, 0) || 100;
  const w = Object.fromEntries(Object.entries(weights).map(([k,v]) => [k, v/tot]));
  const dims = {
    corr:{vals:ASSETS.map(a=>a.corr),hi:false}, corrCrisis:{vals:ASSETS.map(a=>a.corrCrisis),hi:false},
    sharpe:{vals:ASSETS.map(a=>a.sharpe),hi:true}, vol:{vals:ASSETS.map(a=>a.vol),hi:false},
    liquidity:{vals:ASSETS.map(a=>a.liquidity),hi:true}, drawdown:{vals:ASSETS.map(a=>a.drawdown),hi:false},
    var95:{vals:ASSETS.map(a=>a.var95),hi:false}, pctPositivo:{vals:ASSETS.map(a=>a.pctPositivo),hi:true},
  };
  const norm = {};
  for (const [k,{vals,hi}] of Object.entries(dims)) norm[k] = normMinMax(vals, hi);
  return ASSETS.map((a,i) => ({
    ...a,
    computedScore: Object.keys(dims).reduce((s,k) => s + w[k]*norm[k][i], 0)
  })).sort((a,b) => b.computedScore - a.computedScore);
}

function simulateCrisis(alloc, crisisKey) {
  const c = CRISES[crisisKey];
  let totalReturn = 0;
  for (const [id, pct] of Object.entries(alloc)) totalReturn += (pct/100) * (c.assetReturns[id] || 0);
  const final = Math.round(1000000 * (1 + totalReturn));
  const data = c.data.map((pt, i) => {
    const prog = i / (c.data.length - 1);
    return {...pt, Custom: Math.round(1000000 * (1 + totalReturn * prog * (0.7 + 0.3*prog)))};
  });
  return {final, totalReturn, maxDrop: +(totalReturn*100).toFixed(1), vsA: final - c.results.A.final, data};
}

function simulateLifetime(alloc) {
  let portReturn = 0;
  for (const [id, pct] of Object.entries(alloc)) portReturn += (pct/100) * (ANNUAL_RET[id] || 0);
  const final = Math.round(1000000 * Math.pow(1 + portReturn, 21.25));
  return {final, annualReturn: +(portReturn*100).toFixed(2), totalReturn: +(((final/1000000)-1)*100).toFixed(1)};
}

function generateForecast(alloc, horizon) {
  let mu = 0, vol2 = 0;
  for (const [id, pct] of Object.entries(alloc)) {
    const wt = pct/100;
    mu   += wt * (ANNUAL_MU[id]  || 0);
    vol2 += wt * wt * Math.pow(ANNUAL_VOL[id] || 0, 2);
  }
  const mMu = mu/12, mVol = Math.sqrt(vol2/12);
  const N = 12 * horizon;
  const paths = [];
  for (let s = 0; s < 1000; s++) {
    let v = 1000000;
    for (let m = 0; m < N; m++) {
      const u1 = Math.random(), u2 = Math.random();
      const z = Math.sqrt(-2*Math.log(u1)) * Math.cos(2*Math.PI*u2);
      v *= Math.exp((mMu - 0.5*mVol*mVol) + mVol*z);
    }
    paths.push(v);
  }
  paths.sort((a,b) => a-b);
  const p10 = paths[99], p50 = paths[499], p90 = paths[899];
  const chartData = [{m:"Hoy", base:1000000, p10:1000000, p90:1000000}];
  for (let m = 1; m <= N; m++) {
    const t = m/N;
    chartData.push({
      m: "M"+m,
      base: Math.round(1000000 * Math.exp(mu * m/12)),
      p10:  Math.round(1000000 + (p10-1000000)*t),
      p90:  Math.round(1000000 + (p90-1000000)*t),
    });
  }
  return {p10:Math.round(p10), p50:Math.round(p50), p90:Math.round(p90), chartData, mu:+(mu*100).toFixed(2), vol:+(Math.sqrt(vol2)*100).toFixed(1)};
}

const fmt = n => new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);
const fmtPct = n => (n>0?"+":"")+Number(n).toFixed(1)+"%";
const cardStyle = (extra) => Object.assign({background:P.surface,border:"1px solid "+P.border,borderRadius:14,padding:20}, extra);
const labelStyle = {fontSize:11,letterSpacing:3,color:P.gold,textTransform:"uppercase",marginBottom:14};

function KPI({title, value, sub, good}) {
  const color = good === undefined ? P.text : good ? P.green : P.red;
  return (
    <div style={cardStyle({textAlign:"center",flex:1,minWidth:140})}>
      <div style={{fontSize:11,color:P.muted,marginBottom:6}}>{title}</div>
      <div style={{fontSize:20,fontWeight:700,color}}>{value}</div>
      {sub && <div style={{fontSize:11,color:P.muted,marginTop:4}}>{sub}</div>}
    </div>
  );
}

function Tag({cat}) {
  const c = CAT_COLORS[cat] || P.muted;
  return <span style={{fontSize:10,background:c+"18",color:c,border:"1px solid "+c+"33",borderRadius:5,padding:"2px 7px"}}>{cat}</span>;
}

function AllocSlider({asset, color, value, onChange}) {
  const c = color || P.blue;
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
        <span style={{fontSize:12,color:P.text,fontWeight:600}}>{asset}</span>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <input type="number" min={0} max={100} value={value} onChange={e => onChange(+e.target.value)}
            style={{width:46,padding:"2px 4px",border:"1px solid "+P.border,borderRadius:5,textAlign:"center",fontSize:12,color:P.text,background:P.surface2,fontFamily:"inherit"}}/>
          <span style={{fontSize:11,color:P.muted}}>%</span>
        </div>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={e => onChange(+e.target.value)}
        style={{width:"100%",accentColor:c,cursor:"pointer"}}/>
    </div>
  );
}

const INIT_ALLOC = {ibex:60,oro:15,nzx:10,klci:0,ipsa:0,idx:10,psei:0,sempra:5,vnindex:0,plata:0,mitsui:0};
const PRESETS = [
  {label:"A — 100% IBEX",        a:{ibex:100,oro:0, nzx:0, klci:0,ipsa:0,idx:0, psei:0,sempra:0,vnindex:0,plata:0, mitsui:0}},
  {label:"B — Óptima",           a:{ibex:60, oro:20,nzx:10,klci:0,ipsa:0,idx:10,psei:0,sempra:0,vnindex:0,plata:0, mitsui:0}},
  {label:"C — Máx. Refugio",     a:{ibex:15, oro:40,nzx:20,klci:5,ipsa:0,idx:15,psei:0,sempra:0,vnindex:0,plata:10,mitsui:0}},
];

const ASSET_COLORS = {ibex:"#888",oro:P.gold,nzx:P.blue,klci:"#5ba3c9",ipsa:"#7b68c8",idx:"#4a90c4",psei:"#8e6bbf",sempra:P.green,vnindex:"#e07b39",plata:"#9aabbb",mitsui:"#6ab187"};

export default function App() {
  const [tab, setTab]       = useState("scoring");
  const [weights, setWeights] = useState(WEIGHTS_DEFAULT);
  const [crisis, setCrisis] = useState("subprime");
  const [capital, setCapital] = useState(1000000);
  const [alloc, setAlloc]   = useState(INIT_ALLOC);
  const [showRadar, setShowRadar] = useState(null);
  const [horizon, setHorizon] = useState(1);
  const [realMode, setRealMode] = useState(false);

  const totalAlloc = Object.values(alloc).reduce((a,b) => a+b, 0);
  const allocOk    = totalAlloc === 100;

  const setA = (id, v) => setAlloc(prev => ({...prev, [id]: +v}));
  const scored  = useMemo(() => computeScores(weights), [weights]);
  const wTotal  = Object.values(weights).reduce((a,b) => a+b, 0);
  const simCrisis  = useMemo(() => simulateCrisis(alloc, crisis),  [alloc, crisis]);
  const simLT      = useMemo(() => simulateLifetime(alloc),        [alloc]);
  const simForecast = useMemo(() => generateForecast(alloc, horizon), [alloc, horizon]);

  const c = CRISES[crisis];
  const scalePt = (v) => Math.round(v * capital / 1000000);

  const crisisChart = c.data.map((pt, i) => ({
    m: pt.m,
    A: scalePt(pt.A), B: scalePt(pt.B), C: scalePt(pt.C),
    Custom: scalePt(simCrisis.data[i] ? simCrisis.data[i].Custom : 0),
  }));

  const ltChart = LIFETIME_PTS.map(pt => ({
    m: pt.m,
    A: scalePt(pt.A), B: scalePt(pt.B), C: scalePt(pt.C),
    Custom: Math.round(capital * Math.pow(1 + simLT.annualReturn/100, pt.yr)),
  }));

  const fwdChart = simForecast.chartData.map(d => ({
    m: d.m,
    base: scalePt(d.base), p10: scalePt(d.p10), p90: scalePt(d.p90),
  }));

  const tooltipStyle = {background:P.surface,border:"1px solid "+P.border,borderRadius:8,fontFamily:"Nunito"};

  const AllocPanel = (
    <div style={cardStyle({minWidth:260})}>
      <div style={labelStyle}>Cartera personalizada</div>
      <div style={{marginBottom:14,padding:"10px 14px",background:P.surface2,borderRadius:10,textAlign:"center",border:"1px solid "+(allocOk?P.green+"44":P.red+"44")}}>
        <div style={{fontSize:11,color:P.muted,marginBottom:3}}>Total asignado</div>
        <div style={{fontSize:26,fontWeight:700,color:allocOk?P.green:P.red}}>{totalAlloc}%</div>
        {!allocOk && <div style={{fontSize:11,color:P.red}}>Debe sumar 100%</div>}
      </div>
      <AllocSlider asset="IBEX 35"         color={ASSET_COLORS.ibex}    value={alloc.ibex}     onChange={v=>setA("ibex",v)}/>
      {ASSETS.map(a => (
        <AllocSlider key={a.id} asset={a.name} color={ASSET_COLORS[a.id]} value={alloc[a.id]} onChange={v=>setA(a.id,v)}/>
      ))}
      <div style={{marginTop:14,borderTop:"1px solid "+P.border,paddingTop:14}}>
        <div style={{fontSize:11,color:P.muted,marginBottom:8}}>Carteras de referencia (TFM):</div>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => setAlloc(p.a)}
            style={{width:"100%",marginBottom:5,background:P.surface2,border:"1px solid "+P.border,color:P.text,borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,textAlign:"left",fontFamily:"inherit"}}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );

  const tabs = [
    {id:"scoring",   label:"📊 Scoring"},
    {id:"simulator", label:"🧪 Simulador Crisis"},
    {id:"lifetime",  label:"📅 Histórico Completo"},
    {id:"forecast",  label:"🔭 Proyección"},
    {id:"compare",   label:"📈 Comparativa"},
    {id:"guide",     label:"📖 Guía"},
  ];

  return (
    <div style={{fontFamily:"'Nunito',system-ui,sans-serif",background:P.bg,color:P.text,minHeight:"100vh",fontWeight:300}}>
      <div style={{background:P.surface,borderBottom:"1px solid "+P.border,padding:"22px 32px 0"}}>
        <div style={{maxWidth:1180,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontSize:10,letterSpacing:4,color:P.gold,textTransform:"uppercase",marginBottom:5}}>Herramienta de Gestión de Tesorería · PYME</div>
              <h1 style={{margin:0,fontSize:24,fontWeight:600,color:P.text}}>Refugio PYME <span style={{color:P.gold}}>·</span> Diversificación Corporativa</h1>
              <p style={{margin:"5px 0 0",fontSize:12,color:P.muted}}>Análisis 2005–Mar 2026 · 10 activos · 3 episodios de crisis · proyección Monte Carlo</p>
            </div>
            <div style={{background:P.surface2,border:"1px solid "+P.border,borderRadius:10,padding:"8px 16px",textAlign:"center"}}>
              <div style={{fontSize:10,color:P.muted,letterSpacing:2,marginBottom:3}}>CAPITAL BASE</div>
              <input type="number" value={capital} onChange={e => setCapital(+e.target.value)} step={100000}
                style={{background:"none",border:"none",color:P.gold,fontSize:20,fontWeight:700,width:148,textAlign:"center",fontFamily:"inherit",outline:"none"}}/>
              <div style={{fontSize:10,color:P.muted}}>euros</div>
            </div>
          </div>
          <div style={{display:"flex",gap:0,marginTop:18,overflowX:"auto"}}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background:"transparent", color:tab===t.id?P.gold:P.muted,
                border:"none", borderBottom:"3px solid "+(tab===t.id?P.gold:"transparent"),
                padding:"10px 18px",cursor:"pointer",fontFamily:"inherit",fontSize:13,
                fontWeight:tab===t.id?600:400,whiteSpace:"nowrap",transition:"all .15s",
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1180,margin:"0 auto",padding:"28px 32px"}}>

        {tab === "scoring" && (
          <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:22}}>
            <div style={cardStyle()}>
              <div style={labelStyle}>Ponderaciones del modelo</div>
              <div style={{fontSize:11,color:P.muted,marginBottom:14}}>
                Total: <span style={{color:wTotal===100?P.green:P.red,fontWeight:600}}>{wTotal}%</span>
              </div>
              {Object.keys(WEIGHT_LABELS).map(k => (
                <div key={k} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:11,color:P.muted}}>{WEIGHT_LABELS[k]}</span>
                    <span style={{fontSize:12,fontWeight:700,color:P.gold}}>{weights[k]}%</span>
                  </div>
                  <input type="range" min={0} max={40} value={weights[k]}
                    onChange={e => setWeights(w => ({...w, [k]:+e.target.value}))}
                    style={{width:"100%",accentColor:P.gold,cursor:"pointer"}}/>
                </div>
              ))}
              <button onClick={() => setWeights(WEIGHTS_DEFAULT)}
                style={{width:"100%",marginTop:8,background:P.surface2,border:"1px solid "+P.border,color:P.muted,borderRadius:8,padding:"8px 0",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
                ↺ Restaurar ponderaciones TFM
              </button>
            </div>
            <div>
              <div style={labelStyle}>Ranking · haz clic en un activo para ver su perfil</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {scored.map((a,i) => (
                  <div key={a.id}>
                    <div onClick={() => setShowRadar(showRadar===a.id?null:a.id)}
                      style={cardStyle({padding:"12px 16px",cursor:"pointer",display:"grid",gridTemplateColumns:"36px 1fr auto",alignItems:"center",gap:12,borderLeft:"4px solid "+(CAT_COLORS[a.cat]||P.muted),boxShadow:showRadar===a.id?"0 0 0 2px "+P.gold+"55":"none"})}>
                      <div style={{fontSize:20,fontWeight:700,color:i<3?P.gold:P.border,textAlign:"center"}}>{i+1}</div>
                      <div>
                        <span style={{fontWeight:600,fontSize:14,marginRight:8}}>{a.name}</span><Tag cat={a.cat}/>
                        <div style={{fontSize:11,color:P.muted,marginTop:3}}>
                          Corr: {a.corr.toFixed(2)} · Sharpe: {a.sharpe.toFixed(2)} · Vol: {a.vol.toFixed(1)}% · Drawdown: {a.drawdown}%
                        </div>
                      </div>
                      <div style={{background:(a.computedScore>=7?P.green:a.computedScore>=5?P.gold:P.red)+"18",color:a.computedScore>=7?P.green:a.computedScore>=5?P.gold:P.red,border:"1px solid "+(a.computedScore>=7?P.green:a.computedScore>=5?P.gold:P.red)+"44",borderRadius:7,padding:"3px 10px",fontSize:13,fontWeight:700}}>
                        {a.computedScore.toFixed(3)}
                      </div>
                    </div>
                    {showRadar===a.id && (
                      <div style={cardStyle({borderTop:"none",borderTopLeftRadius:0,borderTopRightRadius:0,borderColor:P.gold+"44"})}>
                        <ResponsiveContainer width="100%" height={200}>
                          <RadarChart data={Object.keys(WEIGHT_LABELS).map(k => {
                            const vals = ASSETS.map(x => x[k]);
                            const mn = Math.min(...vals), mx = Math.max(...vals);
                            const hi = ["sharpe","liquidity","pctPositivo"].includes(k);
                            const norm = hi ? ((a[k]-mn)/(mx-mn))*9+1 : ((mx-a[k])/(mx-mn))*9+1;
                            return {subject:WEIGHT_LABELS[k].split(" ")[0], value:+norm.toFixed(1), fullMark:10};
                          })}>
                            <PolarGrid stroke={P.border}/>
                            <PolarAngleAxis dataKey="subject" tick={{fill:P.muted,fontSize:10}}/>
                            <Radar dataKey="value" stroke={P.gold} fill={P.gold} fillOpacity={0.2}/>
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "simulator" && (
          <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:22}}>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {AllocPanel}
              <div style={cardStyle()}>
                <div style={labelStyle}>Seleccionar crisis</div>
                {Object.entries(CRISES).map(([k,cr]) => (
                  <button key={k} onClick={() => setCrisis(k)}
                    style={{width:"100%",marginBottom:7,background:crisis===k?P.gold:P.surface2,color:crisis===k?"#fff":P.text,border:"1px solid "+(crisis===k?P.gold:P.border),borderRadius:9,padding:"9px 14px",cursor:"pointer",fontSize:13,textAlign:"left",fontFamily:"inherit",fontWeight:crisis===k?600:300}}>
                    {cr.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={labelStyle}>Resultado · {c.label}</div>
              <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
                <KPI title="Valor final (mi cartera)" value={fmt(simCrisis.final*capital/1000000)} good={simCrisis.final>=1000000}/>
                <KPI title="Caída máxima" value={fmtPct(simCrisis.maxDrop)} good={simCrisis.maxDrop>-20}/>
                <KPI title="vs. solo IBEX" value={fmt(simCrisis.vsA*capital/1000000)} good={simCrisis.vsA>0}/>
                <KPI title="IBEX en esta crisis" value={fmtPct(c.ibexDrop)} good={false}/>
              </div>
              <div style={cardStyle()}>
                <div style={{fontSize:12,color:P.muted,marginBottom:12}}>Evolución del capital durante la crisis (base = {fmt(capital)})</div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={crisisChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke={P.border}/>
                    <XAxis dataKey="m" tick={{fill:P.muted,fontSize:11}}/>
                    <YAxis tickFormatter={v => (v/1000000).toFixed(2)+"M"} tick={{fill:P.muted,fontSize:11}}/>
                    <Tooltip formatter={(v,n) => [fmt(v),n]} contentStyle={tooltipStyle} labelStyle={{color:P.gold,fontWeight:600}}/>
                    <Legend/>
                    <ReferenceLine y={capital} stroke={P.border} strokeDasharray="4 4"/>
                    <Line dataKey="A" name="A – 100% IBEX" stroke="#aaa" strokeWidth={2} dot={false}/>
                    <Line dataKey="B" name="B – Óptima" stroke={P.blue} strokeWidth={2} dot={false}/>
                    <Line dataKey="C" name="C – Máx. Refugio" stroke={P.green} strokeWidth={2} dot={false}/>
                    <Line dataKey="Custom" name="Mi cartera" stroke={P.gold} strokeWidth={3} dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {!allocOk && <div style={{marginTop:12,padding:12,background:P.red+"11",border:"1px solid "+P.red+"44",borderRadius:8,fontSize:13,color:P.red}}>⚠️ La cartera no suma 100%.</div>}
            </div>
          </div>
        )}

        {tab === "lifetime" && (
          <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:22}}>
            {AllocPanel}
            <div>
              <div style={labelStyle}>Histórico completo · Ene 2005 – Mar 2026 (21 años)</div>
              {(() => {
                const ipc0 = IPC_ES["2005"];

                const ltChartAdj = LIFETIME_PTS.map(pt => {
                  const ipc = IPC_ES[pt.m] || 1.521;
                  const deflate = realMode ? (ipc0 / ipc) : 1;
                  const customNom = Math.round(capital * Math.pow(1 + simLT.annualReturn/100, pt.yr));
                  return {
                    m: pt.m,
                    A:      Math.round(pt.A      * capital/1000000 * deflate),
                    B:      Math.round(pt.B      * capital/1000000 * deflate),
                    C:      Math.round(pt.C      * capital/1000000 * deflate),
                    Custom: Math.round(customNom * deflate),
                    IPC:    Math.round(capital   * (ipc/ipc0)),
                  };
                });

                const lastPt = ltChartAdj[ltChartAdj.length-1];
                const ipcFinal = IPC_ES["Mar-26"];
                const deflFinal = realMode ? (ipc0/ipcFinal) : 1;
                const ltFinalAdj = Math.round(simLT.final * capital/1000000 * deflFinal);
                const ltTotalAdj = +(((ltFinalAdj/capital)-1)*100).toFixed(1);
                const cFinalAdj  = Math.round(4289000 * capital/1000000 * deflFinal);
                const aFinalAdj  = Math.round(1521000 * capital/1000000 * deflFinal);
                const aTotalAdj  = +(((aFinalAdj/capital)-1)*100).toFixed(1);

                return (
                  <>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                      <span style={{fontSize:12,color:P.muted}}>Mostrar en:</span>
                      {[{v:false,l:"Nominal"},{v:true,l:"Real (ajustado IPC España)"}].map(o => (
                        <button key={String(o.v)} onClick={() => setRealMode(o.v)}
                          style={{padding:"5px 14px",borderRadius:7,border:"1px solid "+(realMode===o.v?P.blue:P.border),background:realMode===o.v?P.blue:P.surface2,color:realMode===o.v?"#fff":P.text,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:realMode===o.v?600:300}}>
                          {o.l}
                        </button>
                      ))}
                      {realMode && <span style={{fontSize:11,color:P.muted,fontStyle:"italic"}}>€ de 2005 · IPC INE/Eurostat</span>}
                    </div>

                    <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
                      <KPI title={"Capital final (mi cartera)"+(realMode?" real":"")} value={fmt(ltFinalAdj)} good={ltFinalAdj>capital}/>
                      <KPI title="Rentabilidad anualizada" value={fmtPct(simLT.annualReturn-(realMode?2.1:0))} good={(simLT.annualReturn-(realMode?2.1:0))>0} sub={realMode?"aprox. descontada inflación media":"nominal"}/>
                      <KPI title={"Rentabilidad total"+(realMode?" real":"")} value={fmtPct(ltTotalAdj)} good={ltTotalAdj>0}/>
                      <KPI title={"A – IBEX"+(realMode?" real":"")} value={fmtPct(aTotalAdj)} good={aTotalAdj>0} sub={realMode?"poder adquisitivo":"nominal"}/>
                    </div>

                    <div style={cardStyle()}>
                      <div style={{fontSize:12,color:P.muted,marginBottom:12}}>
                        Evolución del capital 2005–2026 · {realMode?"valores reales en € de 2005 (deflactados con IPC)":"valores nominales"} · base = {fmt(capital)}
                      </div>
                      <ResponsiveContainer width="100%" height={340}>
                        <LineChart data={ltChartAdj}>
                          <CartesianGrid strokeDasharray="3 3" stroke={P.border}/>
                          <XAxis dataKey="m" tick={{fill:P.muted,fontSize:11}}/>
                          <YAxis tickFormatter={v => (v/1000000).toFixed(1)+"M"} tick={{fill:P.muted,fontSize:11}}/>
                          <Tooltip formatter={(v,n) => [fmt(v),n]} contentStyle={tooltipStyle} labelStyle={{color:P.gold,fontWeight:600}}/>
                          <Legend/>
                          <ReferenceLine y={capital} stroke={P.border} strokeDasharray="4 4" label={{value:"Capital inicial",fill:P.muted,fontSize:10}}/>
                          {realMode && <Line dataKey="IPC" name="Erosión inflación (coste vida)" stroke={P.red} strokeWidth={1.5} dot={false} strokeDasharray="6 3"/>}
                          <Line dataKey="A" name="A – 100% IBEX" stroke="#aaa" strokeWidth={2} dot={false}/>
                          <Line dataKey="B" name="B – Óptima" stroke={P.blue} strokeWidth={2} dot={false}/>
                          <Line dataKey="C" name="C – Máx. Refugio" stroke={P.green} strokeWidth={2} dot={false}/>
                          <Line dataKey="Custom" name="Mi cartera" stroke={P.gold} strokeWidth={3} dot={false}/>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={cardStyle({marginTop:16,background:realMode?"#f0f7ff":""+P.goldLt,border:"1px solid "+(realMode?P.blue+"44":P.gold+"44")})}>
                      <div style={{fontSize:13,color:realMode?P.blue:P.gold,fontWeight:600,marginBottom:8}}>
                        {realMode?"Lectura en términos reales":"Lectura en términos nominales"}
                      </div>
                      {realMode ? (
                        <p style={{fontSize:13,lineHeight:1.75,color:P.text,margin:0}}>
                          Ajustando por el IPC español acumulado (~+52% entre 2005 y 2026), la <strong>Cartera A (100% IBEX)</strong> no sólo no creció en términos reales — su poder adquisitivo <strong>cayó</strong>. Para preservar capital real se necesitó, como mínimo, una rentabilidad nominal superior a la inflación acumulada. La Cartera C lo logró con amplio margen.
                        </p>
                      ) : (
                        <p style={{fontSize:13,lineHeight:1.75,color:P.text,margin:0}}>
                          En 21 años (2005–2026), la <strong>Cartera A (100% IBEX)</strong> acumuló apenas un <strong>+52%</strong> nominal, frente al <strong>+329%</strong> de la Cartera C. La diferencia sobre 1 M€ supera los <strong>2,7 M€</strong>. Activa la vista real para ver el impacto de la inflación.
                        </p>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {tab === "forecast" && (
          <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:22}}>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {AllocPanel}
              <div style={cardStyle()}>
                <div style={labelStyle}>Parámetros de proyección</div>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:12,color:P.muted,marginBottom:8}}>Horizonte temporal</div>
                  {[1,3,5].map(h => (
                    <button key={h} onClick={() => setHorizon(h)}
                      style={{marginRight:8,marginBottom:6,background:horizon===h?P.gold:P.surface2,color:horizon===h?"#fff":P.text,border:"1px solid "+(horizon===h?P.gold:P.border),borderRadius:7,padding:"6px 16px",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:horizon===h?600:300}}>
                      {h} {h===1?"año":"años"}
                    </button>
                  ))}
                </div>
                <div style={{fontSize:11,color:P.muted,lineHeight:1.6}}>
                  Monte Carlo con 1.000 trayectorias y retornos log-normales. Los percentiles P10/P90 muestran el rango de incertidumbre del 80% central.
                </div>
              </div>
            </div>
            <div>
              <div style={labelStyle}>Proyección a {horizon} {horizon===1?"año":"años"} · Monte Carlo</div>
              <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
                <KPI title="Caso pesimista (P10)" value={fmt(simForecast.p10*capital/1000000)} good={simForecast.p10>1000000}/>
                <KPI title="Caso central (P50)"   value={fmt(simForecast.p50*capital/1000000)} good={simForecast.p50>1000000}/>
                <KPI title="Caso optimista (P90)"  value={fmt(simForecast.p90*capital/1000000)} good={true}/>
                <KPI title="Rentabilidad esperada" value={fmtPct(simForecast.mu)} good={simForecast.mu>3}/>
              </div>
              <div style={cardStyle()}>
                <div style={{fontSize:12,color:P.muted,marginBottom:12}}>Rango P10–P90 y trayectoria central esperada</div>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={fwdChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke={P.border}/>
                    <XAxis dataKey="m" tick={{fill:P.muted,fontSize:11}} interval={Math.floor(fwdChart.length/6)}/>
                    <YAxis tickFormatter={v => (v/1000000).toFixed(2)+"M"} tick={{fill:P.muted,fontSize:11}}/>
                    <Tooltip formatter={(v,n) => [fmt(v),n]} contentStyle={tooltipStyle} labelStyle={{color:P.gold,fontWeight:600}}/>
                    <Legend/>
                    <ReferenceLine y={capital} stroke={P.border} strokeDasharray="4 4" label={{value:"Capital inicial",fill:P.muted,fontSize:11}}/>
                    <Area type="monotone" dataKey="p90" name="P90 (optimista)" stroke={P.green} fill={P.green} fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 2"/>
                    <Area type="monotone" dataKey="base" name="Trayectoria central" stroke={P.gold} fill={P.gold} fillOpacity={0.15} strokeWidth={2.5}/>
                    <Area type="monotone" dataKey="p10" name="P10 (pesimista)" stroke={P.red} fill={P.red} fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 2"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={cardStyle({marginTop:16,background:"#fff8f0",border:"1px solid "+P.orange+"33"})}>
                <div style={{fontSize:13,color:P.orange,fontWeight:600,marginBottom:6}}>Aviso metodológico</div>
                <p style={{fontSize:12,lineHeight:1.7,color:P.muted,margin:0}}>
                  Esta proyección es <strong>ilustrativa</strong>. Se basa en rentabilidades históricas medias (2005–2026) y una simulación estocástica de retornos log-normales. No constituye una proyección de rentabilidad futura. Consulta siempre con un asesor financiero regulado.
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "compare" && (
          <div>
            <div style={labelStyle}>Comparativa de resultados · Las 3 crisis históricas</div>
            <div style={{overflowX:"auto",marginBottom:28}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{borderBottom:"2px solid "+P.border}}>
                    {["Crisis","Cartera","Valor final","Caída máx.","Sharpe crisis"].map(h => (
                      <th key={h} style={{padding:"10px 14px",textAlign:h==="Crisis"||h==="Cartera"?"left":"right",color:P.muted,fontWeight:400}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(CRISES).map(([ck,cr]) =>
                    ["A","B","C"].map((carta,j) => {
                      const r = cr.results[carta];
                      const col = carta==="A"?P.muted:carta==="B"?P.blue:P.green;
                      return (
                        <tr key={ck+carta} style={{borderBottom:"1px solid "+P.border,background:j%2===0?P.surface2:"transparent"}}>
                          {j===0 && <td rowSpan={3} style={{padding:"12px 14px",color:P.gold,fontWeight:600,verticalAlign:"middle"}}>{cr.short}</td>}
                          <td style={{padding:"10px 14px",color:col}}>{carta==="A"?"A — 100% IBEX":carta==="B"?"B — Óptima":"C — Máx. Refugio"}</td>
                          <td style={{padding:"10px 14px",textAlign:"right",fontWeight:600,color:r.final>=1000000?P.green:P.red}}>{fmt(r.final*capital/1000000)}</td>
                          <td style={{padding:"10px 14px",textAlign:"right",color:r.maxDrop<=-30?P.red:r.maxDrop<=-15?P.orange:P.green}}>{r.maxDrop.toFixed(1)}%</td>
                          <td style={{padding:"10px 14px",textAlign:"right",color:r.sharpe>=0?P.green:P.red}}>{r.sharpe.toFixed(4)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div style={cardStyle()}>
              <div style={{fontSize:12,color:P.muted,marginBottom:14}}>Valor final por crisis (base {fmt(capital)})</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={Object.entries(CRISES).map(([k,cr]) => ({
                  name: cr.short,
                  "A – IBEX": Math.round(cr.results.A.final*capital/1000000),
                  "B – Óptima": Math.round(cr.results.B.final*capital/1000000),
                  "C – Máx. Refugio": Math.round(cr.results.C.final*capital/1000000),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={P.border}/>
                  <XAxis dataKey="name" tick={{fill:P.muted,fontSize:12}}/>
                  <YAxis tickFormatter={v => (v/1000000).toFixed(2)+"M"} tick={{fill:P.muted,fontSize:11}}/>
                  <Tooltip formatter={v => [fmt(v)]} contentStyle={tooltipStyle}/>
                  <Legend/>
                  <ReferenceLine y={capital} stroke={P.border} strokeDasharray="4 4"/>
                  <Bar dataKey="A – IBEX" fill="#bbb" radius={[4,4,0,0]}/>
                  <Bar dataKey="B – Óptima" fill={P.blue} radius={[4,4,0,0]}/>
                  <Bar dataKey="C – Máx. Refugio" fill={P.green} radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={cardStyle({marginTop:18,background:P.goldLt,border:"1px solid "+P.gold+"44"})}>
              <div style={{fontSize:13,color:P.gold,fontWeight:600,marginBottom:8}}>Conclusión clave</div>
              <p style={{fontSize:13,lineHeight:1.75,color:P.text,margin:0}}>
                En la <strong>crisis de deuda soberana española (2010-2012)</strong>, la diferencia entre Cartera A y Cartera C fue de{" "}
                <strong style={{color:P.gold}}>{fmt((CRISES.deuda.results.C.final-CRISES.deuda.results.A.final)*capital/1000000)}</strong>.
                Esa brecha representa la diferencia entre sobrevivir o no con la tesorería intacta.
              </p>
            </div>
          </div>
        )}

        {tab === "guide" && (
          <div style={{maxWidth:760}}>
            <div style={labelStyle}>Guía de uso para directores financieros</div>
            {[
              {n:"01",title:"¿Qué es el home bias y por qué es un riesgo?",body:"La mayoría de las PYMEs españolas concentran su tesorería en activos domésticos (depósitos, IBEX), acumulando una doble exposición al ciclo económico nacional. Cuando la economía española empeora, el negocio sufre y la cartera de inversión cae simultáneamente."},
              {n:"02",title:"Cómo usar el Scoring",body:"El módulo clasifica los 10 activos internacionales según 8 dimensiones ponderadas. Ajusta los pesos según el perfil de riesgo de tu empresa. Haz clic en cualquier activo para ver su perfil radar dimensional."},
              {n:"03",title:"Simulador Crisis vs. Histórico Completo",body:"El Simulador Crisis muestra el comportamiento en 3 episodios concretos. El Histórico Completo cubre los 21 años del análisis (2005–2026), incluyendo períodos alcistas y bajistas, para una visión más representativa del largo plazo."},
              {n:"04",title:"Cómo interpretar la Proyección",body:"La pestaña de Proyección usa Monte Carlo con 1.000 trayectorias. El rango P10–P90 muestra el 80% central de los resultados posibles. Es una herramienta de sensibilidad, no una promesa. Usa horizontes de 1, 3 y 5 años para comparar."},
              {n:"05",title:"Cómo acceder a estos activos",body:"El oro es accesible mediante ETFs físicos UCITS (ej. iShares IGLN, TER 0,12%). Los índices emergentes (NZX, IDX) son accesibles a través de ETFs de iShares con TER ~0,47-0,57%. Con DEGIRO o Interactive Brokers es suficiente."},
              {n:"06",title:"Limitaciones a tener en cuenta",body:"Los resultados se calculan sobre retornos de índice sin costes de transacción. El efecto cambiario está incluido en el Sharpe ajustado en euros. Estos resultados son ilustrativos, no proyecciones de rentabilidad futura. Consulta siempre con un asesor regulado."},
            ].map(({n,title,body}) => (
              <div key={n} style={{display:"grid",gridTemplateColumns:"44px 1fr",gap:18,marginBottom:24,paddingBottom:24,borderBottom:"1px solid "+P.border}}>
                <div style={{fontSize:28,fontWeight:700,color:P.border,fontFamily:"monospace",lineHeight:1,paddingTop:4}}>{n}</div>
                <div>
                  <div style={{fontSize:15,fontWeight:600,color:P.text,marginBottom:8}}>{title}</div>
                  <div style={{fontSize:13,lineHeight:1.75,color:P.muted}}>{body}</div>
                </div>
              </div>
            ))}
            <div style={cardStyle({background:P.surface2,fontSize:12,color:P.muted,fontStyle:"italic"})}>
              Basado en: "Contagio bursátil y mercados refugio: un modelo multifactorial para la gestión del riesgo de tesorería en empresas españolas" (Cabo Rossignoli, J., 2026, Universidad Pontificia Comillas). Datos históricos: Bloomberg (2005–2026).
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


