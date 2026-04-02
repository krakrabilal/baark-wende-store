// src/features/client/Login.jsx
import { useState } from "react";
import { LOGO, ACCOUNTS } from "../../data/constants";

export default function Login({ onLogin }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);

  const submit = () => {
    const acc = ACCOUNTS.find(a => a.id === id && a.pw === pw);
    if (acc) { onLogin(acc); }
    else { setErr("Identifiant ou mot de passe incorrect."); }
  };

  const onKey = (e) => { if (e.key === "Enter") submit(); };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <img src={LOGO} alt="logo" style={{ width: 60, height: 60, margin: "0 auto 10px", objectFit: "contain" }} />
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "var(--tx)" }}>Espace Admin</div>
          <div style={{ fontSize: 11, color: "var(--mt)", marginTop: 3 }}>Baark Wende Store</div>
        </div>

        {err && <div className="login-error">⚠️ {err}</div>}

        <div className="fg">
          <label className="fl">Identifiant</label>
          <input className="fi" placeholder="Ex: Bilalboss1" value={id} onChange={e => { setId(e.target.value); setErr(""); }} onKeyDown={onKey} />
        </div>
        <div className="fg">
          <label className="fl">Mot de passe</label>
          <div style={{ position: "relative" }}>
            <input
              className="fi"
              type={show ? "text" : "password"}
              placeholder="••••••••"
              value={pw}
              onChange={e => { setPw(e.target.value); setErr(""); }}
              onKeyDown={onKey}
              style={{ paddingRight: 40 }}
            />
            <button
              onClick={() => setShow(s => !s)}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--mt)" }}
            >
              {show ? "🙈" : "👁"}
            </button>
          </div>
        </div>

        <button className="btn-p" style={{ width: "100%", padding: 12, marginTop: 4 }} onClick={submit}>
          🔐 Connexion
        </button>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: "var(--mt)" }}>
          Acces reserve au personnel autorise
        </div>
      </div>
    </div>
  );
}
