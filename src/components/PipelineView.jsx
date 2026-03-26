import { BRAND, STAGES, STAGE_COLORS, STAGE_BG, TIER_COLORS, TIER_BG } from "../constants/brand";
import { pill, card } from "../constants/styles";
import { fmt$ } from "../utils/helpers";

export default function PipelineView({ pipelineByStage, onSelectContact }) {
  return (
    <div style={{flex:1, overflowX:"auto"}}>
      <div style={{display:"flex", gap:10, minWidth:960}}>
        {STAGES.map(stage => {
          const cs = pipelineByStage[stage];
          const sv = cs.reduce((s, c) => s + c.value, 0);
          return (
            <div key={stage} style={{flex:1, minWidth:128}}>
              <div style={{...card, marginBottom:8, padding:"8px 12px", background:STAGE_BG[stage], borderColor:STAGE_COLORS[stage]+"44"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <span style={{fontSize:11, fontWeight:500, color:STAGE_COLORS[stage], textTransform:"uppercase", letterSpacing:"0.05em"}}>{stage}</span>
                  <span style={{fontSize:11, color:BRAND.gray, background:BRAND.white, borderRadius:99, padding:"1px 7px", border:`1px solid ${BRAND.border}`}}>{cs.length}</span>
                </div>
                <div style={{fontSize:11, color:BRAND.gray, marginTop:3}}>{sv > 0 ? fmt$(sv) : "—"}</div>
              </div>
              {cs.map(c => (
                <div key={c.id} onClick={() => onSelectContact(c)} style={{...card, marginBottom:8, cursor:"pointer", padding:"10px 12px"}}>
                  <div style={{fontWeight:500, fontSize:13, color:BRAND.navy, marginBottom:2}}>{c.firstName} {c.lastName}</div>
                  <div style={{fontSize:11, color:BRAND.gray, marginBottom:7, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{c.org}</div>
                  <div style={{display:"flex", gap:4, flexWrap:"wrap"}}>
                    <span style={pill(TIER_COLORS[c.tier], TIER_BG[c.tier])}>{c.tier}</span>
                    {c.value > 0 && <span style={{fontSize:11, color:BRAND.gray}}>{fmt$(c.value)}</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
