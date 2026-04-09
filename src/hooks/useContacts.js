import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { initContacts } from "../constants/data";

export function useContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data, error } = await supabase.from("contacts").select("*").order("id");
      if (cancelled) return;

      if (error) {
        console.error("[useContacts] fetch failed:", error.message);
        setLoading(false);
        return;
      }

      if (data.length === 0) {
        console.log("[useContacts] empty table — seeding", initContacts.length, "contacts…");
        const rows = initContacts.map(({ id: _id, ...rest }) => rest);
        const { error: seedErr } = await supabase.from("contacts").insert(rows);
        if (seedErr) {
          console.error("[useContacts] seed failed:", seedErr.message);
          setLoading(false);
          return;
        }
        const { data: seeded, error: refetchErr } = await supabase.from("contacts").select("*").order("id");
        if (refetchErr) console.error("[useContacts] refetch after seed:", refetchErr.message);
        if (!cancelled) setContacts(seeded ?? initContacts);
      } else {
        setContacts(data);
      }
      setLoading(false);
    }

    init();

    const channel = supabase
      .channel("contacts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contacts" },
        ({ new: row }) => { if (!cancelled) setContacts(cs => [...cs, row]); })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "contacts" },
        ({ new: row }) => { if (!cancelled) setContacts(cs => cs.map(c => c.id === row.id ? row : c)); })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "contacts" },
        ({ old: row }) => { if (!cancelled) setContacts(cs => cs.filter(c => c.id !== row.id)); })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  async function addContact(contact) {
    const { id: _id, ...row } = contact;
    const { error } = await supabase.from("contacts").insert(row);
    if (error) console.error("addContact:", error.message);
  }

  async function updateContact(id, updates) {
    setContacts(cs => cs.map(c => c.id === id ? { ...c, ...updates } : c));
    const { error } = await supabase.from("contacts").update(updates).eq("id", id);
    if (error) console.error("updateContact:", error.message);
  }

  async function deleteContact(id) {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) console.error("deleteContact:", error.message);
  }

  async function importContacts(newContacts) {
    const rows = newContacts.map(({ id: _id, ...rest }) => rest);
    const { error } = await supabase.from("contacts").insert(rows);
    if (error) console.error("importContacts:", error.message);
  }

  return { contacts, loading, addContact, updateContact, deleteContact, importContacts };
}
