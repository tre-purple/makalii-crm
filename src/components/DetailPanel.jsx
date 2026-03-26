import { useState } from "react";
import { BRAND, STAGES, TIER_COLORS, TIER_BG, STAGE_COLORS, STAGE_BG } from "../constants/brand";
import { inputStyle, selectStyle, btnPrimary, btnSecondary, pill, tag, label } from "../constants/styles";
import { initials, avatarColor, fmt$ } from "../utils/helpers";
import PricingCalculator from "./PricingCalculator";

export default function DetailPanel({ c, onClose, updateContact, generateEmail, deleteContact }) {
  const [note, setNote] = useState("");
  const [showCalc, setShowCalc] = useState(false);

  return (
    <div style={{padding:"20px", minHeight:"100%", boxSizing:"border-box"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14}}>
        <div style={{display:"flex", gap:10, alignItems:"center"}}>
          <div style={{width:40, height:40, borderRadius:"50%", background:avatarColor(c.id), display:"flex", alignItems:"center", justifyContent:"center", color:BRAND.white, fontWeight:500, fontSize:14, flexShrink:0}}>
            {initials(c.firstName, c.lastName)}
          </div>
          <div>
            <div style={{fontWeight:500, fontSize:14, color:BRAND.black}}>{c.firstName} {c.lastName}</div>
            <div style={{fontSize:12, color:BRAND.gray, marginTop:1}}>{c.org}</div>
          </div>
        </div>
        <button onClick={onClose} style={{...btnSecondary, padding:"3px 9px", fontSize:12}}>✕</button>
      </div>

      <div style={{display:"flex", gap:5, flexWrap:"wrap", marginBottom:12}}>
        <span style={pill(TIER_COLORS[c.tier], TIER_BG[c.tier])}>{c.tier}</span>
        <span style={pill(STAGE_COLORS[c.stage], STAGE_BG[c.stage])}>{c.stage}</span>
        <span style={tag}>{c.segment}</span>
      </div>

      <div style={{borderTop:`1px solid ${BRAND.border}`, paddingTop:12, marginBottom:12}}>
        {[["Island", c.island||"—"], ["Deal Value", fmt$(c.value)], ["Date", c.createdOn||"—"], ["Source", c.source||"—"], ["Email", c.email||"—"], ["Phone", c.phone||"—"]].map(([k, v]) => (
          <div key={k} style={{display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:7}}>
            <span style={{color:BRAND.gray}}>{k}</span>
            <span style={{color:BRAND.black, maxWidth:190, textAlign:"right", wordBreak:"break-word"}}>{v}</span>
          </div>
        ))}
      </div>

      {c.message && (
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11, color:BRAND.gray, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4}}>Original message</div>
          <div style={{fontSize:12, color:BRAND.gray, lineHeight:1.6, background:BRAND.sandLight, borderRadius:6, padding:"8px 10px", maxHeight:90, overflowY:"auto"}}>{c.message}</div>
        </div>
      )}

      <div style={{marginBottom:10}}>
        <div style={label}>Stage</div>
        <select value={c.stage} onChange={e => updateContact(c.id, {stage: e.target.value})} style={{...selectStyle, width:"100%"}}>
          {STAGES.map(st => <option key={st}>{st}</option>)}
        </select>
      </div>

      <div style={{marginBottom:12}}>
        <div style={label}>Tier</div>
        <select value={c.tier} onChange={e => updateContact(c.id, {tier: e.target.value})} style={{...selectStyle, width:"100%"}}>
          {["Hot","Warm","Cold"].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {c.tags?.length > 0 && (
        <div style={{display:"flex", gap:4, flexWrap:"wrap", marginBottom:12}}>
          {c.tags.map(t => <span key={t} style={tag}>{t}</span>)}
        </div>
      )}

      {c.notes && (
        <div style={{marginBottom:12}}>
          <div style={label}>Notes</div>
          <div style={{fontSize:12, color:BRAND.gray, lineHeight:1.6, whiteSpace:"pre-wrap"}}>{c.notes}</div>
        </div>
      )}

      <div style={{marginBottom:12}}>
        <div style={label}>Add note</div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          placeholder="Type a note…"
          style={{...inputStyle, resize:"vertical"}}
        />
        <button
          style={{...btnPrimary, marginTop:6, width:"100%"}}
          onClick={() => {
            if (note.trim()) {
              updateContact(c.id, {notes: (c.notes ? c.notes + "\n\n" : "") + new Date().toLocaleDateString() + ": " + note});
              setNote("");
            }
          }}
        >
          Save note
        </button>
      </div>

      {/* Pricing calculator */}
      <div style={{marginBottom:12}}>
        <button
          onClick={() => setShowCalc(s => !s)}
          style={{...btnSecondary, width:"100%", fontSize:12, textAlign:"left", display:"flex", justifyContent:"space-between"}}
        >
          <span>⊕ Estimate deal value</span>
          <span style={{color:BRAND.gray}}>{showCalc ? "▲" : "▼"}</span>
        </button>
        {showCalc && (
          <div style={{marginTop:8}}>
            <PricingCalculator
              currentValue={c.value}
              onApply={val => updateContact(c.id, {value: val})}
            />
          </div>
        )}
      </div>

      <button style={{...btnPrimary, width:"100%", marginBottom:6, background:BRAND.sand}} onClick={() => generateEmail(c)}>
        ✉ Draft reply email
      </button>
      <button onClick={() => deleteContact(c.id)} style={{...btnSecondary, width:"100%", fontSize:12, color:BRAND.red, borderColor:BRAND.red+"44"}}>
        Remove contact
      </button>
    </div>
  );
}
