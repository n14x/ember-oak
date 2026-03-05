import { useState, useRef } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { createReservation, type ReservationPayload } from "../api/client";

/* ─── TOKENS ─────────────────────────────────────────────────────── */
const tokens: React.CSSProperties = {
  "--color-bg":          "#0f0d0b",
  "--color-surface":     "#171410",
  "--color-surface-2":   "#1e1a15",
  "--color-border":      "rgba(212,167,85,0.15)",
  "--color-ember":       "#c8702a",
  "--color-gold":        "#d4a755",
  "--color-cream":       "#f0e9dc",
  "--color-cream-muted": "rgba(240,233,220,0.55)",
  "--color-text-muted":  "rgba(232,223,208,0.5)",
} as React.CSSProperties;

/* ─── DATA ───────────────────────────────────────────────────────── */
const DISHES = [
  { name: "Oak-Smoked Ribeye", desc: "42-day dry-aged, oak ember finish, truffle jus, charred bone marrow butter", price: "$68", tag: "Signature", img: "https://images.unsplash.com/photo-1558030006-450675393462?w=700&auto=format&fit=crop&q=80" },
  { name: "Ember-Seared Scallops", desc: "Diver scallops, cauliflower velouté, crispy capers, saffron beurre blanc", price: "$44", tag: "Chef's Pick", img: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=700&auto=format&fit=crop&q=80" },
  { name: "Heritage Pork Chop", desc: "Berkshire double-cut, applewood smoke, apple-fennel slaw, Calvados reduction", price: "$52", tag: null, img: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=700&auto=format&fit=crop&q=80" },
  { name: "Wood-Fired Salmon", desc: "Wild King salmon, cedar plank, lemon-dill crème fraîche, pickled cucumber", price: "$46", tag: null, img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=700&auto=format&fit=crop&q=80" },
  { name: "Black Truffle Risotto", desc: "Arborio, Périgord truffle, aged Parmigiano, chive oil, crispy shallots", price: "$38", tag: "Vegetarian", img: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=700&auto=format&fit=crop&q=80" },
  { name: "Burnt Honey Panna Cotta", desc: "Lavender honey, candied walnut praline, macerated strawberries, gold leaf", price: "$18", tag: "Dessert", img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=700&auto=format&fit=crop&q=80" },
];

const REVIEWS = [
  { name: "Alexandra Voss", role: "Food Critic, The Culinary Review", avatar: "https://i.pravatar.cc/96?img=47", stars: 5, quote: "Ember & Oak is the rare restaurant that earns every superlative thrown at it. The ribeye is the finest piece of beef I've encountered this decade." },
  { name: "James & Nora Whitfield", role: "Regulars since opening night", avatar: "https://i.pravatar.cc/96?img=33", stars: 5, quote: "We've celebrated every anniversary here for four years running. The staff remembers your name, and the tasting menu is a genuine journey from first course to last." },
  { name: "Chef Marcus Reeve", role: "Michelin-starred, Atelier NYC", avatar: "https://i.pravatar.cc/96?img=68", stars: 5, quote: "Ember & Oak made me feel something at the table I hadn't felt in years — genuine surprise. Whoever is tending that hearth understands fire the way a sculptor understands clay." },
];

/* ─── HELPERS ────────────────────────────────────────────────────── */
function RevealBlock({ children, delay = 0, style = {} }: any) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }} style={style}>
      {children}
    </motion.div>
  );
}

function Stars({ count }: { count: number }) {
  return <span style={{ color: "var(--color-gold)", letterSpacing: "0.1em" }}>{"★".repeat(count)}</span>;
}

/* ─── BOOKING MODAL ──────────────────────────────────────────────── */
function BookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", time: "7:00 PM", guests: 2, notes: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const times = ["5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM","9:30 PM","10:00 PM"];

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.date) { setError("Please fill in name, email, and date."); return; }
    setLoading(true); setError("");
    try {
      await createReservation(form as ReservationPayload);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { onClose(); setTimeout(() => { setSuccess(false); setError(""); setForm({ name:"",email:"",phone:"",date:"",time:"7:00 PM",guests:2,notes:"" }); }, 400); };

  const inputStyle: React.CSSProperties = { width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-cream)", padding: "0.75rem 1rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" as const };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <motion.div initial={{ scale: 0.88, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} onClick={e => e.stopPropagation()}
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "2.8rem", maxWidth: 500, width: "100%", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={handleClose} style={{ position: "absolute", top: "1rem", right: "1.4rem", background: "none", border: "none", color: "var(--color-text-muted)", fontSize: "1.4rem", cursor: "pointer" }}>×</button>

            {success ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔥</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "var(--color-cream)" }}>You're confirmed!</h3>
                <p style={{ color: "var(--color-text-muted)", marginTop: "0.8rem", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
                  A confirmation email is on its way to <strong style={{ color: "var(--color-gold)" }}>{form.email}</strong>.<br />We look forward to welcoming you.
                </p>
                <motion.button onClick={handleClose} whileHover={{ background: "var(--color-gold)", color: "var(--color-bg)" }}
                  style={{ marginTop: "2rem", background: "var(--color-ember)", color: "var(--color-cream)", border: "none", padding: "0.9rem 2.5rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", transition: "all 0.25s" }}>
                  Close
                </motion.button>
              </motion.div>
            ) : (
              <>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--color-ember)", marginBottom: "0.6rem" }}>Reservations</p>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "var(--color-cream)" }}>Book a Table</h3>

                <div style={{ marginTop: "1.8rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[["Full Name *", "text", "name"], ["Email *", "email", "email"], ["Phone", "tel", "phone"]].map(([label, type, key]) => (
                    <div key={key}>
                      <label style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>{label}</label>
                      <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inputStyle} />
                    </div>
                  ))}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>Date *</label>
                      <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>Time</label>
                      <select value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={{ ...inputStyle, appearance: "none" as const }}>
                        {times.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>Guests</label>
                    <select value={form.guests} onChange={e => setForm(f => ({ ...f, guests: Number(e.target.value) }))} style={{ ...inputStyle, appearance: "none" as const }}>
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>Special Requests</label>
                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" as const }} placeholder="Allergies, celebrations, accessibility needs..." />
                  </div>
                </div>

                {error && <p style={{ color: "#e07070", fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", marginTop: "0.8rem" }}>{error}</p>}

                <motion.button onClick={handleSubmit} disabled={loading}
                  whileHover={!loading ? { boxShadow: "0 0 32px rgba(212,167,85,0.45)", background: "var(--color-gold)", color: "var(--color-bg)" } : {}}
                  style={{ width: "100%", marginTop: "1.6rem", background: loading ? "#555" : "var(--color-ember)", color: "var(--color-cream)", border: "none", padding: "1rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.25s" }}>
                  {loading ? "Confirming…" : "Confirm Reservation"}
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── LANDING PAGE ───────────────────────────────────────────────── */
export default function LandingPage({ onAdmin }: { onAdmin: () => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [navScrolled, setNavScrolled] = useState(false);
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => setNavScrolled(window.scrollY > 64), { passive: true });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0f0d0b; }
        ::-webkit-scrollbar-thumb { background: rgba(212,167,85,0.3); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.4); }
        option { background: #1e1a15; }
      `}</style>

      <div style={{ ...tokens, minHeight: "100vh", background: "var(--color-bg)" } as React.CSSProperties}>

        {/* NAV */}
        <motion.nav initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
          style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 3rem", background: navScrolled ? "rgba(15,13,11,0.92)" : "transparent", backdropFilter: navScrolled ? "blur(16px)" : "none", borderBottom: navScrolled ? "1px solid var(--color-border)" : "1px solid transparent", transition: "all 0.4s ease" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.45rem", letterSpacing: "0.12em", color: "var(--color-cream)" }}>
            EMBER <span style={{ color: "var(--color-gold)" }}>&</span> OAK
          </div>
          <div style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
            {[["Story","#story"],["Menu","#menu"],["Reviews","#reviews"]].map(([l,h]) => (
              <a key={l} href={h} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-cream-muted)", textDecoration: "none" }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--color-gold)"}
                onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--color-cream-muted)"}>{l}</a>
            ))}
            <motion.button onClick={() => setModalOpen(true)} whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(212,167,85,0.45)" }} whileTap={{ scale: 0.97 }}
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, background: "transparent", color: "var(--color-gold)", border: "1px solid var(--color-gold)", padding: "0.6rem 1.5rem", cursor: "pointer" }}>
              Reserve
            </motion.button>
          </div>
        </motion.nav>

        {/* HERO */}
        <section ref={heroRef} style={{ position: "relative", height: "100vh", minHeight: 680, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", overflow: "hidden" }}>
          <motion.div style={{ position: "absolute", inset: 0, y: heroY, background: "linear-gradient(to bottom, rgba(15,13,11,0.3) 0%, rgba(15,13,11,0.78) 100%), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1800&auto=format&fit=crop&q=85') center/cover no-repeat" }} />
          <motion.div style={{ position: "relative", opacity: heroOpacity }}>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.2 }}
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--color-gold)", marginBottom: "1.6rem" }}>
              Modern American Grill · Est. 2019
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4, ease: [0.16,1,0.3,1] }}
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3.8rem, 10vw, 8.5rem)", fontWeight: 400, lineHeight: 0.92, color: "var(--color-cream)" }}>
              Ember<br /><em style={{ color: "var(--color-gold)" }}>& Oak</em>
            </motion.h1>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.85 }}
              style={{ width: 64, height: 1, background: "var(--color-gold)", margin: "2rem auto", transformOrigin: "center" }} />
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1 }}
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(1rem, 2.5vw, 1.45rem)", fontWeight: 300, color: "var(--color-cream-muted)" }}>
              Where fire meets flavor
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1.2 }} style={{ marginTop: "2.8rem" }}>
              <motion.button onClick={() => setModalOpen(true)}
                whileHover={{ scale: 1.05, boxShadow: "0 0 48px rgba(212,167,85,0.55), 0 0 96px rgba(200,112,42,0.25)", background: "var(--color-gold)" }}
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, background: "var(--color-ember)", color: "var(--color-cream)", border: "none", padding: "1.1rem 3rem", cursor: "pointer", boxShadow: "0 4px 32px rgba(200,112,42,0.4)", transition: "color 0.25s" }}>
                Book a Table
              </motion.button>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
            style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Scroll</span>
            <motion.div animate={{ y: [0,8,0] }} transition={{ repeat: Infinity, duration: 1.8 }} style={{ width: 1, height: 40, background: "linear-gradient(to bottom, var(--color-gold), transparent)" }} />
          </motion.div>
        </section>

        {/* STORY */}
        <section id="story" style={{ background: "var(--color-surface)", padding: "7rem 3rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
            <RevealBlock>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--color-ember)", marginBottom: "1rem" }}>Our Philosophy</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.2rem, 4vw, 3.4rem)", fontWeight: 400, lineHeight: 1.1, color: "var(--color-cream)" }}>
                Fire is not a technique.<br /><em style={{ color: "var(--color-gold)" }}>It is a conviction.</em>
              </h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1rem", lineHeight: 1.85, color: "var(--color-text-muted)", marginTop: "1.8rem", fontWeight: 300 }}>
                Every evening at Ember & Oak begins the same way — with the striking of a match. We source heritage hardwoods, whole animals from farms within 80 miles, and vegetables grown in partnership with Hudson Valley growers.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.8rem", marginTop: "3rem" }}>
                {[["80mi","Sourcing radius"],["★ 4.9","Guest rating"],["2019","Year founded"],["6","Wood varieties"]].map(([v,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.4rem", fontWeight: 400, color: "var(--color-gold)" }}>{v}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>{l}</div>
                  </div>
                ))}
              </div>
            </RevealBlock>
            <RevealBlock delay={0.15}>
              <div style={{ position: "relative" }}>
                <div style={{ height: 520, background: "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop&q=80') center/cover" }} />
                <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem", right: "-1.5rem", bottom: "-1.5rem", border: "1px solid var(--color-border)", pointerEvents: "none" }} />
              </div>
            </RevealBlock>
          </div>
        </section>

        {/* MENU */}
        <section id="menu" style={{ background: "var(--color-bg)", padding: "7rem 3rem" }}>
          <RevealBlock style={{ textAlign: "center", marginBottom: "4.5rem" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--color-ember)", marginBottom: "1rem" }}>Seasonal Menu</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 400, lineHeight: 1.1, color: "var(--color-cream)" }}>
              Dishes forged <em style={{ color: "var(--color-gold)" }}>by flame</em>
            </h2>
          </RevealBlock>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.6rem", maxWidth: 1100, margin: "0 auto" }}>
            {DISHES.map((dish, i) => (
              <RevealBlock key={dish.name} delay={i * 0.07}>
                <motion.div whileHover={{ y: -10, scale: 1.02, boxShadow: "0 24px 64px rgba(212,167,85,0.18), 0 4px 16px rgba(0,0,0,0.4)" }} transition={{ duration: 0.35, ease: [0.16,1,0.3,1] }}
                  style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", overflow: "hidden", position: "relative", cursor: "pointer" }}>
                  <div style={{ height: 220, overflow: "hidden", position: "relative" }}>
                    <motion.img src={dish.img} alt={dish.name} whileHover={{ scale: 1.08 }} transition={{ duration: 0.55 }}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  {dish.tag && <div style={{ position: "absolute", top: "1rem", left: "1rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, background: "var(--color-ember)", color: "var(--color-cream)", padding: "0.28rem 0.7rem" }}>{dish.tag}</div>}
                  <div style={{ padding: "1.4rem 1.6rem 1.8rem" }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 400, color: "var(--color-cream)" }}>{dish.name}</h3>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.65, marginTop: "0.55rem", fontWeight: 300 }}>{dish.desc}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.2rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.45rem", color: "var(--color-gold)" }}>{dish.price}</span>
                    </div>
                  </div>
                </motion.div>
              </RevealBlock>
            ))}
          </div>
        </section>

        {/* REVIEWS */}
        <section id="reviews" style={{ background: "var(--color-surface)", padding: "7rem 3rem" }}>
          <RevealBlock style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--color-ember)", marginBottom: "1rem" }}>Guest Voices</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 400, color: "var(--color-cream)" }}>
              What our guests <em style={{ color: "var(--color-gold)" }}>say</em>
            </h2>
          </RevealBlock>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.6rem", maxWidth: 1100, margin: "0 auto" }}>
            {REVIEWS.map((r, i) => (
              <RevealBlock key={r.name} delay={i * 0.12}>
                <motion.div whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(0,0,0,0.35)" }} style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderBottom: "3px solid var(--color-ember)", padding: "2.4rem" }}>
                  <Stars count={r.stars} />
                  <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.05rem", fontWeight: 300, lineHeight: 1.75, color: "var(--color-cream)", marginTop: "1.2rem" }}>"{r.quote}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1.8rem", paddingTop: "1.4rem", borderTop: "1px solid var(--color-border)" }}>
                    <img src={r.avatar} alt={r.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.88rem", color: "var(--color-cream)" }}>{r.name}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>{r.role}</div>
                    </div>
                  </div>
                </motion.div>
              </RevealBlock>
            ))}
          </div>
        </section>

        {/* BOOK CTA */}
        <section style={{ background: "var(--color-bg)", padding: "9rem 3rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "'Playfair Display', serif", fontSize: "clamp(5rem, 18vw, 16rem)", fontWeight: 400, color: "rgba(255,255,255,0.02)", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none" }}>
            EMBER & OAK
          </div>
          <RevealBlock>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--color-ember)", marginBottom: "1rem" }}>Reservations</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.6rem, 6vw, 4.5rem)", fontWeight: 400, lineHeight: 1.08, color: "var(--color-cream)" }}>
              An evening worth<br /><em style={{ color: "var(--color-gold)" }}>remembering</em>
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", color: "var(--color-text-muted)", marginTop: "1.5rem", fontWeight: 300 }}>
              Dinner service Wed – Sun · 5:30 PM – 11:00 PM<br />Private dining available for parties of 8+
            </p>
            <motion.button onClick={() => setModalOpen(true)}
              whileHover={{ scale: 1.05, boxShadow: "0 0 56px rgba(212,167,85,0.55)", background: "var(--color-gold)", color: "var(--color-bg)" }}
              style={{ display: "inline-block", marginTop: "3rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, background: "var(--color-ember)", color: "var(--color-cream)", border: "none", padding: "1.2rem 3.5rem", cursor: "pointer", boxShadow: "0 6px 40px rgba(200,112,42,0.4)", transition: "all 0.3s" }}>
              Book a Table
            </motion.button>
          </RevealBlock>
        </section>

        {/* FOOTER */}
        <footer style={{ background: "#080605", borderTop: "1px solid var(--color-border)", padding: "3.5rem 3rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "3rem" }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "var(--color-cream)", letterSpacing: "0.12em" }}>EMBER <span style={{ color: "var(--color-gold)" }}>&</span> OAK</div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "var(--color-text-muted)", lineHeight: 1.8, marginTop: "0.8rem", fontWeight: 300 }}>Modern American grill. Live fire. Seasonal ingredients.</p>
              <button onClick={onAdmin} style={{ marginTop: "1.2rem", background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-muted)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", padding: "0.4rem 0.9rem", cursor: "pointer" }}>
                Staff Login
              </button>
            </div>
            <div>
              <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-ember)", marginBottom: "1rem" }}>Visit</h4>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.9, fontWeight: 300 }}>142 Hearthside Lane<br />West Village<br />New York, NY 10014</p>
            </div>
            <div>
              <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-ember)", marginBottom: "1rem" }}>Hours</h4>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.9, fontWeight: 300 }}>Mon–Tue: Closed<br />Wed–Thu: 5:30–10 PM<br />Fri–Sat: 5:30–11 PM<br />Sun: 5:00–9:30 PM</p>
            </div>
            <div>
              <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-ember)", marginBottom: "1rem" }}>Contact</h4>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.9, fontWeight: 300 }}>(212) 555-0182<br />hello@emberandoak.com</p>
            </div>
          </div>
          <div style={{ maxWidth: 1100, margin: "2.5rem auto 0", paddingTop: "1.8rem", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "rgba(232,223,208,0.2)" }}>© 2026 Ember & Oak. All rights reserved.</p>
          </div>
        </footer>

        <BookingModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </>
  );
}
