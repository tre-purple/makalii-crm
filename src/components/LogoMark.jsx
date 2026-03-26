import { BRAND } from "../constants/brand";

export default function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <line x1="6"  y1="4" x2="6"  y2="24" stroke={BRAND.sand} strokeWidth="1.2"/>
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
}
