import { BRAND } from "./brand";

export const inputStyle = {
  width:"100%", padding:"8px 11px", borderRadius:6,
  border:`1px solid ${BRAND.border}`, background:BRAND.white,
  color:BRAND.black, fontSize:13, boxSizing:"border-box",
  fontFamily:"inherit", outline:"none",
};

export const selectStyle = {
  padding:"7px 11px", borderRadius:6, border:`1px solid ${BRAND.border}`,
  background:BRAND.white, color:BRAND.black, fontSize:13,
  cursor:"pointer", fontFamily:"inherit",
};

export const btnPrimary = {
  padding:"8px 16px", borderRadius:6, border:"none",
  background:BRAND.navy, color:BRAND.white, cursor:"pointer",
  fontSize:13, fontWeight:500, fontFamily:"inherit",
};

export const btnSecondary = {
  padding:"7px 14px", borderRadius:6, border:`1px solid ${BRAND.border}`,
  background:BRAND.white, color:BRAND.navy, cursor:"pointer",
  fontSize:13, fontFamily:"inherit",
};

export const pill = (color, bg) => ({
  display:"inline-flex", alignItems:"center", padding:"2px 9px",
  borderRadius:99, fontSize:11, fontWeight:500, color, background:bg,
  letterSpacing:"0.01em",
});

export const tag = {
  display:"inline-flex", padding:"2px 8px", borderRadius:99,
  fontSize:11, background:BRAND.sandLight, color:BRAND.sand,
  border:`0.5px solid ${BRAND.sandMid}`,
};

export const label = {
  fontSize:11, color:BRAND.gray, fontWeight:500, marginBottom:4,
  display:"block", textTransform:"uppercase", letterSpacing:"0.05em",
};

export const card = {
  background:BRAND.white, border:`1px solid ${BRAND.border}`,
  borderRadius:10, padding:"14px 16px",
};

export const metricCard = {
  background:BRAND.sandLight, borderRadius:8,
  padding:"14px 16px", minWidth:110,
};
