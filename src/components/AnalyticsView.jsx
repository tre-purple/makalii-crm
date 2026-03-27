import { BRAND, SEGMENTS, STAGES, STAGE_COLORS, TIER_COLORS, TIER_BG } from "../constants/brand";
import { pill, card, metricCard, btnSecondary } from "../constants/styles";
import { fmt$ } from "../utils/helpers";

export default function AnalyticsView({ contacts, onSelectContact, generateEmail }) {
  const bySeg = SEGMENTS
    .map(seg => ({ seg, count: contacts.filter(c => c.segment === seg).length }))
    .filter(x => x.count > 0)
    .sort((a, b) => b.count - a.count);
  const maxC = Math.max(...bySeg.map(x => x.count), 1);

  const byStage = STAGES
    .map(st => ({ st, count: contacts.filter(c => c.stage === st).length }))
    .filter(x => x.count > 0);
  const maxSt = Math.max(...byStage.map(x => x.count), 1);

  const byTier = [["Hot", BRAND.navy, BRAND.navyLight], ["Warm", BRAND.sand, BRAND.sandLight], ["Cold", BRAND.gray, BRAND.grayLight]]
    .map(([t, color, bg]) => ({ t, color, bg, count: contacts.filter(c => c.tier === t).length }));

  const actionableC = contacts.filter(c => c.tags?.includes("Actionable"));

  const contractContacts = contacts.filter(c => c.revenueType === "Contract Project");
  const mailInContacts   = contacts.filter(c => c.revenueType === "Mail-In Testing");
  const untypedContacts  = contacts.filter(c => !c.revenueType);

  const contractTotal = contractContacts.reduce((s, c) => s + (c.contractValue || 0), 0);
  const mailInTotal   = mailInContacts.reduce((s, c) => s + (c.value || 0), 0);
  const untypedTotal  = untypedContacts.reduce((s, c) => s + (c.value || 0), 0);
  const totalVal      = contractTotal + mailInTotal + untypedTotal;

  return (
    <div style={{flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:12}}>
      <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
        {[
          ["Total Contacts",  contacts.length,                                                        "inquiries logged"],
          ["Hot Leads",       contacts.filter(c => c.tier === "Hot").length,                          "need attention"],
          ["Actionable",      actionableC.length,                                                      "ready to respond"],
          ["Pipeline Value",  fmt$(totalVal),                                                          "estimated"],
          ["Active",          contacts.filter(c => !["Closed Won","Closed Lost"].includes(c.stage)).length, "in pipeline"],
        ].map(([l, v, sub]) => (
          <div key={l} style={metricCard}>
            <div style={{fontSize:11, color:BRAND.gray, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4}}>{l}</div>
            <div style={{fontSize:24, fontWeight:500, color:BRAND.navy}}>{v}</div>
            <div style={{fontSize:11, color:BRAND.gray, marginTop:2}}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
        <div style={{...card, flex:2, minWidth:240}}>
          <div style={{fontWeight:500, fontSize:14, color:BRAND.navy, marginBottom:14}}>Inquiries by segment</div>
          {bySeg.map(({ seg, count }) => (
            <div key={seg} style={{marginBottom:10}}>
              <div style={{display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:3}}>
                <span style={{color:BRAND.gray}}>{seg}</span>
                <span style={{color:BRAND.navy, fontWeight:500}}>{count}</span>
              </div>
              <div style={{height:6, borderRadius:3, background:BRAND.sandLight, overflow:"hidden"}}>
                <div style={{height:"100%", borderRadius:3, background:BRAND.navy, width:(count/maxC*100)+"%"}}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{...card, flex:1, minWidth:180}}>
          <div style={{fontWeight:500, fontSize:14, color:BRAND.navy, marginBottom:14}}>Stage breakdown</div>
          {byStage.map(({ st, count }) => (
            <div key={st} style={{marginBottom:10}}>
              <div style={{display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:3}}>
                <span style={{color:BRAND.gray}}>{st}</span>
                <span style={{color:STAGE_COLORS[st], fontWeight:500}}>{count}</span>
              </div>
              <div style={{height:5, borderRadius:3, background:BRAND.sandLight, overflow:"hidden"}}>
                <div style={{height:"100%", borderRadius:3, background:STAGE_COLORS[st], width:(count/maxSt*100)+"%"}}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{...card, flex:1, minWidth:150}}>
          <div style={{fontWeight:500, fontSize:14, color:BRAND.navy, marginBottom:14}}>By tier</div>
          {byTier.map(({ t, color, bg, count }) => (
            <div key={t} style={{marginBottom:10, padding:"12px 14px", borderRadius:8, background:bg, border:`1px solid ${color}22`}}>
              <div style={{fontSize:11, fontWeight:500, color, textTransform:"uppercase", letterSpacing:"0.05em"}}>{t}</div>
              <div style={{fontSize:26, fontWeight:500, color}}>{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue type breakdown */}
      <div style={{...card}}>
        <div style={{fontWeight:500, fontSize:14, color:BRAND.navy, marginBottom:12}}>Pipeline by revenue type</div>
        <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
          {[
            ["Contract Project", contractContacts.length, contractTotal, BRAND.navy,  BRAND.navyLight],
            ["Mail-In Testing",  mailInContacts.length,  mailInTotal,   BRAND.green,  BRAND.greenLight],
            ["Untyped",          untypedContacts.length, untypedTotal,  BRAND.gray,   BRAND.grayLight],
          ].map(([lbl, count, total, color, bg]) => (
            <div key={lbl} style={{flex:1, minWidth:140, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 14px", borderRadius:8, background:bg, border:`1px solid ${color}22`}}>
              <div>
                <div style={{fontSize:12, fontWeight:500, color}}>{lbl}</div>
                <div style={{fontSize:11, color:BRAND.gray, marginTop:2}}>{count} contact{count !== 1 ? "s" : ""}</div>
              </div>
              <div style={{fontSize:18, fontWeight:500, color}}>{total > 0 ? fmt$(total) : "—"}</div>
            </div>
          ))}
        </div>
        {contractContacts.length === 0 && mailInContacts.length === 0 && (
          <div style={{fontSize:12, color:BRAND.gray, marginTop:10}}>No revenue types assigned yet — set one in each contact's detail panel.</div>
        )}
      </div>

      <div style={card}>
        <div style={{fontWeight:500, fontSize:14, color:BRAND.navy, marginBottom:12}}>Action items — needs response</div>
        {actionableC.length === 0 ? (
          <div style={{fontSize:13, color:BRAND.gray}}>No actionable items tagged.</div>
        ) : (
          actionableC.map(c => (
            <div key={c.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${BRAND.border}`}}>
              <div>
                <span style={{fontSize:13, fontWeight:500, color:BRAND.navy}}>{c.firstName} {c.lastName}</span>
                <span style={{fontSize:12, color:BRAND.gray, marginLeft:8}}>{c.org}</span>
              </div>
              <div style={{display:"flex", gap:6, alignItems:"center"}}>
                <span style={pill(TIER_COLORS[c.tier], TIER_BG[c.tier])}>{c.tier}</span>
                <button style={{...btnSecondary, fontSize:12}} onClick={() => onSelectContact(c)}>View</button>
                <button style={{...btnSecondary, fontSize:12, color:BRAND.sand, borderColor:BRAND.sandMid}} onClick={() => generateEmail(c)}>✉ Draft</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
