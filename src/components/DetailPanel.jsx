import { useState, useEffect } from "react";
import { BRAND, STAGES, TIER_COLORS, TIER_BG, STAGE_COLORS, STAGE_BG, REVENUE_TYPES, QUOTE_STATUSES, QUOTE_STATUS_COLORS, QUOTE_STATUS_BG } from "../constants/brand";
import { inputStyle, selectStyle, btnPrimary, btnSecondary, pill, tag, label } from "../constants/styles";
import { initials, avatarColor, fmt$ } from "../utils/helpers";
import PricingCalculator from "./PricingCalculator";

export default function DetailPanel({ c, onClose, updateContact, generateEmail, deleteContact }) {
  const [note, setNote] = useState("");
  const [showCalc, setShowCalc] = useState(false);
  const [scopeNotes, setScopeNotes] = useState(c.scopeNotes || "");

  useEffect(() => {
    setScopeNotes(c.scopeNotes || "");
  }, [c.id]);

  const isContract = c.revenueType === "Contract Project";
  const isMailIn   = c.revenueType === "Mail-In Testing";
  const valueLabel = isContract ? "Contract Value" : "Deal Value";
  const valueAmt   = isContract ? (c.contractValue || 0) : (c.value || 0);

  const qs = c.quoteStatus || "No Quote Sent";

  return (
    <div style={{padding:"20px", minHeight:"100%", boxSizing:"border-box"}}>
      {/* Header */}
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
        {isContract && (
          <span style={pill(QUOTE_STATUS_COLORS[qs], QUOTE_STATUS_BG[qs])}>{qs}</span>
        )}
      </div>

      {/* Info rows */}
      <div style={{borderTop:`1px solid ${BRAND.border}`, paddingTop:12, marginBottom:12}}>
        {[
          ["Island",      c.island||"—"],
          [valueLabel,    fmt$(valueAmt)],
          ["Date",        c.createdOn||"—"],
          ["Source",      c.source||"—"],
          ["Email",       c.email||"—"],
          ["Phone",       c.phone||"—"],
        ].map(([k, v]) => (
          <div key={k} style={{display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:7}}>
            <span style={{color:BRAND.gray}}>{k}</span>
            <span style={{color:BRAND.black, maxWidth:190, textAlign:"right", wordBreak:"break-word"}}>{v}</span>
          </div>
        ))}
      </div>

      {/* Revenue Type toggle */}
      <div style={{marginBottom:12}}>
        <div style={label}>Revenue Type</div>
        <div style={{display:"flex", gap:6, marginTop:4}}>
          {REVENUE_TYPES.map(rt => {
            const active = c.revenueType === rt;
            return (
              <button
                key={rt}
                onClick={() => updateContact(c.id, { revenueType: active ? null : rt })}
                style={{
                  padding:"5px 12px", borderRadius:99, border:"1px solid", fontSize:12, cursor:"pointer",
                  fontWeight: active ? 500 : 400,
                  borderColor: active ? BRAND.navy : BRAND.border,
                  background:  active ? BRAND.navyLight : BRAND.white,
                  color:       active ? BRAND.navy : BRAND.gray,
                }}
              >
                {rt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contract Project section */}
      {isContract && (
        <div style={{background:BRAND.navyLight, borderRadius:8, padding:"12px 14px", marginBottom:12, border:`1px solid ${BRAND.navy}22`}}>
          <div style={{fontSize:11, fontWeight:500, color:BRAND.navy, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:12}}>Contract Project Details</div>

          {/* Contract Value */}
          <div style={{marginBottom:10}}>
            <div style={label}>Contract Value ($)</div>
            <input
              type="number" min={0}
              value={c.contractValue || ""}
              onChange={e => updateContact(c.id, { contractValue: +e.target.value || 0 })}
              placeholder="0"
              style={inputStyle}
            />
          </div>

          {/* Acreage + Sample Sites */}
          <div style={{display:"flex", gap:10, marginBottom:10}}>
            <div style={{flex:1}}>
              <div style={label}>Acreage</div>
              <input
                type="number" min={0}
                value={c.acreage || ""}
                onChange={e => updateContact(c.id, { acreage: +e.target.value || null })}
                placeholder="—"
                style={inputStyle}
              />
            </div>
            <div style={{flex:1}}>
              <div style={label}>Sample Sites</div>
              <input
                type="number" min={0}
                value={c.sampleSites || ""}
                onChange={e => updateContact(c.id, { sampleSites: +e.target.value || null })}
                placeholder="—"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Education Workshops */}
          <div style={{marginBottom:10}}>
            <div style={label}>Education Workshops</div>
            <div style={{display:"flex", gap:6, marginTop:4}}>
              {[true, false].map(val => {
                const active = c.educationWorkshops === val;
                return (
                  <button
                    key={String(val)}
                    onClick={() => updateContact(c.id, { educationWorkshops: val })}
                    style={{
                      padding:"5px 16px", borderRadius:99, border:"1px solid", fontSize:12, cursor:"pointer",
                      fontWeight: active ? 500 : 400,
                      borderColor: active ? BRAND.navy : BRAND.border,
                      background:  active ? BRAND.navy : BRAND.white,
                      color:       active ? BRAND.white : BRAND.gray,
                    }}
                  >
                    {val ? "Yes" : "No"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quote Status */}
          <div style={{marginBottom:10}}>
            <div style={label}>Quote Status</div>
            <select
              value={qs}
              onChange={e => updateContact(c.id, { quoteStatus: e.target.value })}
              style={{...selectStyle, width:"100%"}}
            >
              {QUOTE_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Scope Notes */}
          <div>
            <div style={label}>Scope Notes</div>
            <textarea
              value={scopeNotes}
              onChange={e => setScopeNotes(e.target.value)}
              onBlur={() => { if (scopeNotes !== (c.scopeNotes || "")) updateContact(c.id, { scopeNotes }); }}
              rows={3}
              placeholder="Project scope, deliverables, timeline…"
              style={{...inputStyle, resize:"vertical", lineHeight:1.6}}
            />
          </div>
        </div>
      )}

      {/* Mail-In Testing section */}
      {isMailIn && (
        <div style={{background:BRAND.greenLight, borderRadius:8, padding:"12px 14px", marginBottom:12, border:`1px solid ${BRAND.green}33`}}>
          <div style={{fontSize:11, fontWeight:500, color:BRAND.green, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8}}>Mail-In Testing</div>
          <div style={{fontSize:13, color:BRAND.gray, marginBottom:12}}>📬 Mail-in packages coming soon</div>
          <div>
            <div style={label}>Price Override ($)</div>
            <input
              type="number" min={0}
              value={c.value || ""}
              onChange={e => updateContact(c.id, { value: +e.target.value || 0 })}
              placeholder="0"
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {/* Original message */}
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

      {/* Pricing calculator — hidden for Contract contacts (they use Contract Value directly) */}
      {!isContract && (
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
      )}

      <button style={{...btnPrimary, width:"100%", marginBottom:6, background:BRAND.sand}} onClick={() => generateEmail(c)}>
        ✉ Draft reply email
      </button>
      <button onClick={() => deleteContact(c.id)} style={{...btnSecondary, width:"100%", fontSize:12, color:BRAND.red, borderColor:BRAND.red+"44"}}>
        Remove contact
      </button>
    </div>
  );
}
