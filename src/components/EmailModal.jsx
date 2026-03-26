import { BRAND } from "../constants/brand";
import { inputStyle, btnPrimary, btnSecondary, label } from "../constants/styles";

export default function EmailModal({ emailContact, emailDraft, setEmailDraft, emailLoading, onClose, generateEmail }) {
  return (
    <div
      style={{position:"absolute", top:0, left:0, right:0, bottom:0, minHeight:"100%", background:"rgba(15,20,35,0.6)", display:"flex", alignItems:"flex-start", justifyContent:"center", zIndex:200, padding:"32px 16px"}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{width:560, maxWidth:"95%", background:BRAND.white, border:`1px solid ${BRAND.border}`, borderRadius:12, padding:"22px 24px", boxShadow:"0 12px 48px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16}}>
          <div>
            <div style={{fontWeight:500, fontSize:15, color:BRAND.navy}}>✉ Draft reply</div>
            <div style={{fontSize:12, color:BRAND.gray, marginTop:2}}>To: {emailContact?.firstName} {emailContact?.lastName} · {emailContact?.email}</div>
          </div>
          <button onClick={onClose} style={{...btnSecondary, padding:"3px 10px", fontSize:12}}>✕</button>
        </div>

        {emailLoading ? (
          <div style={{textAlign:"center", padding:"48px 0", color:BRAND.gray, fontSize:13}}>
            <div style={{width:32, height:32, borderRadius:"50%", border:`2px solid ${BRAND.navyLight}`, borderTopColor:BRAND.navy, animation:"spin 0.8s linear infinite", margin:"0 auto 12px"}}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div>Drafting personalized email…</div>
          </div>
        ) : (
          <>
            <div style={{marginBottom:12}}>
              <div style={label}>Subject</div>
              <input value={emailDraft.subject} onChange={e => setEmailDraft(d => ({...d, subject: e.target.value}))} style={inputStyle}/>
            </div>
            <div style={{marginBottom:16}}>
              <div style={label}>Body</div>
              <textarea value={emailDraft.body} onChange={e => setEmailDraft(d => ({...d, body: e.target.value}))} rows={14} style={{...inputStyle, resize:"vertical", lineHeight:1.65}}/>
            </div>
            <div style={{display:"flex", gap:8}}>
              <button
                style={{...btnPrimary, flex:1}}
                onClick={() => { navigator.clipboard?.writeText("Subject: " + emailDraft.subject + "\n\n" + emailDraft.body); alert("Copied!"); }}
              >
                Copy
              </button>
              <button
                style={{...btnPrimary, flex:1, background:BRAND.sand}}
                onClick={() => { window.open("mailto:" + emailContact?.email + "?subject=" + encodeURIComponent(emailDraft.subject) + "&body=" + encodeURIComponent(emailDraft.body)); }}
              >
                Open in Mail
              </button>
              <button style={btnSecondary} onClick={() => generateEmail(emailContact)}>↺ Regenerate</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
