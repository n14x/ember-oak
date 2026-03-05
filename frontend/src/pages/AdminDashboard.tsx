import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getReservations, getStats, updateReservation, deleteReservation, adminLogout, type Reservation } from "../api/client";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#4ade80",
  cancelled: "#f87171",
  seated:    "#facc15",
};

const C = {
  bg:      "#0f0d0b",
  surface: "#171410",
  s2:      "#1e1a15",
  border:  "rgba(212,167,85,0.15)",
  ember:   "#c8702a",
  gold:    "#d4a755",
  cream:   "#f0e9dc",
  muted:   "rgba(232,223,208,0.5)",
  red:     "#f87171",
};

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0, total_guests: 0 });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, st] = await Promise.all([
        getReservations(filter === "all" ? undefined : filter),
        getStats(),
      ]);
      setReservations(res);
      setStats(st);
    } catch (e: any) {
      if (e.message?.includes("401") || e.message?.includes("Invalid")) { adminLogout(); onLogout(); }
    } finally {
      setLoading(false);
    }
  }, [filter, onLogout]);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id: number, status: string) => {
    await updateReservation(id, { status });
    showToast(`Reservation marked as ${status}`);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this reservation?")) return;
    await deleteReservation(id);
    showToast("Reservation deleted");
    setSelectedId(null);
    load();
  };

  const handleLogout = () => { adminLogout(); onLogout(); };

  const label = (text: string) => ({
    fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem",
    letterSpacing: "0.2em", textTransform: "uppercase" as const, color: C.ember,
  });

  const th = { fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase" as const, color: C.muted, padding: "0.8rem 1rem", textAlign: "left" as const, borderBottom: `1px solid ${C.border}` };
  const td = { fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: C.cream, padding: "0.85rem 1rem", borderBottom: `1px solid rgba(212,167,85,0.07)` };

  const selected = reservations.find(r => r.id === selectedId);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500;600&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } body { background: #0f0d0b; }`}</style>

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 999, background: C.ember, color: C.cream, fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", padding: "0.75rem 1.4rem", letterSpacing: "0.05em" }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ minHeight: "100vh", background: C.bg, display: "flex" }}>

        {/* SIDEBAR */}
        <div style={{ width: 240, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", padding: "2rem 1.5rem", flexShrink: 0 }}>
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: C.cream, letterSpacing: "0.1em" }}>EMBER <span style={{ color: C.gold }}>&</span> OAK</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted, marginTop: "0.3rem" }}>Admin Dashboard</div>
          </div>

          {/* Stat cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "2rem" }}>
            {[
              ["Total", stats.total, C.gold],
              ["Confirmed", stats.confirmed, "#4ade80"],
              ["Cancelled", stats.cancelled, C.red],
              ["Guests", stats.total_guests, C.ember],
            ].map(([label, val, color]) => (
              <div key={label as string} style={{ background: C.s2, border: `1px solid ${C.border}`, padding: "0.9rem 1rem" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: color as string, lineHeight: 1 }}>{val}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted, marginTop: "0.2rem" }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          <button onClick={handleLogout} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", padding: "0.6rem 1rem", cursor: "pointer", transition: "all 0.25s" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = C.red; (e.target as HTMLElement).style.borderColor = C.red; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = C.muted; (e.target as HTMLElement).style.borderColor = C.border; }}>
            Sign Out
          </button>
        </div>

        {/* MAIN */}
        <div style={{ flex: 1, padding: "2.5rem", overflow: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
            <div>
              <p style={label("Manage")}>Reservations</p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: C.cream, fontWeight: 400, marginTop: "0.25rem" }}>All Bookings</h1>
            </div>
            <button onClick={load} style={{ background: C.s2, border: `1px solid ${C.border}`, color: C.gold, fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", padding: "0.6rem 1.2rem", cursor: "pointer" }}>
              ↻ Refresh
            </button>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1.8rem" }}>
            {["all","confirmed","cancelled","seated"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.16em", textTransform: "uppercase", padding: "0.5rem 1.1rem", cursor: "pointer", border: `1px solid ${filter === f ? C.ember : C.border}`, background: filter === f ? C.ember : "transparent", color: filter === f ? C.cream : C.muted, transition: "all 0.2s" }}>
                {f}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: "3rem", textAlign: "center", color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>Loading…</div>
            ) : reservations.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>No reservations found.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["#","Name","Date","Time","Guests","Email","Status","Actions"].map(h => <th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(r => (
                    <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ cursor: "pointer", background: selectedId === r.id ? C.s2 : "transparent" }}
                      onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}>
                      <td style={{ ...td, color: C.muted, fontSize: "0.75rem" }}>#{r.id}</td>
                      <td style={{ ...td, fontWeight: 500 }}>{r.name}</td>
                      <td style={td}>{r.date}</td>
                      <td style={td}>{r.time}</td>
                      <td style={{ ...td, textAlign: "center" }}>{r.guests}</td>
                      <td style={{ ...td, color: C.muted, fontSize: "0.8rem" }}>{r.email}</td>
                      <td style={td}>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: STATUS_COLORS[r.status] || C.muted, border: `1px solid ${STATUS_COLORS[r.status] || C.muted}`, padding: "0.2rem 0.6rem" }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={td} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          {r.status !== "seated" && (
                            <button onClick={() => handleStatus(r.id, "seated")} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", background: "none", border: `1px solid ${C.gold}`, color: C.gold, padding: "0.2rem 0.5rem", cursor: "pointer" }}>Seat</button>
                          )}
                          {r.status !== "cancelled" && (
                            <button onClick={() => handleStatus(r.id, "cancelled")} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", background: "none", border: `1px solid ${C.red}`, color: C.red, padding: "0.2rem 0.5rem", cursor: "pointer" }}>Cancel</button>
                          )}
                          <button onClick={() => handleDelete(r.id)} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", background: "none", border: `1px solid rgba(248,113,113,0.3)`, color: "rgba(248,113,113,0.5)", padding: "0.2rem 0.5rem", cursor: "pointer" }}>✕</button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                style={{ marginTop: "1.6rem", background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.ember}`, padding: "1.8rem 2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={label("Detail")}>Reservation Detail</p>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: C.cream, fontWeight: 400, marginTop: "0.3rem" }}>{selected.name}</h2>
                  </div>
                  <button onClick={() => setSelectedId(null)} style={{ background: "none", border: "none", color: C.muted, fontSize: "1.4rem", cursor: "pointer" }}>×</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.2rem", marginTop: "1.4rem" }}>
                  {[["Email", selected.email], ["Phone", selected.phone || "—"], ["Date", selected.date], ["Time", selected.time], ["Guests", String(selected.guests)], ["Status", selected.status], ["Booked", new Date(selected.created_at).toLocaleDateString()]].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.ember }}>{k}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: C.cream, marginTop: "0.3rem" }}>{v}</div>
                    </div>
                  ))}
                </div>
                {selected.notes && (
                  <div style={{ marginTop: "1.2rem", padding: "1rem", background: C.s2, borderLeft: `2px solid ${C.gold}` }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, marginBottom: "0.4rem" }}>Notes</div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: C.muted, lineHeight: 1.6 }}>{selected.notes}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
