// src/components/UI.jsx
import { useState, useEffect } from "react";
import { stars } from "../data/constants";

// ─── TOAST ──────────────────────────────────────────────────────
export function Toast({ toast }) {
  return (
    <div className={"toast" + (toast.show ? " show" : "") + (toast.err ? " err" : "")}>
      {toast.err ? "⚠️" : "✅"} {toast.msg}
    </div>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = { "Livre": "sbg-g", "En cours": "sbg-b", "En attente": "sbg-o", "Annule": "sbg-r" };
  return <span className={"sbg " + (map[status] || "sbg-p")}>● {status}</span>;
}

// ─── STAR PICKER ─────────────────────────────────────────────────
export function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-picker" style={{ padding:"6px 0" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className="star-item"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onTouchStart={(e) => { e.preventDefault(); setHover(i); }}
          onTouchEnd={(e)   => { e.preventDefault(); onChange(i); setHover(0); }}
          onClick={() => onChange(i)}
          style={{
            color: (hover || value) >= i ? "#D4AF37" : "#3D3D3D",
            fontSize: 32,
            cursor: "pointer",
            transition: ".15s",
            userSelect: "none",
            WebkitUserSelect: "none",
            display: "inline-block",
            padding: "0 3px",
          }}
        >★</span>
      ))}
      {value > 0 && (
        <div style={{ fontSize:11, color:"var(--or)", marginTop:6, fontFamily:"'Montserrat',sans-serif", letterSpacing:1 }}>
          {["","Tres mauvais","Mauvais","Moyen","Bien","Excellent !"][value]}
        </div>
      )}
    </div>
  );
}

// ─── LIGHTBOX ────────────────────────────────────────────────────
export function Lightbox({ photos, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx || 0);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx(i => (i + 1) % photos.length);
      if (e.key === "ArrowLeft")  setIdx(i => (i - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [photos.length, onClose]);

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lb-close" onClick={onClose}>✕</button>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <img
          src={photos[idx]}
          alt=""
          className="lightbox img"
          onClick={(e) => e.stopPropagation()}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        {photos.length > 1 && <>
          <button className="lb-nav" style={{ left: -44 }} onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + photos.length) % photos.length); }}>‹</button>
          <button className="lb-nav" style={{ right: -44 }} onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % photos.length); }}>›</button>
        </>}
      </div>
      <div className="lb-dots">
        {photos.map((_, i) => (
          <div
            key={i}
            className={"lb-dot" + (i === idx ? " active" : "")}
            onClick={(e) => { e.stopPropagation(); setIdx(i); }}
          />
        ))}
      </div>
      <div style={{ color: "rgba(255,255,255,.5)", fontSize: 11 }}>
        {idx + 1} / {photos.length} — Echap pour fermer
      </div>
    </div>
  );
}

// ─── GALLERY ─────────────────────────────────────────────────────
export function Gallery({ photos, fallback }) {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  useEffect(() => {
    if (photos.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % photos.length), 3500);
    return () => clearInterval(t);
  }, [photos.length]);

  const goTo = (i) => setIdx(i);

  if (photos.length === 0) {
    return (
      <div style={{ height: "clamp(180px,44vw,220px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(60px,14vw,80px)", background: "var(--cd)", borderRadius: 10, marginBottom: 8 }}>
        {fallback}
      </div>
    );
  }

  return (
    <>
      {lightbox && <Lightbox photos={photos} startIdx={idx} onClose={() => setLightbox(false)} />}
      <div className="gallery" onClick={() => setLightbox(true)}>
        <img src={photos[idx]} alt="" onError={(e) => { e.target.style.display = "none"; }} />
        <div className="gallery-hint">🔍 Agrandir</div>
        {photos.length > 1 && <>
          <button className="gallery-arrow" style={{ left: 8 }} onClick={(e) => { e.stopPropagation(); goTo((idx - 1 + photos.length) % photos.length); }}>‹</button>
          <button className="gallery-arrow" style={{ right: 8 }} onClick={(e) => { e.stopPropagation(); goTo((idx + 1) % photos.length); }}>›</button>
          <div className="gallery-dots">
            {photos.map((_, i) => (
              <div key={i} className={"gallery-dot" + (i === idx ? " active" : "")} onClick={(e) => { e.stopPropagation(); goTo(i); }} />
            ))}
          </div>
        </>}
      </div>
      {photos.length > 1 && (
        <div className="gallery-thumbs">
          {photos.map((ph, i) => (
            <div key={i} className={"gallery-thumb" + (i === idx ? " active" : "")} onClick={() => goTo(i)}>
              <img src={ph} alt="" onError={(e) => { e.target.style.display = "none"; }} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── NOTIF BELL ──────────────────────────────────────────────────
export function NotifBell({ unread, onClick }) {
  return (
    <button className="notif-bell" onClick={onClick}>
      🔔
      {unread > 0 && <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>}
    </button>
  );
}

// ─── NOTIF PANEL ─────────────────────────────────────────────────
export function NotifPanel({ notifs, onClose, onMarkRead, onClear }) {
  useEffect(() => { onMarkRead(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="notif-panel">
      <div className="notif-head">
        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--tx)" }}>🔔 Notifications</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClear} style={{ fontSize: 11, color: "var(--mt)", background: "none", border: "none", cursor: "pointer" }}>Effacer</button>
          <button onClick={onClose} style={{ background: "var(--cd)", border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer" }}>✕</button>
        </div>
      </div>
      <div className="notif-list">
        {notifs.length === 0
          ? <div style={{ textAlign: "center", padding: "28px 0", color: "var(--mt)", fontSize: 12 }}>Aucune notification</div>
          : notifs.map(n => (
            <div key={n.id} className="notif-item">
              <span style={{ fontSize: 18 }}>{n.type === "order" ? "🛒" : n.type === "review" ? "⭐" : "ℹ️"}</span>
              <div>
                <div style={{ fontSize: 11, color: "var(--tx)", lineHeight: 1.5 }}>{n.msg}</div>
                <div style={{ fontSize: 10, color: "var(--mt)", marginTop: 2 }}>{n.time}</div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ─── REVIEW CARD ──────────────────────────────────────────────────
export function ReviewCard({ r }) {
  return (
    <div className="review-card">
      <div className="review-top">
        <div className="review-av">{r.av || r.name?.[0] || "?"}</div>
        <div>
          <div className="review-name">{r.name}</div>
          <div className="review-date">{r.date}</div>
          {r.prodName && <div style={{ fontSize: 9, color: "var(--g)", marginTop: 1 }}>📦 {r.prodName}</div>}
        </div>
        <div style={{ marginLeft: "auto", color: "#F59E0B", fontSize: 13 }}>{stars(r.r)}</div>
      </div>
      <p className="review-txt">{r.txt}</p>
    </div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────
export function ProductCard({ p, onView, onAdd }) {
  const [added, setAdded] = useState(false);
  const cover = p.photos?.[0];
  // Calcul du % de remise si ancien prix
  const discount = p.old ? Math.round((1 - p.price / p.old) * 100) : null;

  const handleAdd = (e) => {
    e.stopPropagation();
    onAdd(p, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card" onClick={() => onView(p)}>
      <div className="product-img">
        {cover
          ? <img src={cover} alt={p.name} onError={(e) => { e.target.style.display = "none"; }} />
          : p.img
        }
        {/* Badges : promo + label */}
        <div className="product-badges">
          {discount && <span className="product-badge-discount">-{discount}%</span>}
          {p.badge  && <span className="product-badge">{p.badge}</span>}
        </div>
      </div>
      <div className="product-body">
        {/* Catégorie */}
        <div className="product-cat">{p.cat}</div>
        {/* Nom produit */}
        <div className="product-name">{p.name}</div>
        {/* Étoiles — masquées si 0 avis */}
        {p.rv > 0 && (
          <div className="product-stars">
            {stars(p.r)}
            <span style={{ color: "var(--gris-3)", fontSize: 9, marginLeft: 4 }}>({p.rv})</span>
          </div>
        )}
        {/* Prix — devise alignée, pas de barré */}
        <div className="product-price-row">
          <span className="product-price-num">
            {new Intl.NumberFormat("fr-CI").format(p.price)}
          </span>
          <span className="product-price-cur">FCFA</span>
        </div>
        {/* Boutons */}
        <div className="product-foot">
          <button className={"btn-add" + (added ? " added" : "")} onClick={handleAdd}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink:0 }}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM16 10a4 4 0 01-8 0"/>
              <path d="M3 6h18"/>
            </svg>
            {added ? "Ajouté !" : "Ajouter"}
          </button>
          <button className="btn-eye" onClick={(e) => { e.stopPropagation(); onView(p); }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
