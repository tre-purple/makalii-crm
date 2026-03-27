import { useState } from "react";
import { BRAND, STAGES, STAGE_COLORS, STAGE_BG, SEGMENTS, TIER_COLORS, TIER_BG, ISLANDS } from "../constants/brand";
import { inputStyle, selectStyle, btnPrimary, btnSecondary, pill, tag, label } from "../constants/styles";
import PricingCalculator from "./PricingCalculator";

const EMPTY_CONTACT = {
  firstName:"", lastName:"", email:"", phone:"", org:"",
  segment:"Soil Testing Inquiry", tier:"Warm", stage:"Lead",
  island:"", notes:"", message:"", value:0,
};

export default function AddModal({ onSave, onClose }) {
  const [addStep, setAddStep] = useState(1);
  const [newContact, setNewContact] = useState(EMPTY_CONTACT);

  function stepValid() {
    if (addStep === 1) return newContact.firstName.trim() && newContact.email.trim();
    if (addStep === 2) return newContact.segment && newContact.tier && newContact.stage;
    return true;
  }

  function handleSave() {
    onSave({ ...newContact, id: Date.now(), tags: [] });
  }

  return (
    <div
      style={{position:"absolute", top:0, left:0, right:0, bottom:0, background:"rgba(15,20,35,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:99, padding:"32px 16px"}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{width:480, maxWidth:"100%", background:BRAND.white, border:`1px solid ${BRAND.border}`, borderRadius:12, padding:"22px 24px 0", boxShadow:"0 12px 48px rgba(0,0,0,0.2)", display:"flex", flexDirection:"column", height:"calc(100vh - 64px)", maxHeight:680}}>

        {/* Fixed header */}
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6, flexShrink:0}}>
          <div>
            <div style={{fontWeight:500, fontSize:16, color:BRAND.navy}}>Add new contact</div>
            <div style={{fontSize:12, color:BRAND.gray, marginTop:3}}>Step {addStep} of 3 — {["Contact info","Classification","Message & notes"][addStep-1]}</div>
          </div>
          <button onClick={onClose} style={{...btnSecondary, padding:"4px 10px", fontSize:12}}>✕</button>
        </div>

        <div style={{height:3, borderRadius:99, background:BRAND.sandLight, margin:"14px 0 20px", overflow:"hidden", flexShrink:0}}>
          <div style={{height:"100%", borderRadius:99, background:BRAND.navy, width:(addStep/3*100)+"%", transition:"width 0.25s"}}/>
        </div>

        {/* Scrollable step content */}
        <div style={{flex:1, overflowY:"auto", minHeight:0, paddingBottom:4}}>
        {addStep === 1 && (
          <div>
            <div style={{display:"flex", gap:12, marginBottom:14}}>
              <div style={{flex:1}}>
                <label style={label}>First name <span style={{color:BRAND.red}}>*</span></label>
                <input autoFocus value={newContact.firstName} onChange={e => setNewContact(n => ({...n, firstName:e.target.value}))} placeholder="e.g. Kainoa" style={inputStyle}/>
              </div>
              <div style={{flex:1}}>
                <label style={label}>Last name</label>
                <input value={newContact.lastName} onChange={e => setNewContact(n => ({...n, lastName:e.target.value}))} placeholder="e.g. Kahananui" style={inputStyle}/>
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={label}>Email <span style={{color:BRAND.red}}>*</span></label>
              <input type="email" value={newContact.email} onChange={e => setNewContact(n => ({...n, email:e.target.value}))} placeholder="email@example.com" style={inputStyle}/>
            </div>
            <div style={{display:"flex", gap:12, marginBottom:14}}>
              <div style={{flex:1}}>
                <label style={label}>Phone</label>
                <input type="tel" value={newContact.phone} onChange={e => setNewContact(n => ({...n, phone:e.target.value}))} placeholder="808-555-0100" style={inputStyle}/>
              </div>
              <div style={{flex:1}}>
                <label style={label}>Island</label>
                <select value={newContact.island} onChange={e => setNewContact(n => ({...n, island:e.target.value}))} style={{...selectStyle, width:"100%"}}>
                  <option value="">Select…</option>
                  {ISLANDS.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
            </div>
            <div style={{marginBottom:4}}>
              <label style={label}>Organization</label>
              <input value={newContact.org} onChange={e => setNewContact(n => ({...n, org:e.target.value}))} placeholder="Farm, agency, nonprofit, company…" style={inputStyle}/>
            </div>
          </div>
        )}

        {addStep === 2 && (
          <div>
            <div style={{marginBottom:16}}>
              <label style={label}>Segment <span style={{color:BRAND.red}}>*</span></label>
              <div style={{display:"flex", flexWrap:"wrap", gap:7, marginTop:4}}>
                {SEGMENTS.map(sg => (
                  <button key={sg} onClick={() => setNewContact(n => ({...n, segment:sg}))} style={{padding:"6px 13px", borderRadius:99, border:"1px solid", fontSize:12, cursor:"pointer", fontWeight:newContact.segment===sg?500:400, borderColor:newContact.segment===sg?BRAND.navy:BRAND.border, background:newContact.segment===sg?BRAND.navyLight:BRAND.white, color:newContact.segment===sg?BRAND.navy:BRAND.gray}}>
                    {sg}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"flex", gap:12}}>
              <div style={{flex:1}}>
                <label style={label}>Tier <span style={{color:BRAND.red}}>*</span></label>
                {[["Hot","Active need",BRAND.navy,BRAND.navyLight], ["Warm","Interested",BRAND.sand,BRAND.sandLight], ["Cold","Early stage",BRAND.gray,BRAND.grayLight]].map(([t, desc, color, bg]) => (
                  <div key={t} onClick={() => setNewContact(n => ({...n, tier:t}))} style={{display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, border:"1px solid", marginBottom:6, cursor:"pointer", borderColor:newContact.tier===t?color:BRAND.border, background:newContact.tier===t?bg:BRAND.white}}>
                    <div style={{width:9, height:9, borderRadius:"50%", background:color, flexShrink:0}}/>
                    <div>
                      <div style={{fontSize:13, fontWeight:500, color:newContact.tier===t?color:BRAND.black}}>{t}</div>
                      <div style={{fontSize:11, color:BRAND.gray}}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{flex:1}}>
                <label style={label}>Stage <span style={{color:BRAND.red}}>*</span></label>
                {STAGES.map(st => (
                  <div key={st} onClick={() => setNewContact(n => ({...n, stage:st}))} style={{display:"flex", alignItems:"center", gap:8, padding:"7px 10px", borderRadius:6, border:"1px solid", marginBottom:5, cursor:"pointer", borderColor:newContact.stage===st?STAGE_COLORS[st]:BRAND.border, background:newContact.stage===st?STAGE_BG[st]:BRAND.white}}>
                    <div style={{width:7, height:7, borderRadius:"50%", background:STAGE_COLORS[st], flexShrink:0}}/>
                    <span style={{fontSize:12, color:newContact.stage===st?STAGE_COLORS[st]:BRAND.gray, fontWeight:newContact.stage===st?500:400}}>{st}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {addStep === 3 && (
          <div>
            <div style={{marginBottom:14}}>
              <label style={label}>Their message / inquiry</label>
              <textarea value={newContact.message} onChange={e => setNewContact(n => ({...n, message:e.target.value}))} rows={4} placeholder="Paste or type their original message…" style={{...inputStyle, resize:"vertical", lineHeight:1.6}}/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={label}>Internal notes</label>
              <textarea value={newContact.notes} onChange={e => setNewContact(n => ({...n, notes:e.target.value}))} rows={3} placeholder="Context, action items, how you met…" style={{...inputStyle, resize:"vertical", lineHeight:1.6}}/>
            </div>
            <div style={{marginBottom:16}}>
              <PricingCalculator
                currentValue={newContact.value}
                onApply={val => setNewContact(n => ({...n, value: val}))}
              />
              <div style={{display:"flex", alignItems:"center", gap:8, marginTop:8}}>
                <label style={{...label, marginBottom:0, whiteSpace:"nowrap"}}>Or enter manually ($)</label>
                <input type="number" min={0} value={newContact.value||""} onChange={e => setNewContact(n => ({...n, value:+e.target.value||0}))} placeholder="0" style={{...inputStyle, width:100}}/>
              </div>
            </div>
            {newContact.firstName && (
              <div style={{padding:"12px 14px", borderRadius:8, background:BRAND.sandLight, border:`1px solid ${BRAND.border}`}}>
                <div style={{fontSize:11, color:BRAND.gray, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6}}>Preview</div>
                <div style={{fontWeight:500, fontSize:14, color:BRAND.navy}}>{newContact.firstName} {newContact.lastName}</div>
                <div style={{fontSize:12, color:BRAND.gray, marginTop:2}}>{newContact.org||"No org"} · {newContact.island||"Island TBD"}</div>
                <div style={{display:"flex", gap:5, marginTop:8, flexWrap:"wrap"}}>
                  <span style={pill(TIER_COLORS[newContact.tier], TIER_BG[newContact.tier])}>{newContact.tier}</span>
                  <span style={pill(STAGE_COLORS[newContact.stage], STAGE_BG[newContact.stage])}>{newContact.stage}</span>
                  <span style={tag}>{newContact.segment}</span>
                </div>
              </div>
            )}
          </div>
        )}

        </div>{/* end scrollable content */}

        {/* Pinned footer */}
        <div style={{display:"flex", gap:8, padding:"14px 0 20px", borderTop:`1px solid ${BRAND.border}`, flexShrink:0}}>
          {addStep > 1 && <button style={{...btnSecondary, flex:1}} onClick={() => setAddStep(s => s-1)}>← Back</button>}
          {addStep < 3 && <button style={{...btnPrimary, flex:2}} disabled={!stepValid()} onClick={() => setAddStep(s => s+1)}>Continue →</button>}
          {addStep === 3 && <button style={{...btnPrimary, flex:2}} disabled={!newContact.firstName || !newContact.email} onClick={handleSave}>Add contact</button>}
        </div>
      </div>
    </div>
  );
}
