const SIG = `\n\nDaniel Richardson\ninfo@makaliimetrics.com\nMakaliʻi Metrics | makaliimetrics.com`;

export const JOURNEY_TEMPLATES = {
  Intro: {
    subject: "Aloha from Makaliʻi Metrics — Hawaiʻi's Soil Testing Lab",
    body: `Aloha {firstName},\n\nMahalo for connecting — we are grateful for the opportunity to share what we are building at Makaliʻi Metrics.\n\nWe believe Hawaiʻi has the capacity to lead in ʻāina-based science and analysis. That belief shapes everything we do — from how we interpret soil data to how we communicate findings in ways that are locally grounded and culturally meaningful.\n\nOur analytical space is now open and actively receiving samples. We offer soil health panels with Hawaiʻi-specific interpretation and fast turnaround, rooted in the understanding that those who steward the ʻāina deserve timely, relevant data.\n\nI would love to connect and learn more about your work. Would you be open to a short conversation this week?\n\nA hui hou,${SIG}`,
  },
  "Follow-Up": {
    subject: "Following up — Makaliʻi Metrics",
    body: `Aloha {firstName},\n\nI wanted to follow up on my previous message — I hope it found you well.\n\nWe remain committed to supporting the important work happening across our islands. If the timing wasn't right before, no worries — I would still welcome the chance to connect whenever it makes sense for you.\n\nMahalo for your time.\n\nA hui hou,${SIG}`,
  },
  Updates: {
    subject: "A quick update from Makaliʻi Metrics",
    body: `Aloha {firstName},\n\nMahalo for staying connected with Makaliʻi Metrics. We have been continuing to grow — our analytical space is active, our capacity has expanded, and we are deepening the tools available to ʻāina practitioners across the pae ʻāina.\n\nI would love to reconnect and hear how your work is going. Is there anything we can support you with?\n\nMālama,${SIG}`,
  },
  Returning: {
    subject: "Aloha again from Makaliʻi Metrics",
    body: `Aloha {firstName},\n\nIt has been a while — I hope things are going well for you and your work.\n\nSince we last connected, Makaliʻi Metrics has continued to grow and evolve. New testing capabilities, expanded capacity, and a deeper commitment to the communities and lands we serve. I wanted to reach out to see if there is an opportunity to reconnect and explore how we can be of service.\n\nA hui hou,${SIG}`,
  },
};

export const EMAIL_TEMPLATES = {
  "Soil Testing Inquiry": {
    subject: (c) => `Re: Your Soil Testing Inquiry — Makaliʻi Metrics`,
    body: (c) => `Aloha ${c.firstName},\n\nMahalo for reaching out to Makaliʻi Metrics. We are glad you found us.\n\n${c.notes?.includes("element") ? "Your interest in elemental panel testing speaks to the kind of detailed, place-based analysis we specialize in. We offer comprehensive multi-element testing with pH and ECe salinity analysis — all interpreted through a Hawaiʻi-specific lens.\n\n" : ""}Here is what the process looks like: we will send you a sample collection kit, you ship or drop off your samples, and we return results with interpretation grounded in local knowledge — typically within a few business days.\n\nI would love to schedule a brief conversation to confirm the right panel for your needs. Would you be available this week?\n\nA hui hou,${SIG}`,
  },
  "Government/Policy": {
    subject: (c) => `Following Up — Makaliʻi Metrics Soil Lab`,
    body: (c) => `Aloha ${c.firstName},\n\nMahalo for your continued interest in Makaliʻi Metrics and for the work you do in service of Hawaiʻi's agricultural communities.\n\nAs Hawaiʻi's only locally-staffed commercial soil testing lab, we provide interpretation that reflects the actual conditions, culture, and context of these islands — something mainland labs are not equipped to offer. We are actively supporting farmers in NRCS/EQIP programs, Carbon Smart and climate-smart grant recipients, and county and state initiatives working toward food security and ʻāina stewardship.\n\n${c.notes?.includes("site visit") ? "We look forward to the possibility of a site visit and will follow up to confirm timing.\n\n" : ""}I would welcome the chance to discuss how Makaliʻi Metrics can serve the communities in your care.\n\nMahalo piha,${SIG}`,
  },
  "Nonprofit/Community": {
    subject: (c) => `Aloha from Makaliʻi Metrics — Let's Connect`,
    body: (c) => `Aloha ${c.firstName},\n\nMahalo for reaching out — the work you are describing feels deeply connected to the values we carry at Makaliʻi Metrics. We believe the communities who steward the ʻāina should also have the data and tools to understand it.\n\n${c.notes?.includes("microbial") || c.message?.includes("microbial") ? "To answer directly: yes, we offer microbial activity and organic matter testing alongside our elemental panels.\n\n" : ""}${c.notes?.includes("restoration") ? "A restoration project like yours is exactly where longitudinal soil data becomes powerful — documenting recovery over time and grounding your work in evidence. We would love to support that.\n\n" : ""}Would you be open to a call or Zoom to explore how we might work together?\n\nMālama,${SIG}`,
  },
  "Research/Academic": {
    subject: (c) => `Re: Makaliʻi Metrics — Academic Services`,
    body: (c) => `Aloha ${c.firstName},\n\nMahalo for your interest in Makaliʻi Metrics. We welcome the opportunity to support research that contributes to a deeper understanding of Hawaiʻi's soils.\n\n${c.message?.includes("W-9") ? "I have attached our W-9 for your records to assist with vendor onboarding through your department.\n\n" : ""}Our protocols are aligned with the Hawaiʻi Soil Health Test established by the Crow Lab at CTAHR, and we provide data in formats compatible with standard research workflows. We offer standard and comprehensive soil health panels, carbon fractionation and organic matter analysis, Hawaiʻi-specific interpretation and reporting, and volume pricing for research programs.\n\nI would welcome a conversation about how we can best support your work.\n\nA hui hou,${SIG}`,
  },
  "Partnership": {
    subject: (c) => `Partnership Opportunity — Makaliʻi Metrics`,
    body: (c) => `Aloha ${c.firstName},\n\nMahalo for connecting — we are genuinely excited about the possibility of working together.\n\nMakaliʻi Metrics was built on the belief that ʻāina-based science belongs to the communities that practice it. We are actively building partnerships with organizations that share our commitment to food sovereignty, land stewardship, and data that serves people and place.\n\n${c.org?.includes("SBDC") ? "I would love to hear more about the client you mentioned. The best way to continue that conversation is directly at info@makaliimetrics.com.\n\n" : ""}${c.org?.includes("GoFarm") ? "A collaboration with GoFarm could be a meaningful way to integrate soil health literacy into farmer training across the state — something we are very open to exploring.\n\n" : ""}Could we find time for a call in the coming weeks?\n\nA hui hou,${SIG}`,
  },
  "Volunteer/Intern": {
    subject: (c) => `Mahalo for Your Interest — Makaliʻi Metrics`,
    body: (c) => `Aloha ${c.firstName},\n\nMahalo for your message and for your interest in what we are building at Makaliʻi Metrics.\n\nWe are a small and growing team, and the people who join us bring not just skill but genuine care for the mission. While we do not have a formal program posted at this time, we value staying connected with people whose values align with ours.\n\n${c.notes?.includes("software") ? "Your background in software is genuinely interesting to us — there is meaningful work at the intersection of soil data, technology, and ʻāina intelligence that we are continuing to develop.\n\n" : ""}Please keep an eye on makaliimetrics.com as we grow, and do not hesitate to reach out directly.\n\nMahalo piha,${SIG}`,
  },
  "Data/Tech": {
    subject: (c) => `Re: Data & Stewardship — Makaliʻi Metrics`,
    body: (c) => `Aloha ${c.firstName},\n\nMahalo for reaching out — the questions you are raising around data stewardship are ones we hold closely as well.\n\nAt Makaliʻi Metrics, we believe the communities stewarding the ʻāina should also steward the data generated from it. This is not just a principle — it shapes how we collect, store, and share soil monitoring data with our partners.\n\nI would welcome a call or Zoom to hear more about your project and discuss how our approach might align with what you are building. Would you be available in the next couple of weeks?\n\nA hui hou,${SIG}`,
  },
};
