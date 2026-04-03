// src/features/client/ClientStore.jsx
import { useState, useEffect } from "react";
import { LOGO, BOUTIQUE, CATS, CAT_ICONS, fmt, nid, today } from "../../data/constants";
import { useCart } from "../../hooks/useCart";
import { useToast } from "../../hooks/useToast";
import { Toast, Gallery, StarPicker, ReviewCard, ProductCard } from "../../components/UI";

// ─── NAVBAR ──────────────────────────────────────────────────────
function Navbar({ page, setPage, cartCount, onCartOpen, onAdmin, logo }) {
  const [clicks, setClicks] = useState(0);
  const logoClick = () => {
    const n = clicks + 1;
    setClicks(n);
    if (n >= 5) { onAdmin(); setClicks(0); }
    setTimeout(() => setClicks(0), 2000);
  };

  return (
    <nav className="nb">
      <div className="brand" onClick={logoClick} title="5x clic pour admin">
        <div className="brand-logo">
          <img src={logo || LOGO} alt="Baark Wende Store" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div>
          <div className="brand-name">Baark Wende Store</div>
          <div className="brand-sub">Qualite & Confiance</div>
        </div>
      </div>
      <div className="nav-links">
        {[["home","🏠 Accueil"],["shop","🛍️ Boutique"],["apropos","ℹ️ A propos"],["contact","📞 Contact"]].map(([id,lbl]) => (
          <button key={id} className={"nav-link" + (page === id ? " active" : "")} onClick={() => setPage(id)}>{lbl}</button>
        ))}
      </div>
      <div className="nav-right">
        <button className="nb-btn" onClick={onCartOpen} style={{ position: "relative" }}>
          🛒 Panier
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </div>
    </nav>
  );
}

// ─── CART PANEL ──────────────────────────────────────────────────
function CartPanel({ open, onClose, cart, setOrders, showT, fb }) {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [lieu, setLieu] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) { setStep(0); setDone(false); setPhone(""); setLieu(""); }
  }, [open]);

  const total = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
  const waMsg = encodeURIComponent(
    "Bonjour Baark Wende Store\n" +
    cart.items.map(i => "- " + i.name + " x" + i.qty + " : " + fmt(i.price * i.qty)).join("\n") +
    "\nTotal : " + fmt(total)
  );

  const submit = () => {
    if (!phone.trim() || !lieu.trim()) { showT("Remplissez tous les champs !", true); return; }
    const order = {
      id: nid(), client: "Client", phone,
      product: cart.items.map(i => i.name).join(", "),
      amount: total, status: "En attente", date: today(), lieu,
    };
    setOrders(prev => [order, ...prev]);
    if (fb && fb.addOrder) fb.addOrder(order).catch(() => {});
    cart.clear();
    setDone(true);
  };

  return (
    <>
      <div className={"cart-bd" + (open ? " open" : "")} onClick={onClose} />
      <div className={"cart-panel" + (open ? " open" : "")}>
        <div className="cart-head">
          <div>
            <div className="cart-t">🛒 Mon Panier</div>
            <div style={{ fontSize: 10, color: "var(--mt)" }}>{cart.count} article(s)</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {step === 0 && !done && (
          <>
            <div className="cart-list">
              {cart.items.length === 0 ? (
                <div className="cart-empty">
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🛒</div>
                  <div>Votre panier est vide</div>
                </div>
              ) : cart.items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-img">
                    {item.photos?.[0] ? <img src={item.photos[0]} alt="" onError={(e) => { e.target.style.display = "none"; }} /> : item.img}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="cart-name">{item.name}</div>
                    <div className="cart-price">{fmt(item.price)}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <button className="qty-btn" onClick={() => cart.updateQty(item.id, -1)}>−</button>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{item.qty}</span>
                      <button className="qty-btn" onClick={() => cart.updateQty(item.id, 1)}>+</button>
                      <span style={{ fontSize: 11, color: "var(--mt)" }}>{fmt(item.price * item.qty)}</span>
                    </div>
                  </div>
                  <button style={{ background: "none", border: "none", color: "var(--mt)", fontSize: 16, cursor: "pointer" }} onClick={() => cart.remove(item.id)}>🗑</button>
                </div>
              ))}
            </div>
            {cart.items.length > 0 && (
              <div className="cart-foot">
                <div className="cart-total-row">
                  <span style={{ fontSize: 12, color: "var(--mt)" }}>Total</span>
                  <span className="cart-total-val">{fmt(total)}</span>
                </div>
                <button className="btn-p" style={{ width: "100%", padding: 12, marginBottom: 8, fontSize: 13 }} onClick={() => setStep(1)}>
                  📋 Valider — Remplir formulaire
                </button>
                <button className="btn-s" style={{ width: "100%", padding: 10, fontSize: 13 }} onClick={() => window.open("https://wa.me/" + BOUTIQUE.wa + "?text=" + waMsg, "_blank")}>
                  💬 Commander via WhatsApp
                </button>
              </div>
            )}
          </>
        )}

        {step === 1 && !done && (
          <div style={{ padding: 18, flex: 1, overflowY: "auto" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, marginBottom: 14, color: "var(--tx)" }}>📋 Infos de livraison</div>
            <div style={{ background: "var(--cd)", borderRadius: 9, padding: 12, marginBottom: 14, border: "1px solid var(--br)" }}>
              {cart.items.map(i => (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--mt)", marginBottom: 3 }}>
                  <span>{i.name} <strong style={{ color: "var(--g)" }}>x{i.qty}</strong></span>
                  <span>{fmt(i.price * i.qty)}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--br)", fontWeight: 700, color: "var(--g)", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
                <span>Total</span><span>{fmt(total)}</span>
              </div>
            </div>
            <div className="fg"><label className="fl">Telephone *</label><input className="fi" placeholder="07 XX XX XX XX" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div className="fg"><label className="fl">Lieu de livraison *</label><input className="fi" placeholder="Quartier, commune" value={lieu} onChange={e => setLieu(e.target.value)} /></div>
            <div className="f-hint">Nous vous contacterons pour confirmer la livraison.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-s" style={{ flex: 1, padding: 10 }} onClick={() => setStep(0)}>← Retour</button>
              <button className="btn-p" style={{ flex: 2, padding: 11 }} onClick={submit}>✅ Confirmer</button>
            </div>
          </div>
        )}

        {done && (
          <div className="success-box" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div className="success-emoji">🎉</div>
            <div className="success-title">Commande envoyee !</div>
            <p className="success-text">
              Baark Wende Store vous contactera au <strong style={{ color: "var(--tx)" }}>{phone}</strong> pour livraison a <strong style={{ color: "var(--tx)" }}>{lieu}</strong>.
            </p>
            <button className="btn-p" style={{ padding: "10px 24px" }} onClick={onClose}>Fermer</button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── PRODUCT MODAL ────────────────────────────────────────────────
function ProdModal({ prod, onClose, onAddCart, reviews, setReviews, showT, fb }) {
  const [tab, setTab] = useState("detail");
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const [rvName, setRvName] = useState("");
  const [rvStars, setRvStars] = useState(0);
  const [rvTxt, setRvTxt] = useState("");
  const [rvSent, setRvSent] = useState(false);

  useEffect(() => {
    setTab("detail"); setQty(1); setDone(false);
    setRvSent(false); setRvName(""); setRvStars(0); setRvTxt("");
  }, [prod?.id]);

  if (!prod) return null;

  const photos = (prod.photos || []).filter(Boolean);
  const prodReviews = (reviews || []).filter(r => r.approved);

  const handleAdd = () => {
    onAddCart(prod, qty);
    setDone(true);
    setTimeout(() => { onClose(); setDone(false); }, 1400);
  };

  const submitReview = () => {
    if (!rvName.trim()) { showT("Entrez votre nom", true); return; }
    if (rvStars === 0)  { showT("Donnez une note (etoiles)", true); return; }
    if (rvTxt.length < 10) { showT("Commentaire trop court (min. 10 car.)", true); return; }
    const newRev = {
      id: "rv_" + Date.now(), prodId: prod.id, prodName: prod.name,
      name: rvName.trim(), av: rvName.trim()[0].toUpperCase(),
      r: rvStars, date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      txt: rvTxt.trim(), approved: false,
    };
    setReviews(prev => [...prev, newRev]);
    // Sauvegarder dans Firebase si disponible
    if (fb && fb.addReview) fb.addReview(newRev).catch(() => {});
    setRvSent(true);
    showT("Avis envoye ! En attente de validation");
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">{tab === "avis-form" ? "Laisser un avis" : "Detail produit"}</span>
          <button className="modal-close" onClick={tab === "avis-form" ? () => setTab("avis") : onClose}>
            {tab === "avis-form" ? "← Retour" : "✕ Fermer"}
          </button>
        </div>

        {tab !== "avis-form" && (
          <div className="modal-tabs">
            {[["detail","📦 Produit"],["avis","⭐ Avis (" + prodReviews.length + ")"]].map(([id, lbl]) => (
              <button key={id} className={"modal-tab" + (tab === id ? " active" : "")} onClick={() => setTab(id)}>{lbl}</button>
            ))}
          </div>
        )}

        <div className="modal-body">
          {/* DETAIL */}
          {tab === "detail" && (
            <>
              <Gallery photos={photos} fallback={prod.img} />
              <div style={{ fontSize: 9, color: "var(--g)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>{prod.cat}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 6, color: "var(--tx)" }}>{prod.name}</div>
              {(() => {
                const approvedRevs = (reviews||[]).filter(r => r.approved && r.prodId === prod.id);
                const allApproved  = approvedRevs.length > 0 ? approvedRevs : (reviews||[]).filter(r => r.approved);
                const avgR = allApproved.length > 0
                  ? allApproved.reduce((s,r)=>s+r.r,0) / allApproved.length
                  : prod.r;
                const totalR = allApproved.length || prod.rv || 0;
                return totalR > 0 ? (
                  <div style={{ color:"#D4AF37", fontSize:15, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                    {[1,2,3,4,5].map(i=>(
                      <span key={i} style={{ color: i <= Math.round(avgR) ? "#D4AF37" : "var(--gris-2)" }}>★</span>
                    ))}
                    <span style={{ color:"var(--gris-3)", fontSize:11, fontFamily:"'Montserrat',sans-serif" }}>({totalR} avis)</span>
                  </div>
                ) : (
                  <div style={{ fontSize:11, color:"var(--gris-3)", marginBottom:8, fontFamily:"'Montserrat',sans-serif", letterSpacing:".5px" }}>
                    Aucun avis pour le moment
                  </div>
                );
              })()}
              <p style={{ fontSize: 12, color: "var(--mt)", lineHeight: 1.8, marginBottom: 12 }}>{prod.desc}</p>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--g)", marginBottom: 4 }}>{fmt(prod.price)}</div>
              {prod.old && <div style={{ fontSize: 11, color: "var(--mt)", textDecoration: "line-through", marginBottom: 8 }}>{fmt(prod.old)}</div>}
              <div style={{ fontSize: 11, color: "var(--mt)", marginBottom: 14 }}>Stock : <strong style={{ color: "var(--gn)" }}>{prod.stock} unites</strong></div>

              <div className="qty-box">
                <span style={{ fontSize: 12, color: "var(--mt)", fontWeight: 600 }}>Quantite :</span>
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="qty-val">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => Math.min(prod.stock, q + 1))}>+</button>
                <span style={{ marginLeft: "auto", fontWeight: 700, color: "var(--g)", fontSize: 13 }}>{fmt(prod.price * qty)}</span>
              </div>

              {!done
                ? <button className="btn-p" style={{ width: "100%", padding: 13, fontSize: 14 }} onClick={handleAdd}>🛒 Ajouter au panier</button>
                : <div style={{ textAlign: "center", padding: 13, background: "#F0FDF4", borderRadius: 10, color: "#16A34A", fontWeight: 700 }}>✅ Ajoute au panier !</div>
              }
            </>
          )}

          {/* AVIS LIST */}
          {tab === "avis" && (
            <>
              <button className="btn-p" style={{ width: "100%", padding: 11, marginBottom: 14, fontSize: 13 }} onClick={() => setTab("avis-form")}>
                ✍️ Laisser un avis
              </button>
              {prodReviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "28px 0", color: "var(--mt)" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                  <div style={{ fontSize: 13 }}>Aucun avis pour le moment.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {prodReviews.map((r, i) => <ReviewCard key={r.id || i} r={r} />)}
                </div>
              )}
            </>
          )}

          {/* AVIS FORM */}
          {tab === "avis-form" && (
            <>
              {rvSent ? (
                <div className="success-box">
                  <div className="success-emoji">🎉</div>
                  <div className="success-title">Avis envoye !</div>
                  <p className="success-text">Votre avis est en attente de validation par la boutique. Merci !</p>
                  <button className="btn-p" style={{ padding: "10px 24px" }} onClick={() => setTab("avis")}>← Voir les avis</button>
                </div>
              ) : (
                <>
                  <div style={{ background: "var(--cd)", borderRadius: 10, padding: "12px 14px", marginBottom: 14, border: "1px solid var(--br)" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--g)", marginBottom: 2 }}>📦 {prod.name}</div>
                    <div style={{ fontSize: 11, color: "var(--mt)" }}>Votre avis sera verifie avant publication</div>
                  </div>
                  <div className="fg"><label className="fl">Votre nom *</label><input className="fi" placeholder="Ex: Konan Aya" value={rvName} onChange={e => setRvName(e.target.value)} /></div>
                  <div className="fg">
                    <label className="fl">Note *</label>
                    <StarPicker value={rvStars} onChange={setRvStars} />
                    {rvStars > 0 && <div style={{ fontSize: 11, color: "var(--mt)", marginTop: 4 }}>{["","Tres mauvais","Mauvais","Moyen","Bien","Excellent !"][rvStars]}</div>}
                  </div>
                  <div className="fg">
                    <label className="fl">Commentaire * (min. 10 car.)</label>
                    <textarea className="fi" rows={4} placeholder="Partagez votre experience..." value={rvTxt} onChange={e => setRvTxt(e.target.value)} />
                  </div>
                  <div className="f-hint">Contact : {BOUTIQUE.email}</div>
                  <button className="btn-p" style={{ width: "100%", padding: 12 }} onClick={submitReview}>✅ Envoyer mon avis</button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HOME VIEW ────────────────────────────────────────────────────
function HomeView({ products, setPage, onView, onAdd, reviews }) {
  const pop = products.filter(p => p.badge).slice(0, 4);
  const approved = (reviews || []).filter(r => r.approved);

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-tag">✨ Boutique Premium — Cote d'Ivoire</div>
          <h1>Baark Wende Store</h1>
          <div className="hero-slogan">Qualite et confiance a prix accessible</div>
          <p>Montres de luxe, telephones, voitures, vetements et plus. Livraison rapide en Cote d'Ivoire.</p>
          <div className="hero-cta">
            <button className="btn-p" onClick={() => setPage("shop")}>Explorer la boutique →</button>
          </div>
        </div>
      </section>

      <div className="sec" style={{ paddingTop: 40 }}>
        <div className="sec-head">
          <div><h2 className="sec-title">Produits <span>Populaires</span></h2><div className="sec-sub">Nos meilleures ventes</div></div>
          <button className="see-all" onClick={() => setPage("shop")}>Voir tout →</button>
        </div>
        <div className="product-grid">
          {pop.map(p => <ProductCard key={p.id} p={p} onView={onView} onAdd={onAdd} />)}
        </div>
      </div>

      {/* STATS */}
      <div className="stats-band">
        <div className="stats-inner">
          {[["500+","Produits"],["2K+","Clients"],["4.8★","Note moy."],["24h","Livraison"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <span className="stat-n">{n}</span>
              <span className="stat-l">{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* REVIEWS */}
      <div className="sec">
        <div className="sec-head"><div><h2 className="sec-title">Avis <span>Clients</span></h2><div className="sec-sub">Ce que disent nos clients</div></div></div>
        {approved.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0", color: "var(--mt)", fontSize: 13 }}>Soyez le premier a laisser un avis !</div>
        ) : (
          <div className="reviews-grid">{approved.slice(0, 6).map((r, i) => <ReviewCard key={r.id || i} r={r} />)}</div>
        )}
      </div>

      <div className="divider" />
      <Footer setPage={setPage} />
    </>
  );
}

// ─── SHOP VIEW ────────────────────────────────────────────────────
function ShopView({ products, onView, onAdd }) {
  const [cat, setCat] = useState("Tous");
  const [q, setQ] = useState("");
  const [pMin, setPMin] = useState("");
  const [pMax, setPMax] = useState("");
  const [sort, setSort] = useState("default");
  const [showF, setShowF] = useState(false);

  const filtered = products.filter(p => {
    if (cat !== "Tous" && p.cat !== cat) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase()) && !p.desc.toLowerCase().includes(q.toLowerCase())) return false;
    if (pMin && p.price < parseInt(pMin)) return false;
    if (pMax && p.price > parseInt(pMax)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc")  return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating")     return b.r - a.r;
    if (sort === "name")       return a.name.localeCompare(b.name);
    return 0;
  });

  const hasFilters = cat !== "Tous" || q || pMin || pMax || sort !== "default";
  const reset = () => { setCat("Tous"); setQ(""); setPMin(""); setPMax(""); setSort("default"); };
  const showCatalog = cat === "Tous" && !q && !pMin && !pMax && sort === "default";
  const groups = CATS.filter(c => c !== "Tous").map(c => ({ cat: c, items: sorted.filter(p => p.cat === c) })).filter(g => g.items.length > 0);

  return (
    <div className="sec" style={{ paddingTop: 80 }}>
      <div className="sec-head">
        <div><h2 className="sec-title">Notre <span>Boutique</span></h2><div className="sec-sub">{sorted.length} produit(s)</div></div>
        <div style={{ display: "flex", gap: 8 }}>
          {hasFilters && <button onClick={reset} style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "var(--rd)", borderRadius: 7, padding: "6px 12px", fontSize: 11, cursor: "pointer" }}>✕ Reset</button>}
          <button className="see-all" onClick={() => setShowF(f => !f)}>⚙️ Filtres{showF ? " ▲" : " ▼"}</button>
        </div>
      </div>

      <div className="search-wrap">
        <span className="search-ico">🔍</span>
        <input className="search-input" placeholder="Rechercher par nom, description..." value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {showF && (
        <div className="filter-box">
          <div style={{ fontWeight: 700, fontSize: 12, color: "var(--g)", marginBottom: 10 }}>🔍 Recherche avancee</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(150px,100%),1fr))", gap: 10 }}>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">Prix min (FCFA)</label>
              <input className="fi" type="number" placeholder="Ex: 50000" value={pMin} onChange={e => setPMin(e.target.value)} />
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">Prix max (FCFA)</label>
              <input className="fi" type="number" placeholder="Ex: 500000" value={pMax} onChange={e => setPMax(e.target.value)} />
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="fl">Trier par</label>
              <select className="fi" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="default">Par defaut</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix decroissant</option>
                <option value="rating">Meilleures notes</option>
                <option value="name">Nom A-Z</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="cat-tabs">
        {CATS.map(c => (
          <button key={c} className={"cat-tab" + (cat === c ? " active" : "")} onClick={() => setCat(c)}>
            {CAT_ICONS[c]} {c}
          </button>
        ))}
      </div>

      {showCatalog ? (
        groups.map(g => (
          <div key={g.cat} className="cat-group">
            <div className="cat-group-head">
              <div>
                <div className="cat-group-title"><span>{CAT_ICONS[g.cat]}</span>{g.cat}</div>
                <div className="cat-group-sub">{g.items.length} produit(s)</div>
              </div>
              <button className="see-all" onClick={() => setCat(g.cat)}>Voir tout →</button>
            </div>
            <div className="product-grid">
              {g.items.slice(0, 4).map(p => <ProductCard key={p.id} p={p} onView={onView} onAdd={onAdd} />)}
            </div>
            {g.items.length > 4 && (
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button className="btn-s btn-sm" onClick={() => setCat(g.cat)}>Voir les {g.items.length - 4} autres →</button>
              </div>
            )}
          </div>
        ))
      ) : (
        <>
          <div className="product-grid">{sorted.map(p => <ProductCard key={p.id} p={p} onView={onView} onAdd={onAdd} />)}</div>
          {sorted.length === 0 && (
            <div style={{ textAlign: "center", padding: "44px 0", color: "var(--mt)" }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Aucun produit trouve</div>
              <button className="btn-p btn-sm" onClick={reset}>Reinitialiser</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── STATIC PAGES ─────────────────────────────────────────────────
function PageBase({ title, children }) {
  return (
    <div className="page-sec">
      <h1 className="page-title">{title}</h1>
      <div className="page-bar" />
      {children}
    </div>
  );
}

function PageAPropos({ setPage }) {
  const items = [
    { icon: "🎯", t: "Notre mission", txt: "Rendre accessibles les meilleurs produits a tous les Ivoiriens, avec un service client irreprochable et une livraison rapide partout en CI." },
    { icon: "💎", t: "Nos valeurs",   txt: "Qualite - Confiance - Transparence - Proximite - Rapidite. Chaque produit est selectionne avec soin pour votre satisfaction." },
    { icon: "🏆", t: "Pourquoi nous", txt: "Produits authentiques - Prix competitifs - Livraison rapide - Paiement Mobile Money - Service WhatsApp 7j/7" },
  ];
  return (
    <PageBase title="A propos de nous">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "var(--cd)", borderRadius: 14, padding: 20, border: "1px solid var(--br)", display: "flex", gap: 14, alignItems: "flex-start" }}>
          <img src={LOGO} alt="logo" style={{ width: 52, height: 52, objectFit: "contain", flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: "var(--tx)", marginBottom: 4 }}>Baark Wende Store</div>
            <div style={{ fontSize: 12, color: "var(--g)", fontStyle: "italic", marginBottom: 8 }}>Qualite et confiance a prix accessible</div>
            <p style={{ fontSize: 13, color: "var(--mt)", lineHeight: 1.8 }}>Boutique en ligne basee a Abidjan, Cote d'Ivoire. Nous proposons montres, telephones, voitures, vetements et plus, a des prix accessibles avec un service de qualite.</p>
          </div>
        </div>
        {items.map((s, i) => (
          <div key={i} className="content-card">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: "var(--tx)" }}>{s.t}</div>
            </div>
            <p style={{ fontSize: 13, color: "var(--mt)", lineHeight: 1.8 }}>{s.txt}</p>
          </div>
        ))}
        <button className="btn-p" style={{ padding: "12px 28px", fontSize: 13, alignSelf: "center" }} onClick={() => setPage("shop")}>Explorer la boutique →</button>
      </div>
    </PageBase>
  );
}

function PageContact() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const contacts = [
    { icon: "📍", t: "Adresse",    i: "Abidjan, Cote d'Ivoire" },
    { icon: "📞", t: "Telephones", i: BOUTIQUE.tel1 + " / " + BOUTIQUE.tel2 },
    { icon: "📧", t: "Email",      i: BOUTIQUE.email },
    { icon: "💬", t: "WhatsApp",   i: "7j/7 — " + BOUTIQUE.tel2 },
    { icon: "📘", t: "Facebook",   i: BOUTIQUE.fb },
    { icon: "⏰", t: "Horaires",   i: BOUTIQUE.horaires },
  ];
  return (
    <PageBase title="Contactez-nous">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(200px,100%),1fr))", gap: 12, marginBottom: 20 }}>
        {contacts.map((c, i) => (
          <div key={i} className="info-card">
            <span style={{ fontSize: 22, flexShrink: 0 }}>{c.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, color: "var(--tx)", marginBottom: 2 }}>{c.t}</div>
              <div style={{ fontSize: 11, color: "var(--mt)", lineHeight: 1.7 }}>{c.i}</div>
            </div>
          </div>
        ))}
      </div>
      {!sent ? (
        <div style={{ background: "var(--cd)", borderRadius: 14, padding: 20, border: "1px solid var(--br)" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "var(--tx)", marginBottom: 14 }}>Envoyez-nous un message</div>
          <div className="fg"><label className="fl">Nom *</label><input className="fi" value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom complet" /></div>
          <div className="fg"><label className="fl">Message *</label><textarea className="fi" rows={3} value={msg} onChange={e => setMsg(e.target.value)} placeholder="Comment pouvons-nous vous aider ?" /></div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn-p" style={{ flex: 1, padding: 12 }} onClick={() => { if (!name || !msg) return; setSent(true); }}>Envoyer</button>
            <button className="btn-s" style={{ padding: "12px 16px" }} onClick={() => window.open("https://wa.me/" + BOUTIQUE.wa, "_blank")}>💬 WhatsApp</button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 14, padding: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, marginBottom: 6, color: "var(--tx)" }}>Message envoye !</div>
          <p style={{ color: "var(--mt)", fontSize: 13 }}>Merci {name} ! Nous vous repondrons tres vite.</p>
        </div>
      )}
    </PageBase>
  );
}

function PageLivraison() {
  const T  = { fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:"var(--blanc)", marginBottom:10, display:"flex", alignItems:"center", gap:8 };
  const LI = { fontSize:13, color:"var(--gris-3)", lineHeight:1.8, fontFamily:"'Montserrat',sans-serif" };
  return (
    <PageBase title="Politique de Livraison">
      <div style={{ color:"var(--or)", fontStyle:"italic", fontSize:13, marginBottom:20, fontFamily:"'Montserrat',sans-serif" }}>
        Chez Baark Wende Store, nous mettons tout en oeuvre pour vous garantir une livraison rapide, fiable et securisee.
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {/* Zones */}
        <div className="content-card">
          <div style={T}><span>📍</span>Zones et Tarifs</div>
          <ul style={{ paddingLeft:16, display:"flex", flexDirection:"column", gap:6 }}>
            <li style={LI}><strong style={{color:"var(--or)"}}>Abidjan</strong> : 2 000 FCFA</li>
            <li style={LI}><strong style={{color:"var(--or)"}}>Anyama, Songon, Bingerville</strong> : 3 000 FCFA</li>
            <li style={LI}><strong style={{color:"var(--or)"}}>Expedition (autres zones)</strong> : 2 000 FCFA</li>
          </ul>
        </div>
        {/* Delais */}
        <div className="content-card">
          <div style={T}><span>⏱️</span>Delais de Livraison</div>
          <ul style={{ paddingLeft:16, display:"flex", flexDirection:"column", gap:6 }}>
            <li style={LI}>Toutes les commandes livrees en <strong style={{color:"var(--or)"}}>moins de 24 heures</strong> apres confirmation.</li>
            <li style={LI}>Livraisons effectuees tous les jours, selon la disponibilite de nos agents.</li>
          </ul>
        </div>
        {/* Traitement */}
        <div className="content-card">
          <div style={T}><span>📦</span>Traitement des Commandes</div>
          <ul style={{ paddingLeft:16, display:"flex", flexDirection:"column", gap:6 }}>
            <li style={LI}>Les commandes sont confirmees apres validation par notre equipe.</li>
            <li style={LI}>Une fois validee, votre commande est immediatement preparee et confiee a notre service de livraison.</li>
          </ul>
        </div>
        {/* Paiement */}
        <div className="content-card">
          <div style={T}><span>💳</span>Mode de Paiement</div>
          <ul style={{ paddingLeft:16, display:"flex", flexDirection:"column", gap:6 }}>
            <li style={LI}>Paiement a la livraison disponible (selon la zone).</li>
            <li style={LI}>Autres moyens de paiement acceptes selon accord avec le client.</li>
          </ul>
        </div>
        {/* Assistance */}
        <div className="content-card">
          <div style={T}><span>📞</span>Assistance</div>
          <p style={LI}>Pour toute question concernant votre livraison :</p>
          <div style={{ marginTop:8, padding:"10px 14px", background:"var(--or-gl)", border:"1px solid var(--or-bd)", borderRadius:8, fontSize:13, color:"var(--or)", fontFamily:"'Montserrat',sans-serif", fontWeight:600 }}>
            📱 Telephone / WhatsApp : 0170260670
          </div>
        </div>
        {/* Important */}
        <div style={{ background:"rgba(212,175,55,.06)", border:"1px solid var(--or-bd)", borderRadius:12, padding:16 }}>
          <div style={T}><span>⚠️</span>Informations Importantes</div>
          <ul style={{ paddingLeft:16, display:"flex", flexDirection:"column", gap:6 }}>
            <li style={LI}>Assurez-vous que vos coordonnees sont correctes pour eviter tout retard.</li>
            <li style={LI}>En cas d'absence, une nouvelle tentative pourra etre programmee.</li>
          </ul>
          <div style={{ marginTop:12, fontSize:12, color:"var(--or)", fontStyle:"italic", fontFamily:"'Montserrat',sans-serif" }}>
            💡 Baark Wende Store s'engage a vous offrir un service rapide, fiable et de qualite.
          </div>
        </div>
      </div>
    </PageBase>
  );
}

function PageConditions() {
  const T  = { fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:700, color:"var(--or)", marginBottom:8 };
  const P  = { fontSize:12, color:"var(--gris-3)", lineHeight:1.85, fontFamily:"'Montserrat',sans-serif" };
  const articles = [
    { icon:"🛍️", t:"1. Objet", txt:"Les presentes conditions definissent les modalites de vente des produits proposes par Baark Wende Store, ainsi que les droits et obligations des parties." },
    { icon:"👤", t:"2. Acceptation", txt:"Toute commande passee sur le site implique l'acceptation pleine et entiere des presentes Conditions Generales de Vente." },
    { icon:"📦", t:"3. Produits", txt:"Les produits sont decrits avec la plus grande precision possible. De legeres differences (couleur, forme) peuvent exister." },
    { icon:"💰", t:"4. Prix", txt:"Les prix sont en FCFA. Les frais de livraison sont ajoutes selon la zone. Baark Wende Store se reserve le droit de modifier ses prix a tout moment." },
    { icon:"🧾", t:"5. Commande", txt:"Toute commande est confirmee apres validation. Baark Wende Store peut annuler en cas de probleme (indisponibilite, erreur, etc.)." },
    { icon:"🚚", t:"6. Livraison", txt:"Livraisons en moins de 24h apres confirmation. Abidjan : 2 000 FCFA — Anyama/Songon/Bingerville : 3 000 FCFA — Expedition : 2 000 FCFA. Le client doit etre disponible." },
    { icon:"💳", t:"7. Paiement", txt:"Paiement a la livraison disponible. D'autres moyens peuvent etre proposes selon accord." },
    { icon:"🔁", t:"8. Retours et echanges", txt:"Retours acceptes uniquement si produit defectueux ou non conforme. Reclamation sous 24h apres reception. Produit retourne dans son etat d'origine." },
    { icon:"⚠️", t:"9. Responsabilite", txt:"Baark Wende Store ne peut etre tenu responsable des dommages dus a une mauvaise utilisation ou a un cas de force majeure." },
    { icon:"🔐", t:"10. Donnees personnelles", txt:"Les informations collectees servent uniquement au traitement des commandes. Elles ne sont ni vendues ni partagees a des tiers." },
    { icon:"📞", t:"11. Service client", txt:"Pour toute information ou reclamation : 📱 Telephone / WhatsApp : 0170260670" },
    { icon:"📌", t:"12. Modification", txt:"Baark Wende Store se reserve le droit de modifier les presentes conditions a tout moment." },
  ];
  return (
    <PageBase title="Conditions Generales de Vente">
      <div style={{ background:"rgba(212,175,55,.06)", border:"1px solid var(--or-bd)", borderRadius:9, padding:"11px 14px", fontSize:12, color:"var(--or)", marginBottom:18, fontFamily:"'Montserrat',sans-serif" }}>
        Mise a jour : 2025 — En passant commande, vous reconnaissez avoir lu et accepte ces conditions.
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {articles.map((a, i) => (
          <div key={i} className="content-card">
            <div style={T}>{a.icon} {a.t}</div>
            <p style={P}>{a.txt}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop:16, padding:"14px 16px", background:"rgba(212,175,55,.08)", border:"1px solid var(--or-bd)", borderRadius:12, fontSize:12, color:"var(--or)", fontStyle:"italic", textAlign:"center", fontFamily:"'Montserrat',sans-serif" }}>
        💡 En passant commande, le client reconnait avoir pris connaissance et accepte les presentes CGV.
      </div>
    </PageBase>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <img src={LOGO} alt="logo" style={{ width: 34, height: 34, objectFit: "contain" }} />
            <div>
              <div className="footer-brand">Baark Wende Store</div>
              <div className="footer-slogan">Qualite et confiance a prix accessible</div>
            </div>
          </div>
          <p className="footer-desc">Votre boutique de confiance en Cote d'Ivoire : montres, voitures, telephones, vetements et plus.</p>
          <div style={{ fontSize: 11, color: "var(--mt)", display: "flex", flexDirection: "column", gap: 3 }}>
            <span>📍 {BOUTIQUE.lieu}</span>
            <span>📞 {BOUTIQUE.tel1} / {BOUTIQUE.tel2}</span>
            <span>📧 {BOUTIQUE.email}</span>
          </div>
        </div>
        <div>
          <div className="footer-col-t">Catalogue</div>
          <div className="footer-links">
            {["Montres","Telephones","Voitures","Vetements","Autres"].map(c => (
              <span key={c} className="footer-lnk">→ {c}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="footer-col-t">Pages</div>
          <div className="footer-links">
            {[["apropos","A propos"],["contact","Contact"],["livraison","Livraison"],["conditions","CGV"]].map(([id, lbl]) => (
              <span key={id} className="footer-lnk" onClick={() => setPage(id)}>→ {lbl}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="footer-col-t">Paiements</div>
          <div className="footer-links">
            {["📱 MTN Mobile Money","💚 Wave","🟠 Orange Money","🚪 A la livraison"].map(p => (
              <span key={p} className="footer-lnk">{p}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 Baark Wende Store</span>
        <span>Fait avec ❤️ en Cote d'Ivoire</span>
      </div>
    </footer>
  );
}

// ─── MOBILE NAV ───────────────────────────────────────────────────
function NavIcon({ type, active }) {
  const c = active ? "var(--or)" : "var(--gris-2)";
  const icons = {
    home: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={c} style={{transition:".2s"}}>
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
    shop: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" style={{transition:".2s"}}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
    cart: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" style={{transition:".2s"}}>
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
      </svg>
    ),
    contact: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" style={{transition:".2s"}}>
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.1 6.1l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 15v1.92z"/>
      </svg>
    ),
  };
  return icons[type] || null;
}

function MobileNav({ page, setPage, cartCount, onCartOpen }) {
  return (
    <div className="mob-nav">
      {[["home","Accueil"],["shop","Boutique"]].map(([id, lbl]) => (
        <button key={id} className={"mob-btn" + (page === id ? " active" : "")} onClick={() => setPage(id)}>
          <NavIcon type={id} active={page === id} />
          <span>{lbl}</span>
        </button>
      ))}
      <button className={"mob-btn" + (cartCount > 0 ? " active" : "")} style={{ position:"relative" }} onClick={onCartOpen}>
        <NavIcon type="cart" active={cartCount > 0} />
        <span>Panier</span>
        {cartCount > 0 && (
          <span style={{ position:"absolute", top:4, right:6, background:"var(--rouge)", color:"#fff", borderRadius:"50%", width:15, height:15, fontSize:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>
            {cartCount}
          </span>
        )}
      </button>
      <button className={"mob-btn" + (page === "contact" ? " active" : "")} onClick={() => setPage("contact")}>
        <NavIcon type="contact" active={page === "contact"} />
        <span>Contact</span>
      </button>
    </div>
  );
}

// ─── CLIENT STORE (MAIN) ──────────────────────────────────────────
export default function ClientStore({ products, orders, setOrders, reviews, setReviews, onAdmin, fb, logo }) {
  const [page, setPageState] = useState("home");
  const [sel, setSel] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();
  const [toast, showT] = useToast();

  const setPage = (p) => {
    setPageState(p);
    const titles = {
      home: "Baark Wende Store", shop: "Boutique — Baark Wende Store",
      apropos: "A propos — Baark Wende Store", contact: "Contact — Baark Wende Store",
      livraison: "Livraison — Baark Wende Store", conditions: "CGV — Baark Wende Store",
    };
    document.title = titles[p] || "Baark Wende Store";
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Navbar page={page} setPage={setPage} cartCount={cart.count} onCartOpen={() => setCartOpen(true)} onAdmin={onAdmin} logo={logo} />

      {page === "home"       && <HomeView products={products} setPage={setPage} onView={setSel} onAdd={cart.add} reviews={reviews} />}
      {page === "shop"       && <ShopView products={products} onView={setSel} onAdd={cart.add} />}
      {page === "apropos"    && <PageAPropos setPage={setPage} />}
      {page === "contact"    && <PageContact />}
      {page === "livraison"  && <PageLivraison />}
      {page === "conditions" && <PageConditions />}

      <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setOrders={setOrders} showT={showT} fb={fb} />

      {sel && <ProdModal prod={sel} onClose={() => setSel(null)} onAddCart={cart.add} reviews={reviews} setReviews={setReviews} showT={showT} fb={fb} />}

      <button className="wa-float" title="WhatsApp" onClick={() => window.open("https://wa.me/" + BOUTIQUE.wa, "_blank")}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.847L.057 23.492a.5.5 0 0 0 .604.643l5.837-1.53A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.528-5.197-1.443l-.36-.215-3.733.979.996-3.642-.236-.374A9.945 9.945 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </button>

      <MobileNav page={page} setPage={setPage} cartCount={cart.count} onCartOpen={() => setCartOpen(true)} />

      <Toast toast={toast} />
    </>
  );
}
