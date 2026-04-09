// Mailchimp integration — all API calls route through the Supabase edge function.
// The REACT_APP_MAILCHIMP_* values in .env are for reference/documentation only
// and are NOT used client-side. Actual credentials are stored as Supabase secrets.

const BASE     = process.env.REACT_APP_SUPABASE_URL?.replace(/\/$/, "");
const EDGE_URL = `${BASE}/functions/v1/mailchimp`;
const ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

async function callMailchimp(action, payload) {
  const res = await fetch(EDGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ action, payload }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Mailchimp proxy error ${res.status}`);
  }
  return res.json();
}

/** Adds or updates a subscriber in the Mailchimp audience. Fire-and-forget safe. */
export async function upsertMailchimpContact(contact) {
  if (!contact.email) return;
  return callMailchimp("upsertContact", {
    email: contact.email,
    firstName: contact.firstName || "",
    lastName: contact.lastName || "",
    tags: contact.tags || [],
  });
}

/** Creates a Mailchimp campaign and sends it to one contact. Returns { campaignId }. */
export async function sendMailchimpEmail(contact, subject, body) {
  return callMailchimp("sendEmail", {
    email: contact.email,
    firstName: contact.firstName || "",
    lastName: contact.lastName || "",
    subject,
    body,
  });
}

/**
 * Creates ONE Mailchimp campaign targeting all selected contacts via a static segment,
 * then sends it. Uses *|FNAME|* merge tag for per-recipient first-name personalisation.
 * Returns { campaignId, campaignName, dashboardUrl }.
 */
export async function bulkSendMailchimp(contacts, subject, body, campaignTitle) {
  // Replace {firstName} placeholder with Mailchimp's merge tag so each recipient
  // gets their own first name inserted by Mailchimp at send time.
  const mergedBody = body.replace(/\{firstName\}/g, "*|FNAME|*");
  return callMailchimp("bulkSend", {
    contacts: contacts.map(c => ({
      email:     c.email,
      firstName: c.firstName || "",
      lastName:  c.lastName  || "",
    })),
    subject,
    body: mergedBody,
    campaignTitle,
  });
}

/** Returns { stats: { [campaignId]: { opened, clicked } } } for the given contact. */
export async function getContactEmailStats(contact, campaignIds) {
  if (!campaignIds?.length) return { stats: {} };
  return callMailchimp("getContactStats", {
    email: contact.email,
    campaignIds,
  });
}
