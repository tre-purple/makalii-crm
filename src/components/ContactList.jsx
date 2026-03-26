import { BRAND, STAGES, SEGMENTS, TIER_COLORS, TIER_BG, STAGE_COLORS, STAGE_BG } from "../constants/brand";
import { inputStyle, selectStyle, btnPrimary, btnSecondary, pill, tag, card } from "../constants/styles";
import { initials, avatarColor } from "../utils/helpers";

export default function ContactList({
  filtered, selected, setSelected,
  search, setSearch,
  filterTier, setFilterTier,
  filterSeg, setFilterSeg,
  filterStage, setFilterStage,
  onOpenAdd, onOpenImport, generateEmail,
}) {
  return (
    <div style={{display:"flex", flexDirection:"column", height:"100%", overflow:"hidden"}}>

      {/* Sticky filter bar */}
      <div style={{...card, marginBottom:12, flexShrink:0}}>
        <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, org, email…" style={{...inputStyle, flex:1, minWidth:180}}/>
          <select value={filterTier} onChange={e => setFilterTier(e.target.value)} style={selectStyle}>
            <option value="All">All Tiers</option>
            {["Hot","Warm","Cold"].map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={filterSeg} onChange={e => setFilterSeg(e.target.value)} style={selectStyle}>
            <option value="All">All Segments</option>
            {SEGMENTS.map(sg => <option key={sg}>{sg}</option>)}
          </select>
          <select value={filterStage} onChange={e => setFilterStage(e.target.value)} style={selectStyle}>
            <option value="All">All Stages</option>
            {STAGES.map(st => <option key={st}>{st}</option>)}
          </select>
          <button className="crm-icon-btn" style={{...btnSecondary, color:BRAND.sand, borderColor:BRAND.sandMid}} onClick={onOpenImport}>↑ Import CSV</button>
          <button style={btnPrimary} onClick={onOpenAdd}>+ Add contact</button>
        </div>
      </div>

      {/* Scrollable contact list */}
      <div style={{overflowY:"auto", flex:1}}>
        <div style={{fontSize:12, color:BRAND.gray, marginBottom:8, paddingLeft:2}}>
          {filtered.length} contact{filtered.length !== 1 ? "s" : ""} shown
        </div>

        {filtered.map(c => (
          <div
            key={c.id}
            className={`crm-card${selected?.id === c.id ? " active" : ""}`}
            onClick={() => setSelected(selected?.id === c.id ? null : c)}
            style={{...card, marginBottom:8, display:"flex", gap:12, alignItems:"flex-start"}}
          >
            <div style={{width:38, height:38, borderRadius:"50%", background:avatarColor(c.id), display:"flex", alignItems:"center", justifyContent:"center", color:BRAND.white, fontWeight:500, fontSize:13, flexShrink:0}}>
              {initials(c.firstName, c.lastName)}
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:4}}>
                <span style={{fontWeight:500, fontSize:14, color:BRAND.black}}>{c.firstName} {c.lastName}</span>
                <span style={{fontSize:12, color:BRAND.gray}}>{c.createdOn}</span>
              </div>
              <div style={{fontSize:13, color:BRAND.gray, marginTop:1}}>{c.org}{c.island ? " · " + c.island : ""}</div>
              {c.message && (
                <div style={{fontSize:12, color:BRAND.gray, marginTop:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:460, opacity:0.85}}>{c.message}</div>
              )}
              <div style={{display:"flex", gap:5, marginTop:7, flexWrap:"wrap"}}>
                <span style={pill(TIER_COLORS[c.tier], TIER_BG[c.tier])}>{c.tier}</span>
                <span style={pill(STAGE_COLORS[c.stage], STAGE_BG[c.stage])}>{c.stage}</span>
                <span style={tag}>{c.segment}</span>
                {c.tags?.slice(0,2).map(t => <span key={t} style={tag}>{t}</span>)}
              </div>
            </div>
            <button
              className="crm-icon-btn"
              onClick={e => { e.stopPropagation(); generateEmail(c); }}
              style={{...btnSecondary, padding:"5px 10px", fontSize:12, flexShrink:0, color:BRAND.sand, borderColor:BRAND.sandMid}}
            >
              ✉
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{...card, textAlign:"center", color:BRAND.gray, fontSize:13, padding:40}}>
            No contacts match your filters.
          </div>
        )}

        {/* Bottom padding so last card isn't flush against edge */}
        <div style={{height:16}}/>
      </div>
    </div>
  );
}
