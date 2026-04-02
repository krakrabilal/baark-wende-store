// src/features/admin/AdminDashboard.jsx
import { useState, useEffect, useRef } from "react";
import { LOGO, BOUTIQUE, fmt } from "../../data/constants";
import { useToast } from "../../hooks/useToast";
import { useNotifications } from "../../hooks/useToast";
import { Toast, StatusBadge, NotifBell, NotifPanel } from "../../components/UI";

// ─── HELPERS ─────────────────────────────────────────────────────
const PROD_CATS = ["Montres","Telephones","Voitures","Vetements","Autres"];
const STATUSES  = ["En attente","En cours","Livre","Annule"];

function fmtDate(d) {
  if (!d) return "";
  const parts = d.split("/");
  if (parts.length === 3) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).toISOString().split("T")[0];
  return d;
}

// ─── PHOTO SLOT ───────────────────────────────────────────────────
function PhotoSlot({ src, idx, onRead, onRemove }) {
  const readFile = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = e => onRead(idx, e.target.result);
    r.readAsDataURL(file);
  };
  return (
    <div className={"photo-slot" + (src ? " filled" : "")}>
      {src ? (
        <>
          <img src={src} alt="" />
          <button className="photo-rm" onClick={e => { e.stopPropagation(); onRemove(idx); }}>✕</button>
        </>
      ) : (
        <>
          <span style={{ fontSize: 22, pointerEvents: "none" }}>📷</span>
          <span className="photo-lbl">Photo {idx + 1}</span>
          <input type="file" accept="image/*" onChange={e => readFile(e.target.files[0])} />
        </>
      )}
    </div>
  );
}

// ─── PRODUCTS ────────────────────────────────────────────────────
function AProds({ products, setProducts, showT }) {
  const EMPTY = { name:"", cat:"Montres", price:"", oldPrice:"", stock:"", desc:"", badge:"" };
  const [form, setForm]   = useState(false);
  const [edit, setEdit]   = useState(null);
  const [np, setNp]       = useState({ ...EMPTY });
  const [photos, setPh]   = useState(["","",""]);
  const [err, setErr]     = useState("");
  const [q, setQ]         = useState("");

  const fl = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));

  const readFile = (idx, data) => { const u = [...photos]; u[idx] = data; setPh(u); };
  const removePhoto = (idx) => { const u = [...photos]; u[idx] = ""; setPh(u); };

  const reset = () => { setNp({ ...EMPTY }); setPh(["","",""]); setErr(""); setEdit(null); };

  const openEdit = (p) => {
    setNp({ name:p.name, cat:p.cat, price:String(p.price), oldPrice:p.old?String(p.old):"", stock:String(p.stock), desc:p.desc, badge:p.badge||"" });
    const ph = [...(p.photos||[]),"","",""].slice(0,3);
    setPh(ph); setForm(true); setEdit(p);
  };

  const save = () => {
    setErr("");
    if (!np.name.trim()) { setErr("Le nom est obligatoire."); return; }
    if (!np.price || isNaN(parseInt(np.price))) { setErr("Entrez un prix valide."); return; }
    const emoji = {Montres:"⌚",Telephones:"📱",Voitures:"🚗",Vetements:"👔",Autres:"🎁"}[np.cat] || "📦";
    const prod = {
      name: np.name.trim(), cat: np.cat, price: parseInt(np.price),
      old: np.oldPrice ? parseInt(np.oldPrice) : null,
      stock: parseInt(np.stock) || 0, desc: np.desc.trim(),
      badge: np.badge.trim() || null, img: emoji,
      photos: photos.filter(u => u && u.trim()),
      r: edit ? edit.r : 0, rv: edit ? edit.rv : 0,
    };
    if (edit) {
      setProducts(prev => prev.map(p => p.id === edit.id ? { ...p, ...prod } : p));
      showT("Produit modifie");
    } else {
      setProducts(prev => [{ ...prod, id: Date.now() }, ...prev]);
      showT("Produit ajoute");
    }
    reset(); setForm(false);
  };

  return (
    <>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}>
        <div><div className="admin-title">Produits</div><div className="admin-sub">{products.length} produit(s)</div></div>
        <button className="btn-p btn-sm" onClick={() => { reset(); setForm(f => !f); }}>{form ? "✕ Annuler" : "+ Ajouter"}</button>
      </div>

      {form && (
        <div className="table-wrap" style={{ padding:16, marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:13, marginBottom:14, color:"var(--tx)" }}>{edit ? "Modifier" : "Nouveau produit"}</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(170px,100%),1fr))", gap:10 }}>
            {[["Nom *","name","text","Ex: Montre Rolex"],["Prix (FCFA) *","price","number","150000"],["Ancien prix","oldPrice","number","200000"],["Stock","stock","number","10"],["Badge","badge","text","Nouveau..."]].map(([l,k,t,ph]) => (
              <div key={k} className="fg"><label className="fl">{l}</label><input className="fi" type={t} value={np[k]||""} onChange={e=>setNp({...np,[k]:e.target.value})} placeholder={ph}/></div>
            ))}
            <div className="fg">
              <label className="fl">Categorie</label>
              <select className="fi" value={np.cat} onChange={e=>setNp({...np,cat:e.target.value})}>
                {PROD_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="fg" style={{ marginTop:8 }}>
            <label className="fl">Description</label>
            <textarea className="fi" rows={2} value={np.desc} onChange={e=>setNp({...np,desc:e.target.value})} placeholder="Description du produit..." />
          </div>
          <div style={{ marginTop:10, padding:12, background:"var(--cd)", borderRadius:9, border:"1px solid var(--br)" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"var(--g)", marginBottom:8 }}>📸 Photos (max 3)</div>
            <div className="photo-grid">
              {[0,1,2].map(i => <PhotoSlot key={i} src={photos[i]} idx={i} onRead={readFile} onRemove={removePhoto} />)}
            </div>
          </div>
          {err && <div className="f-err">{err}</div>}
          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <button className="btn-p btn-sm" onClick={save}>✅ Enregistrer</button>
            <button className="btn-s btn-sm" onClick={() => { reset(); setForm(false); }}>Annuler</button>
          </div>
        </div>
      )}

      <div className="search-wrap" style={{ marginBottom:12 }}>
        <span className="search-ico">🔍</span>
        <input className="search-input" placeholder="Rechercher un produit..." value={q} onChange={e=>setQ(e.target.value)} />
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Photo</th><th>Produit</th><th>Cat.</th><th>Prix</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>
            {fl.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ width:40, height:40, borderRadius:7, overflow:"hidden", background:"var(--cd)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                    {p.photos?.[0] ? <img src={p.photos[0]} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.style.display="none"}} /> : p.img}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight:600, color:"var(--tx)" }}>{p.name}</div>
                  {p.badge && <span style={{ fontSize:9, color:"var(--g)" }}>{p.badge}</span>}
                </td>
                <td><span className="sbg sbg-p" style={{ fontSize:9 }}>{p.cat}</span></td>
                <td style={{ fontWeight:700, color:"var(--g)" }}>{fmt(p.price)}</td>
                <td style={{ fontWeight:700, color:p.stock < 5 ? "var(--rd)" : "var(--gn)" }}>{p.stock}</td>
                <td>
                  <div style={{ display:"flex", gap:4 }}>
                    <button className="ab ab-ed" onClick={() => openEdit(p)}>✏️</button>
                    <button className="ab ab-dl" onClick={() => { if (window.confirm("Supprimer ?")) { setProducts(prev => prev.filter(x => x.id !== p.id)); showT("Supprime"); } }}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── ORDERS ──────────────────────────────────────────────────────
function AOrders({ orders, setOrders, showT }) {
  const [q, setQ] = useState("");
  const fl = orders.filter(o => o.client.toLowerCase().includes(q.toLowerCase()) || o.product.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="admin-title">Commandes</div>
      <div className="admin-sub">{orders.length} commande(s)</div>
      <div className="search-wrap" style={{ marginBottom:12 }}>
        <span className="search-ico">🔍</span>
        <input className="search-input" placeholder="Rechercher client ou produit..." value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Client</th><th>Tel.</th><th>Produit</th><th>Montant</th><th>Lieu</th><th>Statut</th><th>Date</th></tr></thead>
          <tbody>
            {fl.map(o => (
              <tr key={o.id}>
                <td style={{ fontFamily:"monospace", fontSize:10, color:"var(--g)" }}>{o.id}</td>
                <td style={{ fontWeight:600 }}>{o.client}</td>
                <td style={{ color:"var(--mt)", fontSize:11 }}>{o.phone}</td>
                <td style={{ color:"var(--mt)", fontSize:11 }}>{o.product}</td>
                <td style={{ fontWeight:700, color:"var(--g)" }}>{fmt(o.amount)}</td>
                <td style={{ color:"var(--mt)", fontSize:11 }}>{o.lieu}</td>
                <td>
                  <select
                    className="fi"
                    style={{ padding:"3px 6px", fontSize:10, width:"auto" }}
                    value={o.status}
                    onChange={e => { const st = e.target.value; setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: st } : x)); showT("Statut mis a jour"); }}
                  >
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ color:"var(--mt)", fontSize:10 }}>{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── STOCK ───────────────────────────────────────────────────────
function AStock({ products, setProducts }) {
  return (
    <>
      <div className="admin-title">Stock</div>
      <div className="admin-sub">Gestion du stock en temps reel</div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Produit</th><th>Categorie</th><th>Stock</th><th>Modifier</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight:600 }}>{p.name}</td>
                <td><span className="sbg sbg-p" style={{ fontSize:9 }}>{p.cat}</span></td>
                <td><span style={{ fontWeight:700, color:p.stock<5?"var(--rd)":p.stock<10?"var(--or)":"var(--gn)" }}>{p.stock}</span></td>
                <td>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <button className="ab ab-dl" onClick={() => setProducts(prev=>prev.map(x=>x.id===p.id?{...x,stock:Math.max(0,x.stock-1)}:x))}>−</button>
                    <span style={{ fontWeight:700, minWidth:24, textAlign:"center" }}>{p.stock}</span>
                    <button className="ab ab-ok" onClick={() => setProducts(prev=>prev.map(x=>x.id===p.id?{...x,stock:x.stock+1}:x))}>+</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── INVENTORY ───────────────────────────────────────────────────
function AInventory({ products }) {
  const [q, setQ]     = useState("");
  const [catF, setCat] = useState("Tous");
  const fl = products.filter(p => (catF==="Tous"||p.cat===catF) && p.name.toLowerCase().includes(q.toLowerCase()));
  const totalVal = fl.reduce((s,p) => s+p.price*p.stock, 0);

  return (
    <>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div><div className="admin-title">Inventaire</div><div className="admin-sub">{fl.length} produits</div></div>
      </div>
      <div className="stat-grid">
        {[{icon:"📦",l:"Produits",v:fl.length},{icon:"🔢",l:"Unites",v:fl.reduce((s,p)=>s+p.stock,0)},{icon:"💰",l:"Valeur stock",v:fmt(totalVal)},{icon:"⚠️",l:"Critique",v:fl.filter(p=>p.stock<5).length}].map((s,i)=>(
          <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-lbl">{s.l}</div><div className="stat-val" style={{fontSize:i===2?13:undefined}}>{s.v}</div></div>
        ))}
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
        <div className="search-wrap" style={{ flex:1, minWidth:160, marginBottom:0 }}>
          <span className="search-ico">🔍</span>
          <input className="search-input" placeholder="Rechercher..." value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        <select className="fi" style={{ width:"auto", padding:"9px 12px" }} value={catF} onChange={e=>setCat(e.target.value)}>
          {["Tous",...PROD_CATS].map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Produit</th><th>Categorie</th><th>Stock</th><th>Prix unit.</th><th>Valeur</th><th>Statut</th></tr></thead>
          <tbody>
            {fl.map(p=>(
              <tr key={p.id}>
                <td style={{fontWeight:600}}>{p.name}</td>
                <td><span className="sbg sbg-p" style={{fontSize:9}}>{p.cat}</span></td>
                <td style={{fontWeight:700,color:p.stock<5?"var(--rd)":p.stock<10?"var(--or)":"var(--gn)"}}>{p.stock}</td>
                <td style={{color:"var(--g)"}}>{fmt(p.price)}</td>
                <td style={{fontWeight:700}}>{fmt(p.price*p.stock)}</td>
                <td><span className={"sbg "+(p.stock<5?"sbg-r":p.stock<10?"sbg-o":"sbg-g")} style={{fontSize:9}}>{p.stock<5?"Critique":p.stock<10?"Faible":"OK"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── VENTES ──────────────────────────────────────────────────────
function AVentes({ orders }) {
  const now = new Date();
  const fmt2 = d => d.toISOString().split("T")[0];
  const [df, setDf] = useState(fmt2(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [dt, setDt] = useState(fmt2(now));

  const filtered = orders.filter(o => {
    const d = new Date(fmtDate(o.date));
    if (isNaN(d)) return false;
    return d >= new Date(df) && d <= new Date(dt + "T23:59:59");
  });
  const livrees = filtered.filter(o => o.status === "Livre");
  const ca = livrees.reduce((s,o) => s+o.amount, 0);

  return (
    <>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div><div className="admin-title">Ventes par periode</div><div className="admin-sub">Analysez vos ventes</div></div>
      </div>
      <div className="table-wrap" style={{ padding:14, marginBottom:16 }}>
        <div style={{ fontWeight:600, fontSize:12, marginBottom:10, color:"var(--tx)" }}>Periode</div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
          <div className="fg" style={{marginBottom:0}}><label className="fl">Du</label><input className="fi" type="date" value={df} onChange={e=>setDf(e.target.value)} /></div>
          <div className="fg" style={{marginBottom:0}}><label className="fl">Au</label><input className="fi" type="date" value={dt} onChange={e=>setDt(e.target.value)} /></div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {[["Auj.",()=>{setDf(fmt2(now));setDt(fmt2(now));}],["Ce mois",()=>{setDf(fmt2(new Date(now.getFullYear(),now.getMonth(),1)));setDt(fmt2(now));}],["Tout",()=>{setDf("");setDt("");}]].map(([l,fn])=>(
              <button key={l} className="btn-s btn-sm" onClick={fn}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="stat-grid" style={{marginBottom:16}}>
        {[{icon:"🛒",l:"Commandes",v:filtered.length},{icon:"✅",l:"Livrees",v:livrees.length},{icon:"💰",l:"Chiffre d'affaires",v:fmt(ca)},{icon:"⏳",l:"En attente",v:filtered.filter(o=>o.status==="En attente").length}].map((s,i)=>(
          <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-lbl">{s.l}</div><div className="stat-val" style={{color:i===2?"var(--g)":undefined,fontSize:i===2?13:undefined}}>{s.v}</div></div>
        ))}
      </div>
      <div className="table-wrap">
        <div className="table-bar"><span style={{fontWeight:600,color:"var(--tx)"}}>Commandes ({filtered.length})</span></div>
        <table>
          <thead><tr><th>ID</th><th>Client</th><th>Produit</th><th>Montant</th><th>Statut</th><th>Date</th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={6} style={{textAlign:"center",color:"var(--mt)",padding:20}}>Aucune commande</td></tr>
              : filtered.map(o=>(
                <tr key={o.id}>
                  <td style={{fontFamily:"monospace",fontSize:10,color:"var(--g)"}}>{o.id}</td>
                  <td style={{fontWeight:600}}>{o.client}</td>
                  <td style={{color:"var(--mt)",fontSize:11}}>{o.product}</td>
                  <td style={{fontWeight:700,color:"var(--g)"}}>{fmt(o.amount)}</td>
                  <td><StatusBadge status={o.status}/></td>
                  <td style={{color:"var(--mt)",fontSize:11}}>{o.date}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── STATS ───────────────────────────────────────────────────────
function AStats({ products, orders }) {
  const total = orders.filter(o=>o.status==="Livre").reduce((s,o)=>s+o.amount,0);
  const cats = PROD_CATS.map(c=>({c,n:orders.filter(o=>products.find(p=>p.name===o.product&&p.cat===c)).length}));
  const maxN = Math.max(...cats.map(c=>c.n),1);
  return (
    <>
      <div className="admin-title">Statistiques</div>
      <div className="admin-sub">Apercu des performances</div>
      <div className="stat-grid">
        {[{icon:"💰",l:"CA (Livre)",v:fmt(total)},{icon:"🛒",l:"Commandes",v:orders.length},{icon:"📦",l:"Produits",v:products.length},{icon:"⏳",l:"En attente",v:orders.filter(o=>o.status==="En attente").length}].map((s,i)=>(
          <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-lbl">{s.l}</div><div className="stat-val" style={{fontSize:i===0?12:undefined}}>{s.v}</div></div>
        ))}
      </div>
      <div className="table-wrap" style={{padding:16}}>
        <div style={{fontWeight:700,marginBottom:14,color:"var(--tx)"}}>Ventes par categorie</div>
        {cats.map(({c,n})=>(
          <div key={c} style={{marginBottom:11}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3,color:"var(--tx)"}}><span>{c}</span><span style={{fontWeight:700,color:"var(--g)"}}>{n}</span></div>
            <div style={{background:"#E5E7EB",borderRadius:4,height:7}}><div style={{background:"linear-gradient(90deg,var(--g),var(--pk))",width:((n/maxN)*100)+"%",height:"100%",borderRadius:4,transition:".5s"}}/></div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── REVIEWS ─────────────────────────────────────────────────────
function AReviews({ reviews, setReviews, showT, fb }) {
  const [filter, setFilter] = useState("all");
  const pending = reviews.filter(r => !r.approved).length;
  const fl = reviews.filter(r =>
    filter === "all" ||
    (filter === "pending"  && !r.approved) ||
    (filter === "approved" &&  r.approved)
  );

  const approve = (r) => {
    setReviews(prev => prev.map(x => x.id === r.id ? { ...x, approved: true } : x));
    if (fb && r.fireId) fb.updateReview(r.fireId, { approved: true });
    showT("Avis approuve et publie ✅");
  };

  const depublish = (r) => {
    setReviews(prev => prev.map(x => x.id === r.id ? { ...x, approved: false } : x));
    if (fb && r.fireId) fb.updateReview(r.fireId, { approved: false });
    showT("Avis depublie");
  };

  const remove = (r) => {
    setReviews(prev => prev.filter(x => x.id !== r.id));
    if (fb && r.fireId) fb.deleteReview(r.fireId);
    showT("Avis supprime");
  };

  const C = {
    card:    { background:"var(--noir-4)", border:"1px solid var(--gris-2)", borderRadius:12, padding:16, position:"relative" },
    pending: { background:"rgba(212,175,55,.06)", border:"1px solid var(--or-bd)", borderRadius:12, padding:16, position:"relative" },
    badge:   { position:"absolute", top:12, right:12, background:"var(--or-gl)", border:"1px solid var(--or-bd)", borderRadius:100, padding:"3px 10px", fontSize:9, color:"var(--or)", fontWeight:700, letterSpacing:1 },
    name:    { fontWeight:700, fontSize:13, color:"var(--blanc)", fontFamily:"'Playfair Display',serif" },
    date:    { fontSize:10, color:"var(--gris-3)", letterSpacing:.5 },
    prod:    { fontSize:9, color:"var(--or)", marginTop:2, letterSpacing:.5 },
    txt:     { fontSize:12, color:"var(--blanc-3)", lineHeight:1.75, marginBottom:12, fontStyle:"italic" },
  };

  return (
    <>
      <div className="admin-title">Avis clients</div>
      <div className="admin-sub">{reviews.length} avis — {pending} en attente de validation</div>

      {/* Filtres */}
      <div style={{ display:"flex", gap:7, marginBottom:16, flexWrap:"wrap" }}>
        {[["all","Tous",reviews.length],["pending","En attente",pending],["approved","Approuves",reviews.filter(r=>r.approved).length]].map(([id,lbl,nb]) => (
          <button key={id} onClick={() => setFilter(id)} style={{
            padding:"7px 14px", borderRadius:100, cursor:"pointer",
            border:"1px solid " + (filter===id ? "var(--or)" : "var(--gris-2)"),
            background: filter===id ? "var(--or-gl)" : "transparent",
            color: filter===id ? "var(--or)" : "var(--gris-3)",
            fontSize:11, fontFamily:"'Montserrat',sans-serif",
            fontWeight: filter===id ? 700 : 400, letterSpacing:"0.5px",
          }}>
            {lbl} ({nb})
          </button>
        ))}
      </div>

      {/* Alerte en attente */}
      {pending > 0 && filter !== "approved" && (
        <div style={{ background:"rgba(212,175,55,.08)", border:"1px solid var(--or-bd)", borderRadius:9, padding:"11px 14px", marginBottom:14, fontSize:12, color:"var(--or)", display:"flex", alignItems:"center", gap:8 }}>
          ⚠️ <strong>{pending} avis</strong> en attente — approuvez-les pour les publier sur le site.
        </div>
      )}

      {/* Liste */}
      {fl.length === 0
        ? <div style={{ textAlign:"center", padding:"32px 0", color:"var(--gris-3)", fontSize:13 }}>Aucun avis dans cette categorie.</div>
        : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {fl.map(r => (
            <div key={r.id} style={r.approved ? C.card : C.pending}>
              {!r.approved && <div style={C.badge}>EN ATTENTE</div>}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,var(--or-fonce),var(--or))", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--noir)", fontWeight:700, fontSize:15, flexShrink:0 }}>
                  {r.av || r.name?.[0] || "?"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={C.name}>{r.name}</div>
                  <div style={C.date}>{r.date}</div>
                  {r.prodName && <div style={C.prod}>📦 {r.prodName}</div>}
                </div>
                <div style={{ color:"var(--or)", fontSize:16, letterSpacing:1 }}>
                  {"★".repeat(r.r)}
                  <span style={{ color:"var(--gris-2)" }}>{"★".repeat(5 - r.r)}</span>
                </div>
              </div>
              <p style={C.txt}>"{r.txt}"</p>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {!r.approved && (
                  <button className="ab ab-ok" onClick={() => approve(r)}>✅ Approuver et publier</button>
                )}
                {r.approved && (
                  <button className="ab" style={{ background:"rgba(212,175,55,.1)", color:"var(--or)", border:"1px solid var(--or-bd)" }} onClick={() => depublish(r)}>
                    🔒 Depublier
                  </button>
                )}
                <button className="ab ab-dl" onClick={() => remove(r)}>🗑 Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      }
    </>
  );
}

// ─── ADMINS ──────────────────────────────────────────────────────
function AAdmins({ user, showT }) {
  const [adms, setAdms] = useState([
    { id:"Bilalboss1", name:"Bilal",   role:"superadmin", st:"actif", pw:"Bonjour123." },
    { id:"Admin1",     name:"Admin 1", role:"admin",      st:"actif", pw:"Bonjour123." },
    { id:"Admin2",     name:"Admin 2", role:"admin",      st:"actif", pw:"Bonsoir1234." },
  ]);
  const [form, setForm] = useState(false);
  const [edit, setEdit] = useState(null);
  const [na, setNA] = useState({ id:"", name:"", pw:"", role:"admin" });
  const [showPw, setShowPw] = useState({});

  const save = () => {
    if (!na.name.trim()||!na.id.trim()||!na.pw.trim()) { showT("Remplissez tous les champs", true); return; }
    if (na.pw.length < 6) { showT("Mot de passe trop court (min. 6 car.)", true); return; }
    if (!edit && adms.find(a=>a.id===na.id)) { showT("Identifiant deja utilise", true); return; }
    if (edit) { setAdms(p=>p.map(a=>a.id===edit.id?{...a,...na}:a)); showT("Compte modifie"); }
    else { setAdms(p=>[...p,{...na,st:"actif"}]); showT("Compte cree"); }
    setForm(false); setEdit(null); setNA({id:"",name:"",pw:"",role:"admin"});
  };

  return (
    <>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div><div className="admin-title">Gestion Admins</div><div className="admin-sub">{adms.length} compte(s)</div></div>
        <button className="btn-p btn-sm" onClick={()=>{setNA({id:"",name:"",pw:"",role:"admin"});setEdit(null);setForm(f=>!f);}}>+ Nouveau compte</button>
      </div>
      {form && (
        <div className="table-wrap" style={{padding:16,marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:13,color:"var(--tx)"}}>{edit?"Modifier":"Nouveau compte"}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(170px,100%),1fr))",gap:10}}>
            <div className="fg"><label className="fl">Nom *</label><input className="fi" value={na.name} onChange={e=>setNA({...na,name:e.target.value})} placeholder="Ex: Marie Konan"/></div>
            <div className="fg"><label className="fl">ID *</label><input className="fi" value={na.id} onChange={e=>setNA({...na,id:e.target.value})} placeholder="Ex: Admin3" disabled={!!edit} style={{opacity:edit?.5:1}}/></div>
            <div className="fg">
              <label className="fl">Mot de passe *</label>
              <div style={{position:"relative"}}>
                <input className="fi" type={showPw.new?"text":"password"} value={na.pw} onChange={e=>setNA({...na,pw:e.target.value})} placeholder="Min. 6 car." style={{paddingRight:36}}/>
                <button onClick={()=>setShowPw(p=>({...p,new:!p.new}))} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:13,color:"var(--mt)"}}>{showPw.new?"🙈":"👁"}</button>
              </div>
            </div>
            <div className="fg">
              <label className="fl">Role</label>
              <select className="fi" value={na.role} onChange={e=>setNA({...na,role:e.target.value})}>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button className="btn-p btn-sm" onClick={save}>✅ {edit?"Enregistrer":"Creer"}</button>
            <button className="btn-s btn-sm" onClick={()=>{setForm(false);setEdit(null);}}>Annuler</button>
          </div>
        </div>
      )}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Nom</th><th>ID / MDP</th><th>Role</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {adms.map((a,i)=>(
              <tr key={i}>
                <td style={{fontWeight:600,color:"var(--tx)"}}>{a.name}</td>
                <td>
                  <div style={{fontFamily:"monospace",fontSize:10,color:"var(--mt)"}}>{a.id}</div>
                  <div style={{fontSize:10,display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                    <span>{showPw[i]?a.pw:"••••••"}</span>
                    <button onClick={()=>setShowPw(p=>({...p,[i]:!p[i]}))} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"var(--mt)",padding:0}}>{showPw[i]?"🙈":"👁"}</button>
                  </div>
                </td>
                <td><span className={"sbg "+(a.role==="superadmin"?"sbg-p":"sbg-b")}>{a.role==="superadmin"?"👑 Super":"🔧 Admin"}</span></td>
                <td><span className={"sbg "+(a.st==="actif"?"sbg-g":"sbg-r")}>● {a.st}</span></td>
                <td>
                  {a.role !== "superadmin" ? (
                    <div style={{display:"flex",gap:4}}>
                      <button className="ab ab-ed" onClick={()=>{setNA({id:a.id,name:a.name,pw:a.pw,role:a.role});setEdit(a);setForm(true);}}>✏️</button>
                      <button className="ab ab-dl" onClick={()=>{setAdms(p=>p.map((x,j)=>j===i?{...x,st:x.st==="actif"?"bloque":"actif"}:x));showT("Statut modifie");}}>{a.st==="actif"?"🔒":"✅"}</button>
                      <button className="ab ab-dl" onClick={()=>{if(window.confirm("Supprimer ?"))setAdms(p=>p.filter((_,j)=>j!==i));}}>🗑</button>
                    </div>
                  ) : <span style={{fontSize:10,color:"var(--mt)"}}>Protege</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────
function ASettings({ showT }) {
  const [s, setS] = useState({ nom:BOUTIQUE.name, tel1:BOUTIQUE.tel1, tel2:BOUTIQUE.tel2, email:BOUTIQUE.email, lieu:BOUTIQUE.lieu, wa:BOUTIQUE.wa });
  return (
    <>
      <div className="admin-title">Parametres</div>
      <div className="admin-sub">Informations de la boutique</div>
      <div className="table-wrap" style={{padding:16}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(200px,100%),1fr))",gap:10}}>
          {[["Nom","nom"],["Tel. 1","tel1"],["Tel. 2","tel2"],["Email","email"],["Lieu","lieu"],["WhatsApp","wa"]].map(([l,k])=>(
            <div key={k} className="fg"><label className="fl">{l}</label><input className="fi" value={s[k]} onChange={e=>setS({...s,[k]:e.target.value})}/></div>
          ))}
        </div>
        <button className="btn-p btn-sm" style={{marginTop:12}} onClick={()=>showT("Parametres sauvegardes")}>Sauvegarder</button>
      </div>
    </>
  );
}

// ─── SECURITY ────────────────────────────────────────────────────
function ASecurity() {
  const logs = [
    { time:"Aujourd'hui 14:32", user:"Bilal (Super Admin)", action:"Connexion reussie" },
    { time:"Aujourd'hui 11:15", user:"Admin 1",             action:"Produit ajoute" },
    { time:"Hier 16:44",        user:"Admin 2",             action:"Commande validee" },
    { time:"Hier 09:20",        user:"Inconnu",             action:"Tentative echouee" },
  ];
  return (
    <>
      <div className="admin-title">Securite</div>
      <div className="admin-sub">Journal des activites</div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Heure</th><th>Utilisateur</th><th>Action</th></tr></thead>
          <tbody>
            {logs.map((l,i)=>(
              <tr key={i}>
                <td style={{color:"var(--mt)",fontSize:10}}>{l.time}</td>
                <td style={{fontWeight:600}}>{l.user}</td>
                <td style={{color:l.action.includes("echec")?"var(--rd)":"var(--mt)"}}>{l.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── ADMIN DASHBOARD (MAIN) ───────────────────────────────────────
export default function AdminDashboard({ user, onLogout, products, setProducts, orders, setOrders, reviews, setReviews, fb }) {
  const [tab, setTab]   = useState("dashboard");
  const [mobSB, setMSB] = useState(false);
  const [showN, setShowN] = useState(false);
  const [toast, showT]  = useToast();
  const { notifs, unread, addNotif, markRead, clearAll } = useNotifications();

  const prevOrd = useRef(orders.length);
  const prevRev = useRef(reviews.length);

  useEffect(() => {
    if (orders.length > prevOrd.current) {
      addNotif("Nouvelle commande de " + (orders[0]?.client || "Client") + " — " + fmt(orders[0]?.amount || 0), "order");
    }
    prevOrd.current = orders.length;
  }, [orders.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (reviews.length > prevRev.current) {
      addNotif("Nouvel avis de " + (reviews[reviews.length-1]?.name || "Client") + " — En attente", "review");
    }
    prevRev.current = reviews.length;
  }, [reviews.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSuper = user.role === "superadmin";
  const NAV = [
    { id:"dashboard", icon:"📊", label:"Dashboard"      },
    { id:"products",  icon:"📦", label:"Produits"       },
    { id:"orders",    icon:"🛒", label:"Commandes"      },
    { id:"stock",     icon:"📈", label:"Stock"          },
    { id:"inventory", icon:"🗂", label:"Inventaire"     },
    { id:"ventes",    icon:"💰", label:"Ventes/Periode" },
    { id:"stats",     icon:"📉", label:"Statistiques"   },
    { id:"reviews",   icon:"⭐", label:"Avis clients"   },
    ...(isSuper ? [
      { id:"admins",   icon:"👥", label:"Admins"   },
      { id:"settings", icon:"⚙️", label:"Parametres"},
      { id:"security", icon:"🔒", label:"Securite" },
    ] : []),
  ];

  const pendingOrders  = orders.filter(o => o.status === "En attente").length;
  const pendingReviews = reviews.filter(r => !r.approved).length;

  return (
    <div className="admin-wrap">
      {/* Backdrop mobile */}
      <div className={"sb-bd" + (mobSB ? " open" : "")} onClick={() => setMSB(false)} />

      {/* Sidebar */}
      <div className={"admin-sb" + (mobSB ? " open" : "")}>
        <div className="admin-logo">
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:34,height:34,background:"#fff",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",padding:3,flexShrink:0 }}>
              <img src={LOGO} alt="logo" style={{ width:"100%",height:"100%",objectFit:"contain" }} />
            </div>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif",fontSize:12,fontWeight:700,color:"#fff",lineHeight:1.1 }}>Baark Wende</div>
              <div style={{ fontSize:9,color:"rgba(255,255,255,.6)",letterSpacing:1 }}>ADMIN</div>
            </div>
          </div>
        </div>
        <div className="admin-user">
          <div className="admin-uname">{user.name}</div>
          <span style={{ fontSize:9,background:"rgba(255,255,255,.2)",color:"#fff",borderRadius:100,padding:"2px 8px",fontWeight:600 }}>
            {user.role === "superadmin" ? "👑 Super Admin" : "🔧 Admin"}
          </span>
        </div>
        <div className="admin-nav">
          {NAV.map(n => (
            <button key={n.id} className={"admin-nav-btn" + (tab === n.id ? " active" : "")} onClick={() => { setTab(n.id); setMSB(false); }}>
              <span>{n.icon}</span><span>{n.label}</span>
              {n.id === "orders"  && pendingOrders  > 0 && <span style={{ marginLeft:"auto",background:"var(--rd)",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>{pendingOrders}</span>}
              {n.id === "reviews" && pendingReviews > 0 && <span style={{ marginLeft:"auto",background:"var(--or)",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>{pendingReviews}</span>}
            </button>
          ))}
          <button className="admin-nav-btn danger" style={{ marginTop:16 }} onClick={onLogout}><span>🚪</span><span>Deconnexion</span></button>
        </div>
      </div>

      {/* Main */}
      <div className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button className="ham-btn" onClick={() => setMSB(o => !o)}>☰</button>
            <div>
              <div style={{ fontWeight:600, fontSize:13, color:"var(--tx)" }}>
                {NAV.find(n => n.id === tab)?.icon} {NAV.find(n => n.id === tab)?.label}
              </div>
              <div style={{ fontSize:10, color:"var(--mt)" }}>Baark Wende Store</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <NotifBell unread={unread} onClick={() => setShowN(o => !o)} />
            {showN && <NotifPanel notifs={notifs} onClose={() => setShowN(false)} onMarkRead={markRead} onClear={clearAll} />}
            <div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,var(--g),var(--pk))",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14 }}>
              {user.name[0]}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content">
          {tab === "dashboard" && (
            <>
              <div className="admin-title">Dashboard</div>
              <div className="admin-sub">Bienvenue, {user.name} !</div>
              <div className="stat-grid">
                {[{icon:"🛒",l:"Commandes",v:orders.length},{icon:"📦",l:"Produits",v:products.length},{icon:"✅",l:"Livrees",v:orders.filter(o=>o.status==="Livre").length},{icon:"⏳",l:"En attente",v:pendingOrders}].map((s,i)=>(
                  <div key={i} className="stat-card"><div className="stat-icon">{s.icon}</div><div className="stat-lbl">{s.l}</div><div className="stat-val">{s.v}</div></div>
                ))}
              </div>
              <div className="table-wrap">
                <div className="table-bar"><span style={{fontWeight:600,color:"var(--tx)"}}>Dernieres commandes</span></div>
                <table>
                  <thead><tr><th>ID</th><th>Client</th><th>Produit</th><th>Montant</th><th>Statut</th></tr></thead>
                  <tbody>{orders.slice(0,5).map(o=>(
                    <tr key={o.id}>
                      <td style={{fontFamily:"monospace",fontSize:10,color:"var(--g)"}}>{o.id}</td>
                      <td style={{fontWeight:600}}>{o.client}</td>
                      <td style={{color:"var(--mt)",fontSize:11}}>{o.product}</td>
                      <td style={{fontWeight:700,color:"var(--g)"}}>{fmt(o.amount)}</td>
                      <td><StatusBadge status={o.status}/></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          )}
          {tab === "products"  && <AProds     products={products} setProducts={setProducts} showT={showT} />}
          {tab === "orders"    && <AOrders    orders={orders}     setOrders={setOrders}     showT={showT} />}
          {tab === "stock"     && <AStock     products={products} setProducts={setProducts} />}
          {tab === "inventory" && <AInventory products={products} />}
          {tab === "ventes"    && <AVentes    orders={orders} />}
          {tab === "stats"     && <AStats     products={products} orders={orders} />}
          {tab === "reviews"   && <AReviews   reviews={reviews}   setReviews={setReviews}   showT={showT} fb={fb} />}
          {tab === "admins"    && isSuper && <AAdmins   user={user} showT={showT} />}
          {tab === "settings"  && isSuper && <ASettings showT={showT} />}
          {tab === "security"  && isSuper && <ASecurity />}
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
