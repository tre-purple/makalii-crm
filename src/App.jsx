import { useState, useMemo } from "react";

// Brand colors — Pantone 2766C (navy) + 7525C (sand/tan)
const BRAND = {
  navy:     "#1B2A4A",
  navyMid:  "#2D3F61",
  navyLight:"#E8EBF2",
  sand:     "#B5A48A",
  sandLight:"#F2EDE4",
  sandMid:  "#D6C9B2",
  black:    "#111111",
  gray:     "#6B6B6B",
  grayLight:"#F4F2EE",
  border:   "#DDD8CF",
  white:    "#FFFFFF",
  green:    "#3B6B3E",
  greenLight:"#E6F0E6",
  red:      "#8B2E2E",
  redLight: "#F5E8E8",
  amber:    "#8B6914",
  amberLight:"#FBF3E0",
};

const STAGES = ["Lead","Contacted","Meeting Set","Proposal Sent","Negotiating","Closed Won","Closed Lost"];
const STAGE_COLORS = { "Lead":BRAND.gray, "Contacted":BRAND.navy, "Meeting Set":BRAND.green, "Proposal Sent":BRAND.amber, "Negotiating":BRAND.sand, "Closed Won":BRAND.green, "Closed Lost":BRAND.red };
const STAGE_BG = { "Lead":BRAND.grayLight, "Contacted":BRAND.navyLight, "Meeting Set":BRAND.greenLight, "Proposal Sent":BRAND.amberLight, "Negotiating":BRAND.sandLight, "Closed Won":BRAND.greenLight, "Closed Lost":BRAND.redLight };
const SEGMENTS = ["Soil Testing Inquiry","Government/Policy","Nonprofit/Community","Research/Academic","Volunteer/Intern","Partnership","Data/Tech"];
const TIER_COLORS = { "Hot":BRAND.navy, "Warm":BRAND.sand, "Cold":BRAND.gray };
const TIER_BG = { "Hot":BRAND.navyLight, "Warm":BRAND.sandLight, "Cold":BRAND.grayLight };
const ISLANDS = ["Oʻahu","Hawaiʻi Island","Maui","Kauaʻi","Molokaʻi","Lānaʻi","Statewide","Mainland"];

const initContacts = [
  { id:1, firstName:"Destiny", lastName:"McDonalds", email:"destinymcdonald352@gmail.com", phone:"", org:"Private / Hana Property", segment:"Soil Testing Inquiry", tier:"Hot", stage:"Lead", island:"Maui", createdOn:"March 6, 2026", source:"Website", notes:"Detailed inquiry for multi-element soil panel (30+ elements), pH, ECe salinity, and renovation recs for tropical ornamentals near ocean in Hana area.", message:"Detailed element panel request: phosphorus, potassium, iron, manganese, copper, boron, calcium, magnesium, sodium, sulfur, molybdenum, nickel, aluminum, arsenic, cadmium, chromium, cobalt, lead, lithium, mercury, selenium, silver, strontium, tin, vanadium, barium. Also pH, ECe, and renovation recs for Hana tropical ornamentals.", value:350, tags:["Actionable","Multi-element","Hana"] },
  { id:2, firstName:"Robbie", lastName:"Melton", email:"robbie.melton@hisbdc.org", phone:"808-208-2825", org:"Hawaii Small Business Development Center", segment:"Partnership", tier:"Hot", stage:"Contacted", island:"Oʻahu", createdOn:"March 3, 2026", source:"Direct", notes:"Previously led HARC. Now at HISBDC. Has a client who could use lab services. Phone: 808-208-2825.", message:"Hi Daniel, We talked when I was leading HARC. I am now working at the Hawaii Small Business Development Center. I met with a client this morning who could possibly use your lab services.", value:5000, tags:["Referral","Actionable"] },
  { id:3, firstName:"Kris", lastName:"Aoki", email:"krisaoki@hawaii.edu", phone:"", org:"University of Hawaiʻi", segment:"Research/Academic", tier:"Hot", stage:"Lead", island:"Oʻahu", createdOn:"February 4, 2026", source:"Website", notes:"Requesting W-9 for UH faculty to submit samples. W-9 needed to onboard as vendor.", message:"Would I be able to get a copy of your W-9? One of our faculty would like to submit samples for testing.", value:3000, tags:["UH","Actionable","W9"] },
  { id:4, firstName:"Leilani", lastName:"Whittle", email:"lwhittle@kohalacenter.org", phone:"", org:"Kohala Center", segment:"Nonprofit/Community", tier:"Hot", stage:"Lead", island:"Hawaiʻi Island", createdOn:"January 29, 2026", source:"Website Signup", notes:"Asking about microbial and organic matter testing on lepo beyond standard elements. Kohala Center is a respected island research nonprofit.", message:"Wondering if you guys do microbial and organic matter tests on lepo besides the usual elements?", value:4000, tags:["Kohala","Actionable"] },
  { id:5, firstName:"Keolamau", lastName:"Tengan", email:"keolamau@kaehu.org", phone:"", org:"KAʻEHU (Maui Nonprofit)", segment:"Data/Tech", tier:"Warm", stage:"Lead", island:"Maui", createdOn:"November 4, 2025", source:"Website", notes:"Director of Org Development at Kaʻehu. Questions about data collection and stewardship. Wants a call or Zoom.", message:"Questions concerning data collection and stewardship and how we can better ensure the safety of monitoring data for a number of projects.", value:2000, tags:["Data","Zoom Request"] },
  { id:6, firstName:"Tara", lastName:"Flynn", email:"tara.flynn@hakuhia.org", phone:"808-286-7058", org:"Hakuhia", segment:"Nonprofit/Community", tier:"Hot", stage:"Lead", island:"Hawaiʻi Island", createdOn:"July 4, 2025", source:"Website", notes:"Looking to start soil sampling restoring ʻāina from 30 years as a golf course. Will host schools and community groups.", message:"Looking to start soil sampling as we move forward with pilot projects restoring the aina from 30 years as a golf course.", value:6000, tags:["Restoration","Actionable"] },
  { id:7, firstName:"Jeffrey", lastName:"Baucom", email:"jeffbaucom@gmail.com", phone:"", org:"Independent", segment:"Volunteer/Intern", tier:"Warm", stage:"Lead", island:"Oʻahu", createdOn:"June 2, 2025", source:"Website Signup", notes:"Oʻahu-based software engineer seeking pivot to regenerative ag. Interested in paid or unpaid internship.", message:"Software engineer seeking pivot to regenerative agriculture. Interested in paid or unpaid intern role.", value:0, tags:["Intern","Software"] },
  { id:8, firstName:"Leni", lastName:"Adams", email:"leni.adams08@gmail.com", phone:"", org:"Independent", segment:"Volunteer/Intern", tier:"Warm", stage:"Lead", island:"Oʻahu", createdOn:"March 16, 2025", source:"Event", notes:"Met Daniel at Design 4 ʻĀina event. Interested in offering extra hands for projects.", message:"I was at the Design 4 ʻĀina event where you were a panelist. I'm interested in your work and would love to offer extra hands.", value:0, tags:["Volunteer","Event"] },
  { id:9, firstName:"Kaiea", lastName:"Medeiros", email:"kaiea.e.medeiros@mauicounty.gov", phone:"", org:"Maui County", segment:"Government/Policy", tier:"Warm", stage:"Lead", island:"Maui", createdOn:"October 29, 2024", source:"Website", notes:"Maui County inquiry about how MM empowers ʻāina practitioners and demonstrates measurable benefits for policymakers.", message:"How does Makaliʻi Metrics empower ʻāina practitioners with analytical tools and data to enhance their impact?", value:8000, tags:["County","Policy"] },
  { id:10, firstName:"Sean", lastName:"Quinlan", email:"repquinlan@capitol.hawaii.gov", phone:"", org:"HI State House — Majority Leader", segment:"Government/Policy", tier:"Hot", stage:"Meeting Set", island:"Oʻahu", createdOn:"January 27, 2026", source:"Capitol Opening Day", notes:"House Majority Leader. Zoom held Feb 5. Needs follow-up.", message:"Reached out Jan 27 2026 after Opening Day at State Capitol. Zoom held Feb 5.", value:15000, tags:["Legislature","Follow-up Needed"] },
  { id:11, firstName:"Sunshine", lastName:"David", email:"s.david@capitol.hawaii.gov", phone:"", org:"Office of Rep. Quinlan", segment:"Government/Policy", tier:"Warm", stage:"Contacted", island:"Oʻahu", createdOn:"January 27, 2026", source:"Capitol Opening Day", notes:"Office Manager for Rep. Quinlan. Coordinated Feb 5 Zoom.", message:"Scheduling contact who coordinated the Feb 5 Zoom meeting.", value:0, tags:["Scheduler"] },
  { id:12, firstName:"Matthias", lastName:"Kusch", email:"repkusch@capitol.hawaii.gov", phone:"", org:"HI State House", segment:"Government/Policy", tier:"Hot", stage:"Meeting Set", island:"Oʻahu", createdOn:"January 27, 2026", source:"Capitol Opening Day", notes:"State Representative. Meeting held Feb 18.", message:"State Representative. Reached out Jan 27 after Opening Day.", value:12000, tags:["Legislature","Met"] },
  { id:13, firstName:"Haruna", lastName:"Koshikawa", email:"h.koshikawa@capitol.hawaii.gov", phone:"", org:"Office of Rep. Kusch", segment:"Government/Policy", tier:"Warm", stage:"Contacted", island:"Oʻahu", createdOn:"January 27, 2026", source:"Capitol Opening Day", notes:"Office Manager for Rep. Kusch. Coordinated Feb 18 meeting.", message:"Coordinated Feb 18 meeting.", value:0, tags:["Scheduler"] },
  { id:14, firstName:"Tim", lastName:"Richards", email:"senrichards@capitol.hawaii.gov", phone:"", org:"HI State Senate", segment:"Government/Policy", tier:"Hot", stage:"Meeting Set", island:"Oʻahu", createdOn:"January 27, 2026", source:"Capitol Opening Day", notes:"State Senator. Strong interest. Zoom held Feb 25 (30 min).", message:"State Senator. Strong interest noted. Zoom held Feb 25.", value:20000, tags:["Legislature","Strong Interest"] },
  { id:15, firstName:"Magdalena", lastName:"Marban", email:"m.marban@capitol.hawaii.gov", phone:"", org:"Office of Sen. Richards", segment:"Government/Policy", tier:"Warm", stage:"Contacted", island:"Oʻahu", createdOn:"January 27, 2026", source:"Capitol Opening Day", notes:"Staff for Sen. Richards. Coordinated Feb 25 Zoom.", message:"Coordinated Feb 25 Zoom.", value:0, tags:["Scheduler"] },
  { id:16, firstName:"Keohokalole", lastName:"Eloy", email:"repkeohokapuleeloy@capitol.hawaii.gov", phone:"", org:"HI State House", segment:"Government/Policy", tier:"Cold", stage:"Lead", island:"Oʻahu", createdOn:"January 27, 2026", source:"Capitol Opening Day", notes:"CC'd on outreach. No direct response.", message:"CC'd on outreach Jan 27. No direct response.", value:8000, tags:["Legislature","No Response"] },
  { id:17, firstName:"Matthew", lastName:"Weyer", email:"mweyer@honolulu.gov", phone:"", org:"Honolulu City Council District 2", segment:"Government/Policy", tier:"Hot", stage:"Meeting Set", island:"Oʻahu", createdOn:"2026", source:"Direct Outreach", notes:"Pitched soil testing for District 2 farmers. Site visit offered April 7/8/9/21/22 — not confirmed. Needs follow-up.", message:"CM confirmed interest and offered a site visit. April dates offered but not confirmed.", value:18000, tags:["City Council","Follow-up Needed"] },
  { id:18, firstName:"Letani", lastName:"Peltier", email:"letani.peltier@honolulu.gov", phone:"", org:"Office of CM Weyer", segment:"Government/Policy", tier:"Warm", stage:"Contacted", island:"Oʻahu", createdOn:"2026", source:"Direct Outreach", notes:"Chief of Staff. Sent April site visit availability.", message:"Chief of Staff, CM Weyer's office. Sent April availability.", value:0, tags:["Scheduler"] },
  { id:19, firstName:"Linnie", lastName:"Pascual", email:"lpascual2@honolulu.gov", phone:"", org:"Office of CM Weyer", segment:"Government/Policy", tier:"Warm", stage:"Contacted", island:"Oʻahu", createdOn:"2026", source:"Direct Outreach", notes:"Admin Assistant. Confirmed CM's interest.", message:"Confirmed CM's interest.", value:0, tags:["Scheduler"] },
  { id:20, firstName:"Ryan", lastName:"Kobayashi", email:"rkobayashi3@honolulu.gov", phone:"", org:"Office of CM Weyer", segment:"Government/Policy", tier:"Cold", stage:"Lead", island:"Oʻahu", createdOn:"2026", source:"Direct Outreach", notes:"CC'd on CM Weyer thread.", message:"CC'd on thread.", value:0, tags:[] },
  { id:21, firstName:"Ashley", lastName:"Kierkiewicz", email:"ashley.kierkiewicz@hawaiicounty.gov", phone:"", org:"Hawaiʻi County", segment:"Government/Policy", tier:"Cold", stage:"Lead", island:"Hawaiʻi Island", createdOn:"January 27, 2026", source:"Capitol Opening Day", notes:"CC'd on Sen. Richards outreach. No direct engagement.", message:"CC'd on outreach. No direct engagement.", value:8000, tags:["County","No Response"] },
  { id:22, firstName:"Alyssa-Ann", lastName:"Lee", email:"aaalee@hawaii.edu", phone:"", org:"UH / GoFarm", segment:"Partnership", tier:"Warm", stage:"Contacted", island:"Oʻahu", createdOn:"January 2025", source:"Referral — Makana", notes:"GoFarm x Makaliʻi Metrics collaboration. GoFarm trains new farmers statewide.", message:"Connected by Makana for GoFarm x Makaliʻi Metrics collaboration.", value:7000, tags:["GoFarm","UH","Referral"] },
  { id:23, firstName:"Nicholas", lastName:"Ulm", email:"n.ulm@hawaiioceanpowersolutions.com", phone:"", org:"Hawaii Ocean Power Solutions", segment:"Partnership", tier:"Warm", stage:"Contacted", island:"Oʻahu", createdOn:"March 2025", source:"Referral — Keoni", notes:"Keoni invited him to a panel related to MM research.", message:"Keoni invited him to a panel related to Makaliʻi Metrics research.", value:3000, tags:["Panel","Referral"] },
];

const EMAIL_TEMPLATES = {
  "Soil Testing Inquiry": { subject:(c)=>`Re: Your Soil Testing Inquiry — Makaliʻi Metrics`, body:(c)=>`Aloha ${c.firstName},\n\nMahalo for reaching out to Makaliʻi Metrics! We'd love to help you understand your soil.\n\n${c.notes?.includes("element")?"Your detailed element panel request is exactly the kind of work we specialize in. We can run a comprehensive multi-element analysis including pH and ECe salinity testing, and provide Hawaii-specific interpretation and renovation recommendations.\n\n":""}To get started, here's what the process looks like:\n1. We'll send you a sample collection kit with instructions\n2. You ship or drop off your samples at our lab\n3. We process and return results with actionable interpretation — typically within a few days\n\nI'd love to schedule a quick 15-minute call to confirm the right test package for your needs. Would you be available this week?\n\nMahalo nui,\nDaniel Richardson\nMakaliʻi Metrics\n(808) 391-3975 | dtr@hawaii.edu\nmakaliimetrics.com` },
  "Government/Policy": { subject:(c)=>`Following Up — Makaliʻi Metrics Soil Lab`, body:(c)=>`Aloha ${c.firstName},\n\nMahalo for your time and continued interest in Makaliʻi Metrics.\n\nAs Hawaiʻi's only locally-staffed commercial soil testing lab, we provide Hawaii-specific interpretation that mainland labs cannot replicate — with turnaround in days, not weeks.\n\nA few ways we can support your constituents:\n• Soil testing for NRCS/EQIP program farmers\n• Baseline testing for Carbon Smart and climate-smart grant recipients\n• Support for county and state agricultural development initiatives\n\n${c.notes?.includes("site visit")?"We're excited about the possibility of a site visit and will follow up to confirm a date.\n\n":""}I'd love to explore how we can be a resource for the agricultural communities you serve.\n\nMahalo nui,\nDaniel Richardson\nMakaliʻi Metrics\n(808) 391-3975 | dtr@hawaii.edu\nmakaliimetrics.com` },
  "Nonprofit/Community": { subject:(c)=>`Aloha from Makaliʻi Metrics — Let's Connect`, body:(c)=>`Aloha ${c.firstName},\n\nMahalo for reaching out — your work sounds deeply aligned with our mission of aloha ʻāina and data-driven land stewardship.\n\n${c.notes?.includes("microbial")||c.message?.includes("microbial")?"To answer your question directly: yes, we do offer microbial activity and organic matter testing alongside standard elemental panels.\n\n":""}${c.notes?.includes("restoration")?"Your restoration project sounds like a powerful opportunity to document soil recovery over time — something we'd love to support with baseline and monitoring samples.\n\n":""}Would you be open to a short call or Zoom to explore how we might work together?\n\nMahalo nui,\nDaniel Richardson\nMakaliʻi Metrics\n(808) 391-3975 | dtr@hawaii.edu` },
  "Research/Academic": { subject:(c)=>`Re: Makaliʻi Metrics — Academic Services`, body:(c)=>`Aloha ${c.firstName},\n\nMahalo for your interest in working with Makaliʻi Metrics!\n\n${c.message?.includes("W-9")?"I've attached our W-9 to this email for your records. Please share it with your department to complete vendor onboarding.\n\n":""}We use protocols aligned with the Hawaiʻi Soil Health Test established by the Crow Lab at CTAHR, and provide data in formats compatible with standard research workflows.\n\nFor faculty submissions, we offer:\n• Standard and comprehensive soil health panels\n• Carbon fractionation and organic matter analysis\n• Hawaii-specific interpretation and reporting\n• Volume pricing for research programs\n\nMahalo nui,\nDaniel Richardson\nMakaliʻi Metrics\n(808) 391-3975 | dtr@hawaii.edu` },
  "Partnership": { subject:(c)=>`Partnership Opportunity — Makaliʻi Metrics`, body:(c)=>`Aloha ${c.firstName},\n\nMahalo for connecting — we're excited about the potential to collaborate.\n\nMakaliʻi Metrics is Hawaiʻi's first locally-staffed commercial soil lab, actively building partnerships with organizations that share our commitment to food sovereignty and data-driven agriculture.\n\n${c.org?.includes("SBDC")?"I'd love to hear more about the client you mentioned. Best to reach me directly at (808) 391-3975 or dtr@hawaii.edu.\n\n":""}${c.org?.includes("GoFarm")?"A GoFarm x Makaliʻi Metrics collaboration could be a powerful way to integrate soil health education into farmer training statewide.\n\n":""}Could we schedule a call in the coming weeks?\n\nMahalo nui,\nDaniel Richardson\nMakaliʻi Metrics\n(808) 391-3975 | dtr@hawaii.edu` },
  "Volunteer/Intern": { subject:(c)=>`Mahalo for Your Interest — Makaliʻi Metrics`, body:(c)=>`Aloha ${c.firstName},\n\nMahalo for your message and your interest in contributing to what we're building at Makaliʻi Metrics.\n\nWe're a small but growing team and are always looking for ways to bring dedicated people into our mission. While we don't have a formal program posted right now, we'd love to stay in touch as we grow.\n\n${c.notes?.includes("software")?"Your software engineering background is genuinely interesting to us — there's meaningful work at the intersection of soil data and technology.\n\n":""}Keep an eye on makaliimetrics.com for updates, and don't hesitate to reach out directly.\n\nMahalo nui,\nDaniel Richardson\nMakaliʻi Metrics\ndtr@hawaii.edu` },
  "Data/Tech": { subject:(c)=>`Re: Data & Stewardship — Makaliʻi Metrics`, body:(c)=>`Aloha ${c.firstName},\n\nMahalo for reaching out — the questions you're raising around data stewardship are ones we think about deeply as well.\n\nAt Makaliʻi Metrics, we believe the communities stewarding the ʻāina should also steward the data generated from it. We're committed to data sovereignty principles and happy to discuss how we handle soil monitoring data with our partners.\n\nI'd welcome a call or Zoom to discuss your specific project needs. Would you be available in the next couple of weeks?\n\nMahalo nui,\nDaniel Richardson\nMakaliʻi Metrics\n(808) 391-3975 | dtr@hawaii.edu` },
};

function initials(first,last){return((first?.[0]||"")+(last?.[0]||"")).toUpperCase();}
const avatarPalette=[BRAND.navy,BRAND.navyMid,BRAND.sand,BRAND.green,BRAND.amber,BRAND.red];
function avatarColor(id){return avatarPalette[id%avatarPalette.length];}
const fmt$=v=>v>0?"$"+(v>=1000?(v/1000).toFixed(0)+"k":v):"—";

// Logo mark SVG — vertical lines with dots, brand mark
const LogoMark = ({size=28}) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <line x1="6" y1="4" x2="6" y2="24" stroke={BRAND.sand} strokeWidth="1.2"/>
    <line x1="10" y1="4" x2="10" y2="24" stroke={BRAND.sand} strokeWidth="1.2"/>
    <line x1="14" y1="4" x2="14" y2="24" stroke={BRAND.sand} strokeWidth="1.2"/>
    <line x1="18" y1="4" x2="18" y2="24" stroke={BRAND.sand} strokeWidth="1.2"/>
    <line x1="22" y1="4" x2="22" y2="24" stroke={BRAND.sand} strokeWidth="1.2"/>
    <circle cx="6"  cy="10" r="2" fill={BRAND.white}/>
    <circle cx="10" cy="16" r="2" fill={BRAND.white}/>
    <circle cx="14" cy="8"  r="2" fill={BRAND.white}/>
    <circle cx="18" cy="19" r="2" fill={BRAND.white}/>
    <circle cx="22" cy="13" r="2" fill={BRAND.white}/>
  </svg>
);

export default function CRM() {
  const [contacts,setContacts]=useState(initContacts);
  const [view,setView]=useState("contacts");
  const [search,setSearch]=useState("");
  const [filterSeg,setFilterSeg]=useState("All");
  const [filterTier,setFilterTier]=useState("All");
  const [filterStage,setFilterStage]=useState("All");
  const [selected,setSelected]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [addStep,setAddStep]=useState(1);
  const [showEmail,setShowEmail]=useState(false);
  const [emailContact,setEmailContact]=useState(null);
  const [emailDraft,setEmailDraft]=useState({subject:"",body:""});
  const [emailLoading,setEmailLoading]=useState(false);
  const [newContact,setNewContact]=useState({firstName:"",lastName:"",email:"",phone:"",org:"",segment:"Soil Testing Inquiry",tier:"Warm",stage:"Lead",island:"",notes:"",message:"",value:0});

  const filtered=useMemo(()=>contacts.filter(c=>{
    const q=search.toLowerCase();
    const name=(c.firstName+" "+c.lastName).toLowerCase();
    const matchQ=!q||name.includes(q)||c.org.toLowerCase().includes(q)||c.segment.toLowerCase().includes(q)||c.email.toLowerCase().includes(q);
    return matchQ&&(filterSeg==="All"||c.segment===filterSeg)&&(filterTier==="All"||c.tier===filterTier)&&(filterStage==="All"||c.stage===filterStage);
  }),[contacts,search,filterSeg,filterTier,filterStage]);

  const pipelineByStage=useMemo(()=>{const m={};STAGES.forEach(s=>m[s]=[]);contacts.forEach(c=>{if(m[c.stage])m[c.stage].push(c);});return m;},[contacts]);

  function updateContact(id,updates){setContacts(cs=>cs.map(c=>c.id===id?{...c,...updates}:c));if(selected?.id===id)setSelected(s=>({...s,...updates}));}
  function addContact(){const c={...newContact,id:Date.now(),tags:[]};setContacts(cs=>[...cs,c]);setShowAdd(false);setNewContact({firstName:"",lastName:"",email:"",phone:"",org:"",segment:"Soil Testing Inquiry",tier:"Warm",stage:"Lead",island:"",notes:"",message:"",value:0});}
  function deleteContact(id){setContacts(cs=>cs.filter(c=>c.id!==id));setSelected(null);}
  function openAdd(){setNewContact({firstName:"",lastName:"",email:"",phone:"",org:"",segment:"Soil Testing Inquiry",tier:"Warm",stage:"Lead",island:"",notes:"",message:"",value:0});setAddStep(1);setShowAdd(true);}
  function stepValid(){if(addStep===1)return newContact.firstName.trim()&&newContact.email.trim();if(addStep===2)return newContact.segment&&newContact.tier&&newContact.stage;return true;}

  async function generateEmail(c){
    setEmailContact(c);setEmailLoading(true);setShowEmail(true);
    const tmpl=EMAIL_TEMPLATES[c.segment]||EMAIL_TEMPLATES["Soil Testing Inquiry"];
    const subject=tmpl.subject(c);const baseBody=tmpl.body(c);
    setEmailDraft({subject,body:baseBody});
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`You are writing on behalf of Daniel Richardson at Makaliʻi Metrics, Hawaiʻi's first locally-staffed commercial soil testing lab.\n\nWrite a warm, professional reply email to ${c.firstName} ${c.lastName} from ${c.org}.\n\nTheir original message: "${c.message}"\n\nNotes: ${c.notes}\n\nStart from this draft and improve it — make it feel personal, grounded in aloha ʻāina values, and directly address their inquiry. Keep it under 200 words. No markdown formatting. Sign off as Daniel Richardson, Makaliʻi Metrics.\n\nBase draft:\n${baseBody}\n\nReturn only the improved email body, no subject line.`}]})});
      const data=await res.json();
      const aiBody=data.content?.find(b=>b.type==="text")?.text||baseBody;
      setEmailDraft({subject,body:aiBody});
    }catch(e){}
    setEmailLoading(false);
  }

  // Shared input style
  const inputStyle={width:"100%",padding:"8px 11px",borderRadius:6,border:`1px solid ${BRAND.border}`,background:BRAND.white,color:BRAND.black,fontSize:13,boxSizing:"border-box",fontFamily:"inherit",outline:"none"};
  const selectStyle={padding:"7px 11px",borderRadius:6,border:`1px solid ${BRAND.border}`,background:BRAND.white,color:BRAND.black,fontSize:13,cursor:"pointer",fontFamily:"inherit"};
  const btnPrimary={padding:"8px 16px",borderRadius:6,border:"none",background:BRAND.navy,color:BRAND.white,cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"inherit"};
  const btnSecondary={padding:"7px 14px",borderRadius:6,border:`1px solid ${BRAND.border}`,background:BRAND.white,color:BRAND.navy,cursor:"pointer",fontSize:13,fontFamily:"inherit"};
  const pill=(color,bg)=>({display:"inline-flex",alignItems:"center",padding:"2px 9px",borderRadius:99,fontSize:11,fontWeight:500,color,background:bg,letterSpacing:"0.01em"});
  const tag={display:"inline-flex",padding:"2px 8px",borderRadius:99,fontSize:11,background:BRAND.sandLight,color:BRAND.sand,border:`0.5px solid ${BRAND.sandMid}`};
  const label={fontSize:11,color:BRAND.gray,fontWeight:500,marginBottom:4,display:"block",textTransform:"uppercase",letterSpacing:"0.05em"};
  const card={background:BRAND.white,border:`1px solid ${BRAND.border}`,borderRadius:10,padding:"14px 16px"};
  const metricCard={background:BRAND.sandLight,borderRadius:8,padding:"14px 16px",minWidth:110};

  const DetailPanel=({c,onClose})=>{
    const [note,setNote]=useState("");
    return(
      <div style={{...card,width:310,minWidth:280,maxHeight:"calc(100vh - 120px)",overflowY:"auto",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:avatarColor(c.id),display:"flex",alignItems:"center",justifyContent:"center",color:BRAND.white,fontWeight:500,fontSize:14,flexShrink:0}}>{initials(c.firstName,c.lastName)}</div>
            <div><div style={{fontWeight:500,fontSize:14,color:BRAND.black}}>{c.firstName} {c.lastName}</div><div style={{fontSize:12,color:BRAND.gray,marginTop:1}}>{c.org}</div></div>
          </div>
          <button onClick={onClose} style={{...btnSecondary,padding:"3px 9px",fontSize:12}}>✕</button>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
          <span style={pill(TIER_COLORS[c.tier],TIER_BG[c.tier])}>{c.tier}</span>
          <span style={pill(STAGE_COLORS[c.stage],STAGE_BG[c.stage])}>{c.stage}</span>
          <span style={tag}>{c.segment}</span>
        </div>
        <div style={{borderTop:`1px solid ${BRAND.border}`,paddingTop:12,marginBottom:12}}>
          {[["Island",c.island||"—"],["Deal Value",fmt$(c.value)],["Date",c.createdOn||"—"],["Source",c.source||"—"],["Email",c.email||"—"],["Phone",c.phone||"—"]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:7}}>
              <span style={{color:BRAND.gray}}>{k}</span>
              <span style={{color:BRAND.black,maxWidth:190,textAlign:"right",wordBreak:"break-word"}}>{v}</span>
            </div>
          ))}
        </div>
        {c.message&&<div style={{marginBottom:12}}><div style={{fontSize:11,color:BRAND.gray,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Original message</div><div style={{fontSize:12,color:BRAND.gray,lineHeight:1.6,background:BRAND.sandLight,borderRadius:6,padding:"8px 10px",maxHeight:90,overflowY:"auto"}}>{c.message}</div></div>}
        <div style={{marginBottom:10}}>
          <div style={{...label}}>Stage</div>
          <select value={c.stage} onChange={e=>updateContact(c.id,{stage:e.target.value})} style={{...selectStyle,width:"100%"}}>{STAGES.map(st=><option key={st}>{st}</option>)}</select>
        </div>
        <div style={{marginBottom:12}}>
          <div style={{...label}}>Tier</div>
          <select value={c.tier} onChange={e=>updateContact(c.id,{tier:e.target.value})} style={{...selectStyle,width:"100%"}}>{["Hot","Warm","Cold"].map(t=><option key={t}>{t}</option>)}</select>
        </div>
        {c.tags?.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>{c.tags.map(t=><span key={t} style={tag}>{t}</span>)}</div>}
        {c.notes&&<div style={{marginBottom:12}}><div style={{...label}}>Notes</div><div style={{fontSize:12,color:BRAND.gray,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{c.notes}</div></div>}
        <div style={{marginBottom:12}}>
          <div style={{...label}}>Add note</div>
          <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} placeholder="Type a note…" style={{...inputStyle,resize:"vertical"}}/>
          <button style={{...btnPrimary,marginTop:6,width:"100%"}} onClick={()=>{if(note.trim()){updateContact(c.id,{notes:(c.notes?c.notes+"\n\n":"")+new Date().toLocaleDateString()+": "+note});setNote("");}}}>Save note</button>
        </div>
        <button style={{...btnPrimary,width:"100%",marginBottom:6,background:BRAND.sand}} onClick={()=>generateEmail(c)}>✉ Draft reply email</button>
        <button onClick={()=>deleteContact(c.id)} style={{...btnSecondary,width:"100%",fontSize:12,color:BRAND.red,borderColor:BRAND.red+"44"}}>Remove contact</button>
      </div>
    );
  };

  const EmailModal=()=>(
    <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,minHeight:"100%",background:"rgba(15,20,35,0.6)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:200,padding:"32px 16px"}} onClick={e=>{if(e.target===e.currentTarget)setShowEmail(false)}}>
      <div style={{width:560,maxWidth:"95%",background:BRAND.white,border:`1px solid ${BRAND.border}`,borderRadius:12,padding:"22px 24px",boxShadow:"0 12px 48px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div><div style={{fontWeight:500,fontSize:15,color:BRAND.navy}}>✉ Draft reply</div><div style={{fontSize:12,color:BRAND.gray,marginTop:2}}>To: {emailContact?.firstName} {emailContact?.lastName} · {emailContact?.email}</div></div>
          <button onClick={()=>setShowEmail(false)} style={{...btnSecondary,padding:"3px 10px",fontSize:12}}>✕</button>
        </div>
        {emailLoading?(
          <div style={{textAlign:"center",padding:"48px 0",color:BRAND.gray,fontSize:13}}>
            <div style={{width:32,height:32,borderRadius:"50%",border:`2px solid ${BRAND.navyLight}`,borderTopColor:BRAND.navy,animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div>Drafting personalized email…</div>
          </div>
        ):(
          <>
            <div style={{marginBottom:12}}><div style={{...label}}>Subject</div><input value={emailDraft.subject} onChange={e=>setEmailDraft(d=>({...d,subject:e.target.value}))} style={inputStyle}/></div>
            <div style={{marginBottom:16}}><div style={{...label}}>Body</div><textarea value={emailDraft.body} onChange={e=>setEmailDraft(d=>({...d,body:e.target.value}))} rows={14} style={{...inputStyle,resize:"vertical",lineHeight:1.65}}/></div>
            <div style={{display:"flex",gap:8}}>
              <button style={{...btnPrimary,flex:1}} onClick={()=>{navigator.clipboard?.writeText("Subject: "+emailDraft.subject+"\n\n"+emailDraft.body);alert("Copied!");}}>Copy</button>
              <button style={{...btnPrimary,flex:1,background:BRAND.sand}} onClick={()=>{window.open("mailto:"+emailContact?.email+"?subject="+encodeURIComponent(emailDraft.subject)+"&body="+encodeURIComponent(emailDraft.body));}}>Open in Mail</button>
              <button style={btnSecondary} onClick={()=>generateEmail(emailContact)}>↺ Regenerate</button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const ContactsView=()=>(
    <div style={{display:"flex",gap:16,flex:1,overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto"}}>
        <div style={{...card,marginBottom:12}}>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, org, email…" style={{...inputStyle,flex:1,minWidth:180}}/>
            <select value={filterTier} onChange={e=>setFilterTier(e.target.value)} style={selectStyle}><option value="All">All Tiers</option>{["Hot","Warm","Cold"].map(t=><option key={t}>{t}</option>)}</select>
            <select value={filterSeg} onChange={e=>setFilterSeg(e.target.value)} style={selectStyle}><option value="All">All Segments</option>{SEGMENTS.map(sg=><option key={sg}>{sg}</option>)}</select>
            <select value={filterStage} onChange={e=>setFilterStage(e.target.value)} style={selectStyle}><option value="All">All Stages</option>{STAGES.map(st=><option key={st}>{st}</option>)}</select>
            <button style={btnPrimary} onClick={openAdd}>+ Add contact</button>
          </div>
        </div>
        <div style={{fontSize:12,color:BRAND.gray,marginBottom:8,paddingLeft:2}}>{filtered.length} contact{filtered.length!==1?"s":""} shown</div>
        {filtered.map(c=>(
          <div key={c.id} onClick={()=>setSelected(c)} style={{...card,marginBottom:8,cursor:"pointer",borderColor:selected?.id===c.id?BRAND.navy:BRAND.border,borderWidth:selected?.id===c.id?"1.5px":"1px",display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:avatarColor(c.id),display:"flex",alignItems:"center",justifyContent:"center",color:BRAND.white,fontWeight:500,fontSize:13,flexShrink:0}}>{initials(c.firstName,c.lastName)}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:4}}>
                <span style={{fontWeight:500,fontSize:14,color:BRAND.black}}>{c.firstName} {c.lastName}</span>
                <span style={{fontSize:12,color:BRAND.gray}}>{c.createdOn}</span>
              </div>
              <div style={{fontSize:13,color:BRAND.gray,marginTop:1}}>{c.org}{c.island?" · "+c.island:""}</div>
              {c.message&&<div style={{fontSize:12,color:BRAND.gray,marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:460,opacity:0.85}}>{c.message}</div>}
              <div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}>
                <span style={pill(TIER_COLORS[c.tier],TIER_BG[c.tier])}>{c.tier}</span>
                <span style={pill(STAGE_COLORS[c.stage],STAGE_BG[c.stage])}>{c.stage}</span>
                <span style={tag}>{c.segment}</span>
                {c.tags?.slice(0,2).map(t=><span key={t} style={tag}>{t}</span>)}
              </div>
            </div>
            <button onClick={e=>{e.stopPropagation();generateEmail(c);}} style={{...btnSecondary,padding:"5px 10px",fontSize:12,flexShrink:0,color:BRAND.sand,borderColor:BRAND.sandMid}}>✉</button>
          </div>
        ))}
        {filtered.length===0&&<div style={{...card,textAlign:"center",color:BRAND.gray,fontSize:13,padding:40}}>No contacts match your filters.</div>}
      </div>
      {selected&&<DetailPanel c={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );

  const PipelineView=()=>(
    <div style={{flex:1,overflowX:"auto"}}>
      <div style={{display:"flex",gap:10,minWidth:960}}>
        {STAGES.map(stage=>{
          const cs=pipelineByStage[stage];
          const sv=cs.reduce((s,c)=>s+c.value,0);
          return(
            <div key={stage} style={{flex:1,minWidth:128}}>
              <div style={{...card,marginBottom:8,padding:"8px 12px",background:STAGE_BG[stage],borderColor:STAGE_COLORS[stage]+"44"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,fontWeight:500,color:STAGE_COLORS[stage],textTransform:"uppercase",letterSpacing:"0.05em"}}>{stage}</span>
                  <span style={{fontSize:11,color:BRAND.gray,background:BRAND.white,borderRadius:99,padding:"1px 7px",border:`1px solid ${BRAND.border}`}}>{cs.length}</span>
                </div>
                <div style={{fontSize:11,color:BRAND.gray,marginTop:3}}>{sv>0?fmt$(sv):"—"}</div>
              </div>
              {cs.map(c=>(
                <div key={c.id} onClick={()=>{setSelected(c);setView("contacts");}} style={{...card,marginBottom:8,cursor:"pointer",padding:"10px 12px"}}>
                  <div style={{fontWeight:500,fontSize:13,color:BRAND.navy,marginBottom:2}}>{c.firstName} {c.lastName}</div>
                  <div style={{fontSize:11,color:BRAND.gray,marginBottom:7,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.org}</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    <span style={pill(TIER_COLORS[c.tier],TIER_BG[c.tier])}>{c.tier}</span>
                    {c.value>0&&<span style={{fontSize:11,color:BRAND.gray}}>{fmt$(c.value)}</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );

  const AnalyticsView=()=>{
    const bySeg=SEGMENTS.map(seg=>({seg,count:contacts.filter(c=>c.segment===seg).length})).filter(x=>x.count>0).sort((a,b)=>b.count-a.count);
    const maxC=Math.max(...bySeg.map(x=>x.count),1);
    const byStage=STAGES.map(st=>({st,count:contacts.filter(c=>c.stage===st).length})).filter(x=>x.count>0);
    const maxSt=Math.max(...byStage.map(x=>x.count),1);
    const byTier=[["Hot",BRAND.navy,BRAND.navyLight],["Warm",BRAND.sand,BRAND.sandLight],["Cold",BRAND.gray,BRAND.grayLight]].map(([t,color,bg])=>({t,color,bg,count:contacts.filter(c=>c.tier===t).length}));
    const actionableC=contacts.filter(c=>c.tags?.includes("Actionable"));
    const totalVal=contacts.reduce((s,c)=>s+c.value,0);
    return(
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {[["Total Contacts",contacts.length,"inquiries logged"],["Hot Leads",contacts.filter(c=>c.tier==="Hot").length,"need attention"],["Actionable",actionableC.length,"ready to respond"],["Pipeline Value",fmt$(totalVal),"estimated"],["Active",contacts.filter(c=>!["Closed Won","Closed Lost"].includes(c.stage)).length,"in pipeline"]].map(([l,v,sub])=>(
            <div key={l} style={metricCard}>
              <div style={{fontSize:11,color:BRAND.gray,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>{l}</div>
              <div style={{fontSize:24,fontWeight:500,color:BRAND.navy}}>{v}</div>
              <div style={{fontSize:11,color:BRAND.gray,marginTop:2}}>{sub}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <div style={{...card,flex:2,minWidth:240}}>
            <div style={{fontWeight:500,fontSize:14,color:BRAND.navy,marginBottom:14}}>Inquiries by segment</div>
            {bySeg.map(({seg,count})=>(
              <div key={seg} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                  <span style={{color:BRAND.gray}}>{seg}</span>
                  <span style={{color:BRAND.navy,fontWeight:500}}>{count}</span>
                </div>
                <div style={{height:6,borderRadius:3,background:BRAND.sandLight,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:3,background:BRAND.navy,width:(count/maxC*100)+"%"}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{...card,flex:1,minWidth:180}}>
            <div style={{fontWeight:500,fontSize:14,color:BRAND.navy,marginBottom:14}}>Stage breakdown</div>
            {byStage.map(({st,count})=>(
              <div key={st} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                  <span style={{color:BRAND.gray}}>{st}</span>
                  <span style={{color:STAGE_COLORS[st],fontWeight:500}}>{count}</span>
                </div>
                <div style={{height:5,borderRadius:3,background:BRAND.sandLight,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:3,background:STAGE_COLORS[st],width:(count/maxSt*100)+"%"}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{...card,flex:1,minWidth:150}}>
            <div style={{fontWeight:500,fontSize:14,color:BRAND.navy,marginBottom:14}}>By tier</div>
            {byTier.map(({t,color,bg,count})=>(
              <div key={t} style={{marginBottom:10,padding:"12px 14px",borderRadius:8,background:bg,border:`1px solid ${color}22`}}>
                <div style={{fontSize:11,fontWeight:500,color,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t}</div>
                <div style={{fontSize:26,fontWeight:500,color}}>{count}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={card}>
          <div style={{fontWeight:500,fontSize:14,color:BRAND.navy,marginBottom:12}}>Action items — needs response</div>
          {actionableC.length===0?<div style={{fontSize:13,color:BRAND.gray}}>No actionable items tagged.</div>:
            actionableC.map(c=>(
              <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${BRAND.border}`}}>
                <div><span style={{fontSize:13,fontWeight:500,color:BRAND.navy}}>{c.firstName} {c.lastName}</span><span style={{fontSize:12,color:BRAND.gray,marginLeft:8}}>{c.org}</span></div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={pill(TIER_COLORS[c.tier],TIER_BG[c.tier])}>{c.tier}</span>
                  <button style={{...btnSecondary,fontSize:12}} onClick={()=>{setView("contacts");setSelected(c);}}>View</button>
                  <button style={{...btnSecondary,fontSize:12,color:BRAND.sand,borderColor:BRAND.sandMid}} onClick={()=>generateEmail(c)}>✉ Draft</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    );
  };

  // Add contact modal
  const AddModal=()=>(
    <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,minHeight:"100%",background:"rgba(15,20,35,0.6)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:99,padding:"32px 16px"}} onClick={e=>{if(e.target===e.currentTarget)setShowAdd(false)}}>
      <div style={{width:480,maxWidth:"100%",background:BRAND.white,border:`1px solid ${BRAND.border}`,borderRadius:12,padding:"22px 24px",boxShadow:"0 12px 48px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div>
            <div style={{fontWeight:500,fontSize:16,color:BRAND.navy}}>Add new contact</div>
            <div style={{fontSize:12,color:BRAND.gray,marginTop:3}}>Step {addStep} of 3 — {["Contact info","Classification","Message & notes"][addStep-1]}</div>
          </div>
          <button onClick={()=>setShowAdd(false)} style={{...btnSecondary,padding:"4px 10px",fontSize:12}}>✕</button>
        </div>
        <div style={{height:3,borderRadius:99,background:BRAND.sandLight,margin:"14px 0 20px",overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:99,background:BRAND.navy,width:(addStep/3*100)+"%",transition:"width 0.25s"}}/>
        </div>

        {addStep===1&&(
          <div>
            <div style={{display:"flex",gap:12,marginBottom:14}}>
              <div style={{flex:1}}><label style={label}>First name <span style={{color:BRAND.red}}>*</span></label><input autoFocus value={newContact.firstName} onChange={e=>setNewContact(n=>({...n,firstName:e.target.value}))} placeholder="e.g. Kainoa" style={inputStyle}/></div>
              <div style={{flex:1}}><label style={label}>Last name</label><input value={newContact.lastName} onChange={e=>setNewContact(n=>({...n,lastName:e.target.value}))} placeholder="e.g. Kahananui" style={inputStyle}/></div>
            </div>
            <div style={{marginBottom:14}}><label style={label}>Email <span style={{color:BRAND.red}}>*</span></label><input type="email" value={newContact.email} onChange={e=>setNewContact(n=>({...n,email:e.target.value}))} placeholder="email@example.com" style={inputStyle}/></div>
            <div style={{display:"flex",gap:12,marginBottom:14}}>
              <div style={{flex:1}}><label style={label}>Phone</label><input type="tel" value={newContact.phone} onChange={e=>setNewContact(n=>({...n,phone:e.target.value}))} placeholder="808-555-0100" style={inputStyle}/></div>
              <div style={{flex:1}}><label style={label}>Island</label><select value={newContact.island} onChange={e=>setNewContact(n=>({...n,island:e.target.value}))} style={{...selectStyle,width:"100%"}}><option value="">Select…</option>{ISLANDS.map(i=><option key={i}>{i}</option>)}</select></div>
            </div>
            <div style={{marginBottom:4}}><label style={label}>Organization</label><input value={newContact.org} onChange={e=>setNewContact(n=>({...n,org:e.target.value}))} placeholder="Farm, agency, nonprofit, company…" style={inputStyle}/></div>
          </div>
        )}

        {addStep===2&&(
          <div>
            <div style={{marginBottom:16}}>
              <label style={label}>Segment <span style={{color:BRAND.red}}>*</span></label>
              <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:4}}>
                {SEGMENTS.map(sg=>(
                  <button key={sg} onClick={()=>setNewContact(n=>({...n,segment:sg}))} style={{padding:"6px 13px",borderRadius:99,border:"1px solid",fontSize:12,cursor:"pointer",fontWeight:newContact.segment===sg?500:400,borderColor:newContact.segment===sg?BRAND.navy:BRAND.border,background:newContact.segment===sg?BRAND.navyLight:BRAND.white,color:newContact.segment===sg?BRAND.navy:BRAND.gray}}>
                    {sg}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:12}}>
              <div style={{flex:1}}>
                <label style={label}>Tier <span style={{color:BRAND.red}}>*</span></label>
                {[["Hot","Active need",BRAND.navy,BRAND.navyLight],["Warm","Interested",BRAND.sand,BRAND.sandLight],["Cold","Early stage",BRAND.gray,BRAND.grayLight]].map(([t,desc,color,bg])=>(
                  <div key={t} onClick={()=>setNewContact(n=>({...n,tier:t}))} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:8,border:"1px solid",marginBottom:6,cursor:"pointer",borderColor:newContact.tier===t?color:BRAND.border,background:newContact.tier===t?bg:BRAND.white}}>
                    <div style={{width:9,height:9,borderRadius:"50%",background:color,flexShrink:0}}/>
                    <div><div style={{fontSize:13,fontWeight:500,color:newContact.tier===t?color:BRAND.black}}>{t}</div><div style={{fontSize:11,color:BRAND.gray}}>{desc}</div></div>
                  </div>
                ))}
              </div>
              <div style={{flex:1}}>
                <label style={label}>Stage <span style={{color:BRAND.red}}>*</span></label>
                {STAGES.map(st=>(
                  <div key={st} onClick={()=>setNewContact(n=>({...n,stage:st}))} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:6,border:"1px solid",marginBottom:5,cursor:"pointer",borderColor:newContact.stage===st?STAGE_COLORS[st]:BRAND.border,background:newContact.stage===st?STAGE_BG[st]:BRAND.white}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:STAGE_COLORS[st],flexShrink:0}}/>
                    <span style={{fontSize:12,color:newContact.stage===st?STAGE_COLORS[st]:BRAND.gray,fontWeight:newContact.stage===st?500:400}}>{st}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {addStep===3&&(
          <div>
            <div style={{marginBottom:14}}><label style={label}>Their message / inquiry</label><textarea value={newContact.message} onChange={e=>setNewContact(n=>({...n,message:e.target.value}))} rows={4} placeholder="Paste or type their original message…" style={{...inputStyle,resize:"vertical",lineHeight:1.6}}/></div>
            <div style={{marginBottom:14}}><label style={label}>Internal notes</label><textarea value={newContact.notes} onChange={e=>setNewContact(n=>({...n,notes:e.target.value}))} rows={3} placeholder="Context, action items, how you met…" style={{...inputStyle,resize:"vertical",lineHeight:1.6}}/></div>
            <div style={{marginBottom:16}}><label style={label}>Estimated deal value ($)</label><input type="number" min={0} value={newContact.value||""} onChange={e=>setNewContact(n=>({...n,value:+e.target.value||0}))} placeholder="0" style={{...inputStyle,width:160}}/></div>
            {newContact.firstName&&(
              <div style={{padding:"12px 14px",borderRadius:8,background:BRAND.sandLight,border:`1px solid ${BRAND.border}`}}>
                <div style={{fontSize:11,color:BRAND.gray,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Preview</div>
                <div style={{fontWeight:500,fontSize:14,color:BRAND.navy}}>{newContact.firstName} {newContact.lastName}</div>
                <div style={{fontSize:12,color:BRAND.gray,marginTop:2}}>{newContact.org||"No org"} · {newContact.island||"Island TBD"}</div>
                <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
                  <span style={pill(TIER_COLORS[newContact.tier],TIER_BG[newContact.tier])}>{newContact.tier}</span>
                  <span style={pill(STAGE_COLORS[newContact.stage],STAGE_BG[newContact.stage])}>{newContact.stage}</span>
                  <span style={tag}>{newContact.segment}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{display:"flex",gap:8,marginTop:20}}>
          {addStep>1&&<button style={{...btnSecondary,flex:1}} onClick={()=>setAddStep(s=>s-1)}>← Back</button>}
          {addStep<3&&<button style={{...btnPrimary,flex:2}} disabled={!stepValid()} onClick={()=>setAddStep(s=>s+1)}>Continue →</button>}
          {addStep===3&&<button style={{...btnPrimary,flex:2}} disabled={!newContact.firstName||!newContact.email} onClick={()=>{addContact();}}>Add contact</button>}
        </div>
      </div>
    </div>
  );

  return(
    <div style={{fontFamily:"system-ui,sans-serif",minHeight:"100vh",background:BRAND.grayLight,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:BRAND.navy,padding:"0 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",height:52}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:6,background:BRAND.navyMid,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><LogoMark size={22}/></div>
          <div>
            <span style={{fontWeight:500,fontSize:14,color:BRAND.white,letterSpacing:"0.01em"}}>makaliʻi</span>
            <span style={{fontSize:11,color:BRAND.sand,marginLeft:5,letterSpacing:"0.05em",textTransform:"lowercase"}}>metrics · crm</span>
          </div>
        </div>
        <nav style={{display:"flex",gap:2,marginLeft:12}}>
          {["contacts","pipeline","analytics"].map(v=>(
            <button key={v} style={{padding:"6px 14px",borderRadius:6,border:"none",background:view===v?"rgba(255,255,255,0.12)":"transparent",color:view===v?BRAND.white:BRAND.sand,cursor:"pointer",fontSize:13,fontWeight:view===v?500:400,letterSpacing:"0.01em"}} onClick={()=>setView(v)}>{v.charAt(0).toUpperCase()+v.slice(1)}</button>
          ))}
        </nav>
        <div style={{marginLeft:"auto",fontSize:12,color:BRAND.sand}}>{contacts.length} contacts · {contacts.filter(c=>c.tier==="Hot").length} hot leads</div>
      </div>

      {/* Main */}
      <div style={{flex:1,padding:16,display:"flex",gap:16,overflow:"hidden",position:"relative"}}>
        {view==="contacts"&&<ContactsView/>}
        {view==="pipeline"&&<PipelineView/>}
        {view==="analytics"&&<AnalyticsView/>}
        {showEmail&&<EmailModal/>}
        {showAdd&&<AddModal/>}
      </div>
    </div>
  );
}