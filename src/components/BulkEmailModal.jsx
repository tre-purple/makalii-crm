import { useState, useEffect } from "react";
import { BRAND } from "../constants/brand";
import { inputStyle, btnPrimary, btnSecondary, label } from "../constants/styles";
import { bulkSendMailchimp } from "../lib/mailchimp";
import { JOURNEY_TEMPLATES } from "../constants/templates";

const JOURNEY_TYPES = ["Intro", "Follow-Up", "Updates", "Returning"];

const JOURNEY_DESC = {
  Intro:       "First-touch outreach — introduce Makaliʻi Metrics and offer a clear next step",
  "Follow-Up": "Nurture outreach — they know us, keep the conversation going",
  Updates:     "Share news, services, or program updates with engaged contacts",
  Returning:   "Re-engagement — past relationship or prior work together",
};

export default function BulkEmailModal({ selectedContacts, updateContact, onClose, onDone }) {
  const [journeyType, setJourneyType] = useState("Intro");
  const [draft, setDraft]             = useState(JOURNEY_TEMPLATES["Intro"]);
  const [generating, setGenerating]   = useState(false);
  const [stage, setStage]             = useState("compose"); // compose | sending | done
  const [sendState, setSendState]     = useState({ step: "", result: null, error: null });

  useEffect(() => { loadTemplate(journeyType); }, [journeyType]);

  async function loadTemplate(jt) {
    setDraft(JOURNEY_TEMPLATES[jt]);
    setGenerating(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [{
            role: "user",
            content: `You are writing a bulk outreach email for Daniel Richardson at Makaliʻi Metrics, Hawaiʻi's first locally-staffed commercial soil testing lab.\n\nJourney type: ${jt}\nContext: ${JOURNEY_DESC[jt]}\n\nWrite a short, warm email (under 120 words). Use {firstName} as the greeting placeholder — e.g. "Aloha {firstName},". Sign off as Daniel Richardson, Makaliʻi Metrics, (808) 392-3975 | makaliimetrics.com. No markdown. Plain text only. Do not include the subject line.`,
          }],
        }),
      });
      const data = await res.json();
      const aiBody = data.content?.find(b => b.type === "text")?.text;
      if (aiBody) setDraft(d => ({ ...d, body: aiBody }));
    } catch (e) {}
    setGenerating(false);
  }

  async function handleSend() {
    setStage("sending");
    const now         = new Date();
    const monthYear   = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const campaignTitle = `${journeyType} Outreach — ${monthYear}`;
    const bulkId      = `bulk-${journeyType}-${Date.now()}`;
    const bulkLabel   = campaignTitle;

    setSendState({ step: "Creating campaign…", result: null, error: null });

    try {
      const result = await bulkSendMailchimp(
        selectedContacts,
        draft.subject,
        draft.body,
        campaignTitle,
      );

      setSendState({ step: "Logging to contacts…", result, error: null });

      // Store the single campaignId against every selected contact
      await Promise.all(selectedContacts.map(contact =>
        updateContact(contact.id, {
          emailHistory: [
            ...(contact.emailHistory || []),
            {
              campaignId:  result.campaignId,
              subject:     draft.subject,
              sentAt:      now.toISOString(),
              opened:      false,
              clicked:     false,
              bulkId,
              bulkLabel,
              journeyType,
            },
          ],
        })
      ));

      setSendState({ step: "done", result, error: null });
    } catch (err) {
      setSendState({ step: "error", result: null, error: err.message });
    }

    setStage("done");
  }

  const total = selectedContacts.length;

  return (
    <div
      style={{position:"absolute", top:0, left:0, right:0, bottom:0, minHeight:"100%", background:"rgba(15,20,35,0.6)", display:"flex", alignItems:"flex-start", justifyContent:"center", zIndex:200, padding:"32px 16px"}}
      onClick={e => { if (e.target === e.currentTarget && stage !== "sending") onClose(); }}
    >
      <div style={{width:600, maxWidth:"95%", background:BRAND.white, border:`1px solid ${BRAND.border}`, borderRadius:12, padding:"22px 24px", boxShadow:"0 12px 48px rgba(0,0,0,0.2)"}}>

        {/* Header */}
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16}}>
          <div>
            <div style={{fontWeight:500, fontSize:15, color:BRAND.navy}}>Bulk Email — {total} contact{total !== 1 ? "s" : ""}</div>
            <div style={{fontSize:12, color:BRAND.gray, marginTop:2}}>
              One campaign, personalised per recipient via Mailchimp merge tags
            </div>
          </div>
          {stage !== "sending" && (
            <button onClick={onClose} style={{...btnSecondary, padding:"3px 10px", fontSize:12}}>✕</button>
          )}
        </div>

        {/* ── Compose ─────────────────────────────────────────────────────────── */}
        {stage === "compose" && (
          <>
            <div style={{marginBottom:14}}>
              <div style={label}>Journey Type</div>
              <div style={{display:"flex", gap:6, marginTop:4, flexWrap:"wrap"}}>
                {JOURNEY_TYPES.map(jt => (
                  <button
                    key={jt}
                    onClick={() => setJourneyType(jt)}
                    style={{
                      padding:"6px 14px", borderRadius:99, border:"1px solid", fontSize:12, cursor:"pointer",
                      fontWeight: journeyType === jt ? 500 : 400,
                      borderColor: journeyType === jt ? BRAND.navy : BRAND.border,
                      background:  journeyType === jt ? BRAND.navyLight : BRAND.white,
                      color:       journeyType === jt ? BRAND.navy : BRAND.gray,
                    }}
                  >
                    {jt}
                  </button>
                ))}
              </div>
              <div style={{fontSize:11, color:BRAND.gray, marginTop:5}}>{JOURNEY_DESC[journeyType]}</div>
            </div>

            {generating ? (
              <div style={{textAlign:"center", padding:"36px 0", color:BRAND.gray, fontSize:13}}>
                <div style={{width:28, height:28, borderRadius:"50%", border:`2px solid ${BRAND.navyLight}`, borderTopColor:BRAND.navy, animation:"spin 0.8s linear infinite", margin:"0 auto 10px"}}/>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                Generating email…
              </div>
            ) : (
              <>
                <div style={{marginBottom:10}}>
                  <div style={label}>Subject</div>
                  <input value={draft.subject} onChange={e => setDraft(d => ({...d, subject: e.target.value}))} style={inputStyle}/>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={label}>Body — use {"{firstName}"} for the first name</div>
                  <textarea value={draft.body} onChange={e => setDraft(d => ({...d, body: e.target.value}))} rows={11} style={{...inputStyle, resize:"vertical", lineHeight:1.65}}/>
                </div>
                <div style={{marginBottom:14, padding:"10px 12px", background:BRAND.sandLight, borderRadius:8, fontSize:12, color:BRAND.gray, border:`1px solid ${BRAND.sandMid}`}}>
                  <strong style={{color:BRAND.navy}}>1 campaign</strong> — "{draft.subject}" sent to{" "}
                  <strong style={{color:BRAND.navy}}>{total} contact{total !== 1 ? "s" : ""}</strong> via a single Mailchimp campaign.
                  Mailchimp personalises each recipient's first name automatically.
                </div>
                <div style={{display:"flex", gap:8}}>
                  <button style={{...btnSecondary, fontSize:12}} onClick={() => loadTemplate(journeyType)}>↺ Regenerate</button>
                  <button
                    style={{...btnPrimary, flex:1}}
                    onClick={handleSend}
                    disabled={!draft.subject.trim() || !draft.body.trim()}
                  >
                    Send campaign to {total} contact{total !== 1 ? "s" : ""} via Mailchimp
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ── Sending ─────────────────────────────────────────────────────────── */}
        {stage === "sending" && (
          <div style={{textAlign:"center", padding:"48px 0"}}>
            <div style={{width:44, height:44, borderRadius:"50%", border:`3px solid ${BRAND.navyLight}`, borderTopColor:BRAND.navy, animation:"spin 0.8s linear infinite", margin:"0 auto 20px"}}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{fontSize:16, fontWeight:500, color:BRAND.navy, marginBottom:8}}>
              {sendState.step}
            </div>
            <div style={{fontSize:13, color:BRAND.gray}}>
              Sending to {total} contact{total !== 1 ? "s" : ""}…
            </div>
          </div>
        )}

        {/* ── Done ────────────────────────────────────────────────────────────── */}
        {stage === "done" && (
          <div style={{textAlign:"center", padding:"24px 0"}}>
            {sendState.error ? (
              <>
                <div style={{fontSize:32, marginBottom:12}}>⚠</div>
                <div style={{fontSize:16, fontWeight:500, color:BRAND.red, marginBottom:8}}>Send failed</div>
                <div style={{background:BRAND.redLight, borderRadius:8, padding:"10px 12px", fontSize:12, color:BRAND.red, marginBottom:20, textAlign:"left"}}>
                  {sendState.error}
                </div>
                <button style={{...btnSecondary}} onClick={() => { setStage("compose"); setSendState({ step:"", result:null, error:null }); }}>
                  ← Back to compose
                </button>
              </>
            ) : (
              <>
                <div style={{fontSize:32, marginBottom:12, color:BRAND.green}}>✓</div>
                <div style={{fontSize:18, fontWeight:500, color:BRAND.navy, marginBottom:4}}>
                  Campaign sent to {total} contact{total !== 1 ? "s" : ""}
                </div>
                <div style={{fontSize:13, color:BRAND.gray, marginBottom:16}}>
                  {sendState.result?.campaignName}
                </div>
                <div style={{display:"flex", gap:8, justifyContent:"center"}}>
                  {sendState.result?.dashboardUrl && (
                    <a
                      href={sendState.result.dashboardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{...btnSecondary, fontSize:13, textDecoration:"none", color:BRAND.navy}}
                    >
                      View in Mailchimp ↗
                    </a>
                  )}
                  <button style={{...btnPrimary}} onClick={() => { onDone(); onClose(); }}>
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
