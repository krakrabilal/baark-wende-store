// src/App.js — Avec Firebase
import { useState, useEffect } from "react";
import "./styles/global.css";
import { INIT_PRODS, INIT_ORDERS, INIT_REVIEWS } from "./data/constants";
import ClientStore    from "./features/client/ClientStore";
import Login          from "./features/client/Login";
import AdminDashboard from "./features/admin/AdminDashboard";
import {
  listenProducts, listenOrders, listenReviews,
  addOrder, addProduct, updateProduct, deleteProduct,
  updateOrderStatus, addReview, updateReview, deleteReview,
} from "./firebase";

export default function App() {
  // Persist admin session across refreshes
  const savedView = localStorage.getItem("bws_view") || "client";
  const savedUser = (() => { try { return JSON.parse(localStorage.getItem("bws_user")); } catch(e) { return null; } })();
  const [view, setView_] = useState(savedUser ? savedView : "client");
  const [user, setUser_] = useState(savedUser);

  const setView = (v) => { setView_(v); localStorage.setItem("bws_view", v); };
  const setUser = (u) => { setUser_(u); if (u) localStorage.setItem("bws_user", JSON.stringify(u)); else localStorage.removeItem("bws_user"); };
  const [products, setProducts] = useState(INIT_PRODS);
  const [orders,   setOrders]   = useState(INIT_ORDERS);
  const [reviews,  setReviews]  = useState(INIT_REVIEWS);
  const [logo,     setLogo]     = useState(null); // logo personnalise superadmin
  const [ready,    setReady]    = useState(false);

  // Recalcule les stats produit (r, rv) apres chaque changement d'avis
  const setReviewsAndSync = (updater) => {
    setReviews(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      // Mettre a jour les stats de chaque produit
      setProducts(prods => prods.map(p => {
        const approved = next.filter(r => r.approved && r.prodId === p.id);
        if (approved.length === 0) return p;
        const avg = approved.reduce((s, r) => s + r.r, 0) / approved.length;
        return { ...p, r: Math.round(avg * 10) / 10, rv: approved.length };
      }));
      return next;
    });
  };

  useEffect(() => {
    const unP = listenProducts(data => {
      // Firebase est la source de verite
      // Si Firebase a des donnees, on les utilise
      // Sinon on garde les donnees initiales (INIT_PRODS)
      if (data.length > 0) {
        setProducts(data);
      }
      setReady(true);
    });
    const unO = listenOrders(data => {
      if (data.length > 0) setOrders(data);
    });
    const unR = listenReviews(data => {
      if (data.length > 0) setReviews(data);
      else setReady(true);
    });
    return () => { unP(); unO(); unR(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Firebase actions — passées en props pour que les composants restent "purs"
  const fbActions = {
    addOrder:          (o)     => addOrder(o).catch(() => {}),
    addProduct:        (p)     => addProduct(p).catch(() => {}),
    updateProduct:     (id, d) => updateProduct(id, d).catch(() => {}),
    deleteProduct:     (id)    => deleteProduct(id).catch(() => {}),
    updateOrderStatus: (id, s) => updateOrderStatus(id, s).catch(() => {}),
    addReview:         (r)     => addReview(r).catch(() => {}),
    updateReview:      (id, d) => updateReview(id, d).catch(() => {}),
    deleteReview:      (id)    => deleteReview(id).catch(() => {}),
  };

  if (!ready) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#050505", gap:18 }}>
      <div style={{ width:48, height:48, border:"2px solid #2A2A2A", borderTop:"2px solid #D4AF37", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      <div style={{ color:"#6B6B6B", fontSize:12, fontFamily:"Montserrat,sans-serif", letterSpacing:"3px", textTransform:"uppercase" }}>Chargement...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      {view === "client" && (
        <ClientStore
          products={products}
          orders={orders}
          setOrders={setOrders}
          reviews={reviews}
          setReviews={setReviews}
          onAdmin={() => setView("login")}
          fb={fbActions}
        />
      )}
      {view === "login" && (
        <Login onLogin={u => { setUser(u); setView("admin"); }} />
      )}
      {view === "admin" && user && (
        <AdminDashboard
          user={user}
          onLogout={() => { setUser(null); setView("client"); }}
          products={products}
          setProducts={setProducts}
          orders={orders}
          setOrders={setOrders}
          reviews={reviews}
          setReviews={setReviewsAndSync}
          fb={fbActions}
          logo={logo}
          setLogo={setLogo}
        />
      )}
    </>
  );
}
