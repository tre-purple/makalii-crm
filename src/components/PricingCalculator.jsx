import { useState } from "react";
import { BRAND } from "../constants/brand";
import { btnPrimary, label, inputStyle } from "../constants/styles";

export const PACKAGES = [
  { id:"ph",            name:"Basic pH + Salinity",               desc:"pH + electrical conductivity (ECe salinity)",              price:45  },
  { id:"standard",      name:"Standard Fertility Panel",          desc:"NPK, pH, Ca, Mg, S — major nutrients with interpretation", price:75  },
  { id:"comprehensive", name:"Comprehensive Nutrient Panel",      desc:"15+ elements, micronutrients, full report",                price:120 },
  { id:"hawaii",        name:"Hawaiʻi Soil Health Package",       desc:"Full scoring, biological activity, Hawaii-specific recs",  price:175 },
  { id:"multi",         name:"Multi-Element Panel",               desc:"30+ elements including heavy metals, trace minerals",      price:275 },
  { id:"carbon",        name:"Carbon Smart Baseline Package",     desc:"Carbon fractionation, SOC, reporting for grants/programs", price:225 },
];

const VOLUME_THRESHOLD = 10;
const VOLUME_DISCOUNT   = 0.15;

const MAINLAND_REFS = [
  { lab:"Ward Laboratories (NE)", range:"$17–$50" },
  { lab:"OSU Extension Soil Lab", range:"$20–$65" },
  { lab:"UConn Soil Lab",         range:"$20–$80" },
];

export default function PricingCalculator({ currentValue, onApply }) {
  const [pkgId,    setPkgId]    = useState("");
  const [qty,      setQty]      = useState(1);
  const [showInfo, setShowInfo] = useState(false);

  const pkg       = PACKAGES.find(p => p.id === pkgId);
  const unitPrice = pkg?.price ?? 0;
  const hasDiscount = qty >= VOLUME_THRESHOLD;
  const subtotal  = unitPrice * qty;
  const discount  = hasDiscount ? Math.round(subtotal * VOLUME_DISCOUNT) : 0;
  const total     = subtotal - discount;

  return (
    <div style={{borderRadius:8, border:`1px solid ${BRAND.border}`, overflow:"hidden"}}>
      {/* Header */}
      <div style={{background:BRAND.navyLight, padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <span style={{fontSize:11, fontWeight:500, color:BRAND.navy, textTransform:"uppercase", letterSpacing:"0.05em"}}>Estimate Deal Value</span>
        <button
          onClick={() => setShowInfo(s => !s)}
          style={{fontSize:11, color:BRAND.sand, background:"none", border:"none", cursor:"pointer", padding:0, textDecoration:"underline"}}
        >
          {showInfo ? "Hide" : "vs. mainland labs ↗"}
        </button>
      </div>

      {/* Mainland comparison */}
      {showInfo && (
        <div style={{background:BRAND.sandLight, padding:"10px 12px", borderBottom:`1px solid ${BRAND.border}`}}>
          <div style={{fontSize:11, fontWeight:500, color:BRAND.gray, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6}}>Mainland lab comparison</div>
          {MAINLAND_REFS.map(({ lab, range }) => (
            <div key={lab} style={{display:"flex", justifyContent:"space-between", fontSize:11, color:BRAND.gray, marginBottom:3}}>
              <span>{lab}</span>
              <span style={{fontWeight:500}}>{range}</span>
            </div>
          ))}
          <div style={{marginTop:8, fontSize:11, color:BRAND.amber, lineHeight:1.5}}>
            Mainland prices are lower — but don't include Hawaii-specific interpretation, island-appropriate recommendations, or local turnaround.
          </div>
        </div>
      )}

      {/* Calculator body */}
      <div style={{padding:"12px"}}>
        {/* Package selector */}
        <div style={{marginBottom:10}}>
          <div style={label}>Test package</div>
          <select
            value={pkgId}
            onChange={e => setPkgId(e.target.value)}
            style={{...inputStyle, cursor:"pointer"}}
          >
            <option value="">Select a package…</option>
            {PACKAGES.map(p => (
              <option key={p.id} value={p.id}>{p.name} — ${p.price}/sample</option>
            ))}
          </select>
          {pkg && (
            <div style={{fontSize:11, color:BRAND.gray, marginTop:4, lineHeight:1.5}}>{pkg.desc}</div>
          )}
        </div>

        {/* Quantity */}
        <div style={{marginBottom:12}}>
          <div style={label}>Number of samples</div>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <input
              type="number"
              min={1}
              max={500}
              value={qty}
              onChange={e => setQty(Math.max(1, +e.target.value || 1))}
              style={{...inputStyle, width:80}}
            />
            {qty >= VOLUME_THRESHOLD && (
              <span style={{fontSize:11, color:BRAND.green, fontWeight:500}}>15% volume discount applied</span>
            )}
            {qty > 0 && qty < VOLUME_THRESHOLD && (
              <span style={{fontSize:11, color:BRAND.gray}}>{VOLUME_THRESHOLD - qty} more for 15% off</span>
            )}
          </div>
        </div>

        {/* Price breakdown */}
        {pkg && (
          <div style={{background:BRAND.grayLight, borderRadius:6, padding:"10px 12px", marginBottom:10}}>
            <div style={{display:"flex", justifyContent:"space-between", fontSize:12, color:BRAND.gray, marginBottom:4}}>
              <span>${pkg.price} × {qty} sample{qty !== 1 ? "s" : ""}</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            {hasDiscount && (
              <div style={{display:"flex", justifyContent:"space-between", fontSize:12, color:BRAND.green, marginBottom:4}}>
                <span>Volume discount (15%)</span>
                <span>−${discount.toLocaleString()}</span>
              </div>
            )}
            <div style={{display:"flex", justifyContent:"space-between", fontSize:14, fontWeight:500, color:BRAND.navy, borderTop:`1px solid ${BRAND.border}`, paddingTop:6, marginTop:2}}>
              <span>Estimated total</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Apply button */}
        <div style={{display:"flex", gap:6, alignItems:"center"}}>
          <button
            style={{...btnPrimary, flex:1, opacity:!pkg ? 0.4 : 1, cursor:!pkg ? "not-allowed" : "pointer"}}
            disabled={!pkg}
            onClick={() => pkg && onApply(total)}
          >
            Apply ${total.toLocaleString()} to deal value
          </button>
          {currentValue > 0 && (
            <span style={{fontSize:11, color:BRAND.gray, whiteSpace:"nowrap"}}>current: ${currentValue.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
