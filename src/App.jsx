import { useState, useMemo, useRef, useEffect } from "react";
import { useContacts } from "./hooks/useContacts";
import { upsertMailchimpContact, sendMailchimpEmail, getContactEmailStats } from "./lib/mailchimp";
import { BRAND, STAGES } from "./constants/brand";
import { EMAIL_TEMPLATES } from "./constants/templates";
import LogoMark from "./components/LogoMark";
import ContactList from "./components/ContactList";
import PipelineView from "./components/PipelineView";
import AnalyticsView from "./components/AnalyticsView";
import DetailPanel from "./components/DetailPanel";
import EmailModal from "./components/EmailModal";
import AddModal from "./components/AddModal";
import ImportModal from "./components/ImportModal";
import BulkEmailModal from "./components/BulkEmailModal";
import IntakeForm from "./components/IntakeForm";
import IntakeQueue from "./components/IntakeQueue";
import CampaignTracker from "./components/CampaignTracker";
import FollowUpQueue from "./components/FollowUpQueue";
import { getFollowUpQueue, daysSince } from "./utils/followups";

export default function CRM() {
  const {
    contacts, loading,
    addContact: dbAdd,
    updateContact: dbUpdate,
    deleteContact: dbDelete,
    importContacts: dbImport,
  } = useContacts();
  const [view, setView]               = useState("contacts");
  const [search, setSearch]           = useState("");
  const [filterSeg, setFilterSeg]     = useState("All");
  const [filterTier, setFilterTier]   = useState("All");
  const [filterStage, setFilterStage] = useState("All");
  const [selected, setSelected]       = useState(null);
  const [showAdd, setShowAdd]         = useState(false);
  const [showImport, setShowImport]   = useState(false);
  const [showEmail, setShowEmail]     = useState(false);
  const [showBulkEmail, setShowBulkEmail] = useState(false);
  const [checkedIds, setCheckedIds]   = useState(new Set());
  const [emailContact, setEmailContact] = useState(null);
  const [emailDraft, setEmailDraft]   = useState({ subject:"", body:"" });
  const [emailLoading, setEmailLoading] = useState(false);
  const [followUpEntry, setFollowUpEntry] = useState(null);
  const [emailSubView, setEmailSubView] = useState("campaigns");

  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const handler = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const pendingCount  = useMemo(() => contacts.filter(c => c.pending).length, [contacts]);
  const followUpCount = useMemo(() => getFollowUpQueue(contacts.filter(c => !c.pending)).length, [contacts]);

  // On load, refresh Mailchimp open/click stats for contacts with recent unopened emails
  const statsRefreshedRef = useRef(false);
  useEffect(() => {
    if (loading || contacts.length === 0 || statsRefreshedRef.current) return;
    statsRefreshedRef.current = true;
    const cutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;
    const toRefresh = contacts.filter(c =>
      !c.pending &&
      (c.emailHistory || []).some(e => !e.opened && e.campaignId && new Date(e.sentAt) > cutoff)
    );
    if (!toRefresh.length) return;
    (async () => {
      for (let i = 0; i < toRefresh.length; i += 5) {
        await Promise.all(toRefresh.slice(i, i + 5).map(async contact => {
          const history = contact.emailHistory || [];
          const ids = history.filter(e => !e.opened && e.campaignId).map(e => e.campaignId);
          if (!ids.length) return;
          try {
            const { stats } = await getContactEmailStats(contact, ids);
            if (!stats) return;
            const updated = history.map(r => ({ ...r, ...(stats[r.campaignId] || {}) }));
            const changed = updated.some((r, i) => r.opened !== history[i].opened || r.clicked !== history[i].clicked);
            if (changed) await dbUpdate(contact.id, { emailHistory: updated });
          } catch (_) {}
        }));
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, contacts.length]);

  // Persists last-selected contact so content stays visible during slide-out animation
  const lastSelectedRef = useRef(null);
  if (selected) lastSelectedRef.current = selected;
  const panelContact = selected || lastSelectedRef.current;

  const filtered = useMemo(() => contacts.filter(c => {
    if (c.pending) return false;
    const q = search.toLowerCase();
    const name = (c.firstName + " " + c.lastName).toLowerCase();
    const matchQ = !q || name.includes(q) || c.org.toLowerCase().includes(q) || c.segment.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    return matchQ && (filterSeg === "All" || c.segment === filterSeg) && (filterTier === "All" || c.tier === filterTier) && (filterStage === "All" || c.stage === filterStage);
  }), [contacts, search, filterSeg, filterTier, filterStage]);

  const pipelineByStage = useMemo(() => {
    const m = {};
    STAGES.forEach(s => m[s] = []);
    contacts.filter(c => !c.pending).forEach(c => { if (m[c.stage]) m[c.stage].push(c); });
    return m;
  }, [contacts]);

  async function updateContact(id, updates) {
    await dbUpdate(id, updates);
    if (selected?.id === id) setSelected(s => ({...s, ...updates}));
    // Sync name/email changes to Mailchimp in background
    const syncFields = ["email", "firstName", "lastName"];
    if (syncFields.some(f => f in updates)) {
      const contact = contacts.find(c => c.id === id);
      if (contact?.email) upsertMailchimpContact({...contact, ...updates}).catch(console.error);
    }
  }

  async function addContact(contact) {
    await dbAdd(contact);
    setShowAdd(false);
    // Sync new contact to Mailchimp audience in background
    if (contact.email) upsertMailchimpContact(contact).catch(console.error);
  }

  async function importContacts(newContacts) {
    await dbImport(newContacts);
  }

  async function deleteContact(id) {
    await dbDelete(id);
    setSelected(null);
  }

  function toggleCheck(id) {
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll(checked) {
    if (checked) {
      setCheckedIds(prev => new Set([...prev, ...filtered.map(c => c.id)]));
    } else {
      setCheckedIds(new Set());
    }
  }

  async function bulkEdit(field, value) {
    if (!value) return;
    await Promise.all([...checkedIds].map(id => updateContact(id, { [field]: value })));
  }

  function toggleJourneyType(jt) {
    const ofType = contacts.filter(c => c.journeyType === jt);
    if (!ofType.length) return;
    const allChecked = ofType.every(c => checkedIds.has(c.id));
    if (allChecked) {
      setCheckedIds(prev => { const n = new Set(prev); ofType.forEach(c => n.delete(c.id)); return n; });
    } else {
      setCheckedIds(prev => new Set([...prev, ...ofType.map(c => c.id)]));
    }
  }

  async function handleSendViaMailchimp(subject, body) {
    try {
      const { campaignId } = await sendMailchimpEmail(emailContact, subject, body);
      const sentAt = new Date().toISOString();
      const record = { campaignId, subject, sentAt, opened: false, clicked: false, journeyType: emailContact.journeyType || null };
      let history = [...(emailContact.emailHistory || []), record];
      // If this was a follow-up send, stamp the original entry so it leaves the queue
      if (followUpEntry) {
        history = history.map(e =>
          e.campaignId === followUpEntry.campaignId ? { ...e, followUpSentAt: sentAt } : e
        );
        setFollowUpEntry(null);
      }
      await updateContact(emailContact.id, { emailHistory: history });
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  }

  async function generateEmail(c) {
    setEmailContact(c);
    setEmailLoading(true);
    setShowEmail(true);
    const tmpl = EMAIL_TEMPLATES[c.segment] || EMAIL_TEMPLATES["Soil Testing Inquiry"];
    const subject = tmpl.subject(c);
    const baseBody = tmpl.body(c);
    setEmailDraft({ subject, body: baseBody });
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are writing on behalf of Daniel Richardson at Makaliʻi Metrics, Hawaiʻi's first locally-staffed commercial soil testing lab.\n\nWrite a warm, professional reply email to ${c.firstName} ${c.lastName} from ${c.org}.\n\nTheir original message: "${c.message}"\n\nNotes: ${c.notes}\n\nStart from this draft and improve it — make it feel personal, grounded in aloha ʻāina values, and directly address their inquiry. Keep it under 200 words. No markdown formatting. Sign off as Daniel Richardson, Makaliʻi Metrics.\n\nBase draft:\n${baseBody}\n\nReturn only the improved email body, no subject line.`,
          }],
        }),
      });
      const data = await res.json();
      const aiBody = data.content?.find(b => b.type === "text")?.text || baseBody;
      setEmailDraft({ subject, body: aiBody });
    } catch (e) {}
    setEmailLoading(false);
  }

  async function deleteCampaign(campaign) {
    await Promise.all(campaign.recipients.map(({ contact, entry }) => {
      const history = (contact.emailHistory || []).filter(e =>
        campaign.isBulk ? e.bulkId !== campaign.key : e.campaignId !== campaign.key
      );
      return updateContact(contact.id, { emailHistory: history });
    }));
  }

  async function generateFollowUpEmail(contact, originalEntry) {
    setFollowUpEntry(originalEntry);
    setEmailContact(contact);
    setEmailLoading(true);
    setShowEmail(true);
    const subject = `Following up: ${originalEntry.subject}`;
    setEmailDraft({ subject, body: "" });
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
          messages: [{
            role: "user",
            content: `You are writing on behalf of Daniel Richardson at Makaliʻi Metrics, Hawaiʻi's first locally-staffed commercial soil testing lab.\n\nWrite a brief, warm follow-up email to ${contact.firstName} ${contact.lastName} from ${contact.org}. We sent them an email ${daysSince(originalEntry.sentAt)} days ago with subject "${originalEntry.subject}" and haven't heard back.\n\nThis follow-up should:\n- Be concise (under 100 words)\n- Not feel pushy — just a gentle check-in\n- Invite them to respond or ask if they have any questions\n- Feel grounded in aloha ʻāina values\n- Sign off as Daniel Richardson, Makaliʻi Metrics\n\nReturn only the email body, no subject line.`,
          }],
        }),
      });
      const data = await res.json();
      const aiBody = data.content?.find(b => b.type === "text")?.text || "";
      setEmailDraft({ subject, body: aiBody });
    } catch (_) {}
    setEmailLoading(false);
  }

  if (hash === "#intake") return <IntakeForm />;

  return (
    <div style={{fontFamily:"system-ui,sans-serif", height:"100vh", overflow:"hidden", background:BRAND.grayLight, display:"flex", flexDirection:"column"}}>
      <style>{`
        .crm-card { transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.12s ease; cursor: pointer; }
        .crm-card:hover { border-color: ${BRAND.navyMid} !important; box-shadow: 0 2px 12px rgba(27,42,74,0.09); transform: translateY(-1px); }
        .crm-card.active { border-color: ${BRAND.navy} !important; border-width: 1.5px !important; box-shadow: 0 2px 12px rgba(27,42,74,0.12); }
        .crm-nav-btn { transition: background 0.15s ease, color 0.15s ease; }
        .crm-nav-btn:hover { background: rgba(255,255,255,0.1) !important; }
        .crm-icon-btn { transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease; }
        .crm-icon-btn:hover { background: ${BRAND.sandLight} !important; border-color: ${BRAND.sand} !important; }
::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${BRAND.border}; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: ${BRAND.sand}; }
      `}</style>

      {/* Header */}
      <div style={{background:BRAND.navy, padding:"0 20px", display:"flex", alignItems:"center", gap:16, height:52, flexShrink:0, zIndex:10}}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{width:32, height:32, borderRadius:6, background:BRAND.navyMid, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
            <LogoMark size={22}/>
          </div>
          <div>
            <span style={{fontWeight:500, fontSize:14, color:BRAND.white, letterSpacing:"0.01em"}}>makaliʻi</span>
            <span style={{fontSize:11, color:BRAND.sand, marginLeft:5, letterSpacing:"0.05em", textTransform:"lowercase"}}>metrics · crm</span>
          </div>
        </div>
        <nav style={{display:"flex", gap:2, marginLeft:12}}>
          {["contacts","pipeline","analytics"].map(v => (
            <button key={v} className="crm-nav-btn" style={{padding:"6px 14px", borderRadius:6, border:"none", background:view===v?"rgba(255,255,255,0.12)":"transparent", color:view===v?BRAND.white:BRAND.sand, cursor:"pointer", fontSize:13, fontWeight:view===v?500:400, letterSpacing:"0.01em"}} onClick={() => setView(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
          <button
            className="crm-nav-btn"
            style={{padding:"6px 14px", borderRadius:6, border:"none", background:view==="emails"?"rgba(255,255,255,0.12)":"transparent", color:view==="emails"?BRAND.white:BRAND.sand, cursor:"pointer", fontSize:13, fontWeight:view==="emails"?500:400, letterSpacing:"0.01em", display:"flex", alignItems:"center", gap:6}}
            onClick={() => setView("emails")}
          >
            Emails
            {followUpCount > 0 && (
              <span style={{background:BRAND.amber, color:BRAND.white, borderRadius:99, fontSize:10, fontWeight:700, padding:"1px 6px", lineHeight:"16px"}}>
                {followUpCount}
              </span>
            )}
          </button>
          <button
            className="crm-nav-btn"
            style={{padding:"6px 14px", borderRadius:6, border:"none", background:view==="intake"?"rgba(255,255,255,0.12)":"transparent", color:view==="intake"?BRAND.white:BRAND.sand, cursor:"pointer", fontSize:13, fontWeight:view==="intake"?500:400, letterSpacing:"0.01em", display:"flex", alignItems:"center", gap:6}}
            onClick={() => setView("intake")}
          >
            Intake
            {pendingCount > 0 && (
              <span style={{background:BRAND.amber, color:BRAND.white, borderRadius:99, fontSize:10, fontWeight:700, padding:"1px 6px", lineHeight:"16px"}}>
                {pendingCount}
              </span>
            )}
          </button>
        </nav>
        <div style={{marginLeft:"auto", fontSize:12, color:BRAND.sand}}>
          {loading ? "Loading…" : `${contacts.filter(c => !c.pending).length} contacts · ${contacts.filter(c => c.tier === "Hot" && !c.pending).length} hot leads`}
        </div>
      </div>

      {/* Main content */}
      <div style={{flex:1, padding:16, overflow:"hidden", position:"relative"}}>
        {view === "contacts" && (
          <ContactList
            filtered={filtered}
            selected={selected}
            setSelected={setSelected}
            search={search}
            setSearch={setSearch}
            filterTier={filterTier}
            setFilterTier={setFilterTier}
            filterSeg={filterSeg}
            setFilterSeg={setFilterSeg}
            filterStage={filterStage}
            setFilterStage={setFilterStage}
            onOpenAdd={() => setShowAdd(true)}
            onOpenImport={() => setShowImport(true)}
            generateEmail={generateEmail}
            checkedIds={checkedIds}
            onToggleCheck={toggleCheck}
            onSelectAll={selectAll}
            onToggleJourneyType={toggleJourneyType}
            onBulkEdit={bulkEdit}
            contacts={contacts}
            onOpenBulkEmail={() => setShowBulkEmail(true)}
          />
        )}
        {view === "pipeline" && (
          <PipelineView
            pipelineByStage={pipelineByStage}
            onSelectContact={setSelected}
          />
        )}
        {view === "analytics" && (
          <AnalyticsView
            contacts={contacts}
            onSelectContact={setSelected}
            generateEmail={generateEmail}
          />
        )}
        {view === "emails" && (
          <div style={{height:"100%", display:"flex", flexDirection:"column", gap:0}}>
            {/* Sub-tab toggle */}
            <div style={{display:"flex", gap:6, marginBottom:14, flexShrink:0}}>
              {[["campaigns","Sent Campaigns"],["followups","Follow-up Queue"]].map(([key, lbl]) => (
                <button
                  key={key}
                  onClick={() => setEmailSubView(key)}
                  style={{
                    padding:"6px 16px", borderRadius:99, border:"1px solid",
                    fontSize:12, cursor:"pointer", fontWeight: emailSubView===key ? 500 : 400,
                    borderColor: emailSubView===key ? BRAND.navy : BRAND.border,
                    background:  emailSubView===key ? BRAND.navy : BRAND.white,
                    color:       emailSubView===key ? BRAND.white : BRAND.gray,
                    display:"flex", alignItems:"center", gap:6,
                  }}
                >
                  {lbl}
                  {key === "followups" && followUpCount > 0 && (
                    <span style={{background:BRAND.amber, color:BRAND.white, borderRadius:99, fontSize:10, fontWeight:700, padding:"1px 6px", lineHeight:"16px"}}>
                      {followUpCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div style={{flex:1, overflowY:"auto"}}>
              {emailSubView === "campaigns" && (
                <CampaignTracker
                  contacts={contacts}
                  onSelectContact={setSelected}
                  onDeleteCampaign={deleteCampaign}
                />
              )}
              {emailSubView === "followups" && (
                <FollowUpQueue
                  contacts={contacts}
                  updateContact={updateContact}
                  onGenerateFollowUp={generateFollowUpEmail}
                />
              )}
            </div>
          </div>
        )}
        {view === "intake" && (
          <div style={{height:"100%", overflowY:"auto"}}>
            <IntakeQueue
              onApprove={approvedContact => {
                setView("contacts");
                setSelected(approvedContact);
              }}
            />
          </div>
        )}

        {/* Modals */}
        {showEmail && (
          <EmailModal
            emailContact={emailContact}
            emailDraft={emailDraft}
            setEmailDraft={setEmailDraft}
            emailLoading={emailLoading}
            onClose={() => setShowEmail(false)}
            generateEmail={generateEmail}
            onSendViaMailchimp={handleSendViaMailchimp}
            onUpdateContact={updates => emailContact && updateContact(emailContact.id, updates)}
          />
        )}
        {showBulkEmail && (
          <BulkEmailModal
            selectedContacts={contacts.filter(c => checkedIds.has(c.id))}
            updateContact={updateContact}
            onClose={() => setShowBulkEmail(false)}
            onDone={() => setCheckedIds(new Set())}
          />
        )}
        {showAdd && (
          <AddModal
            onSave={addContact}
            onClose={() => setShowAdd(false)}
          />
        )}
        {showImport && (
          <ImportModal
            existingContacts={contacts}
            onImport={importContacts}
            onClose={() => setShowImport(false)}
          />
        )}
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setSelected(null)}
        style={{
          position:"fixed", top:52, left:0, right:0, bottom:0,
          background:"rgba(15,20,35,0.22)",
          opacity: selected ? 1 : 0,
          pointerEvents: selected ? "auto" : "none",
          transition:"opacity 0.25s ease",
          zIndex:8,
        }}
      />

      {/* Slide-in detail panel — starts at top:0 so it sits flush behind the nav, spacer pushes content down */}
      <div style={{
        position:"fixed", top:0, right:0, bottom:0,
        width:"max(500px, 38vw)",
        background:BRAND.white,
        borderLeft:`1px solid ${BRAND.border}`,
        boxShadow:"-8px 0 32px rgba(0,0,0,0.1)",
        transform: selected ? "translateX(0)" : "translateX(105%)",
        transition:"transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex:9,
        display:"flex", flexDirection:"column",
      }}>
        <div style={{height:52, flexShrink:0}} />
        <div style={{flex:1, overflowY:"auto"}}>
          {panelContact && (
            <DetailPanel
              c={panelContact}
              onClose={() => setSelected(null)}
              updateContact={updateContact}
              generateEmail={generateEmail}
              deleteContact={deleteContact}
            />
          )}
        </div>
      </div>
    </div>
  );
}
