import { useState, useMemo, useRef } from "react";
import { useContacts } from "./hooks/useContacts";
import { upsertMailchimpContact, sendMailchimpEmail } from "./lib/mailchimp";
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

  // Persists last-selected contact so content stays visible during slide-out animation
  const lastSelectedRef = useRef(null);
  if (selected) lastSelectedRef.current = selected;
  const panelContact = selected || lastSelectedRef.current;

  const filtered = useMemo(() => contacts.filter(c => {
    const q = search.toLowerCase();
    const name = (c.firstName + " " + c.lastName).toLowerCase();
    const matchQ = !q || name.includes(q) || c.org.toLowerCase().includes(q) || c.segment.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    return matchQ && (filterSeg === "All" || c.segment === filterSeg) && (filterTier === "All" || c.tier === filterTier) && (filterStage === "All" || c.stage === filterStage);
  }), [contacts, search, filterSeg, filterTier, filterStage]);

  const pipelineByStage = useMemo(() => {
    const m = {};
    STAGES.forEach(s => m[s] = []);
    contacts.forEach(c => { if (m[c.stage]) m[c.stage].push(c); });
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
      const record = { campaignId, subject, sentAt: new Date().toISOString(), opened: false, clicked: false, journeyType: emailContact.journeyType || null };
      const history = [...(emailContact.emailHistory || []), record];
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
        </nav>
        <div style={{marginLeft:"auto", fontSize:12, color:BRAND.sand}}>
          {loading ? "Loading…" : `${contacts.length} contacts · ${contacts.filter(c => c.tier === "Hot").length} hot leads`}
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
          zIndex:40,
        }}
      />

      {/* Slide-in detail panel */}
      <div style={{
        position:"fixed", top:52, right:0, bottom:0,
        width:"max(320px, 25vw)",
        background:BRAND.white,
        borderLeft:`1px solid ${BRAND.border}`,
        boxShadow:"-8px 0 32px rgba(0,0,0,0.1)",
        transform: selected ? "translateX(0)" : "translateX(105%)",
        transition:"transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex:41,
        overflowY:"auto",
      }}>
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
  );
}
