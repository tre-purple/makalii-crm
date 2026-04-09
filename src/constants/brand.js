export const BRAND = {
  navy:      "#1B2A4A",
  navyMid:   "#2D3F61",
  navyLight: "#E8EBF2",
  sand:      "#B5A48A",
  sandLight: "#F2EDE4",
  sandMid:   "#D6C9B2",
  black:     "#111111",
  gray:      "#6B6B6B",
  grayLight: "#F4F2EE",
  border:    "#DDD8CF",
  white:     "#FFFFFF",
  green:     "#3B6B3E",
  greenLight:"#E6F0E6",
  red:       "#8B2E2E",
  redLight:  "#F5E8E8",
  amber:     "#8B6914",
  amberLight:"#FBF3E0",
};

export const STAGES = ["Lead","Contacted","Meeting Set","Proposal Sent","Negotiating","Closed Won","Closed Lost"];

export const STAGE_COLORS = {
  "Lead":         BRAND.gray,
  "Contacted":    BRAND.navy,
  "Meeting Set":  BRAND.green,
  "Proposal Sent":BRAND.amber,
  "Negotiating":  BRAND.sand,
  "Closed Won":   BRAND.green,
  "Closed Lost":  BRAND.red,
};

export const STAGE_BG = {
  "Lead":         BRAND.grayLight,
  "Contacted":    BRAND.navyLight,
  "Meeting Set":  BRAND.greenLight,
  "Proposal Sent":BRAND.amberLight,
  "Negotiating":  BRAND.sandLight,
  "Closed Won":   BRAND.greenLight,
  "Closed Lost":  BRAND.redLight,
};

export const SEGMENTS = [
  "Soil Testing Inquiry","Government/Policy","Nonprofit/Community",
  "Research/Academic","Volunteer/Intern","Partnership","Data/Tech",
];

export const TIER_COLORS = { "Hot":BRAND.navy, "Warm":BRAND.sand, "Cold":BRAND.gray };
export const TIER_BG     = { "Hot":BRAND.navyLight, "Warm":BRAND.sandLight, "Cold":BRAND.grayLight };

export const ISLANDS = ["Oʻahu","Hawaiʻi Island","Maui","Kauaʻi","Molokaʻi","Lānaʻi","Statewide","Mainland"];

export const REVENUE_TYPES = ["Contract Project", "Mail-In Testing"];

export const JOURNEY_TYPES = ["Intro", "Follow-Up", "Updates", "Returning"];
export const JOURNEY_TYPE_COLORS = { Intro: BRAND.gray, "Follow-Up": BRAND.sand, Updates: BRAND.navy, Returning: BRAND.green };
export const JOURNEY_TYPE_BG     = { Intro: BRAND.grayLight, "Follow-Up": BRAND.sandLight, Updates: BRAND.navyLight, Returning: BRAND.greenLight };
export const JOURNEY_TYPE_DESC   = {
  Intro:       "First-touch outreach — introduce Makaliʻi Metrics and offer a clear next step",
  "Follow-Up": "Nurture outreach — they know us, keep the conversation going",
  Updates:     "Share news, services, or program updates with engaged contacts",
  Returning:   "Re-engagement — past relationship or prior work together",
};

export const QUOTE_STATUSES = ["No Quote Sent","Quote Drafted","Quote Sent","Quote Accepted","Quote Declined"];
export const QUOTE_STATUS_COLORS = {
  "No Quote Sent":  BRAND.gray,
  "Quote Drafted":  BRAND.amber,
  "Quote Sent":     BRAND.navy,
  "Quote Accepted": BRAND.green,
  "Quote Declined": BRAND.red,
};
export const QUOTE_STATUS_BG = {
  "No Quote Sent":  BRAND.grayLight,
  "Quote Drafted":  BRAND.amberLight,
  "Quote Sent":     BRAND.navyLight,
  "Quote Accepted": BRAND.greenLight,
  "Quote Declined": BRAND.redLight,
};
