import { useState, useEffect, useRef } from "react";
import {
  listenProducts, listenOrders, listenReviews,
  addProduct, updateProduct, deleteProduct,
  addOrder, updateOrderStatus, deleteReview,
  uploadPhoto
} from "./firebase";

/* ═══════════════════════════════════════════
   COMPTES
═══════════════════════════════════════════ */
const ACCOUNTS = [
  { id:"Bilalboss1", pw:"Bonjour123.", name:"Bilal",   role:"superadmin" },
  { id:"Admin1",     pw:"Bonjour123.", name:"Admin 1", role:"admin" },
  { id:"Admin2",     pw:"Bonsoir1234.",name:"Admin 2", role:"admin" },
];

/* ═══════════════════════════════════════════
   DONNÉES
═══════════════════════════════════════════ */
const INIT_PRODS = [
  {id:1, name:"Montre Rolex Submariner",  cat:"Montres",    price:850000,  old:1100000, stock:5,  r:4.8,rv:24,img:"⌚",badge:"Populaire", desc:"Montre de luxe suisse, étanche 300m, cadran noir, bracelet Oyster.", photos:[]},
  {id:2, name:"iPhone 15 Pro Max",        cat:"Téléphones", price:650000,  old:720000,  stock:12, r:4.9,rv:41,img:"📱",badge:"Nouveau",   desc:"Apple A17 Pro, 48MP, Dynamic Island, USB-C, 256Go, Titanium.", photos:[]},
  {id:3, name:"BMW X5 2023",              cat:"Voitures",   price:35000000,old:null,    stock:2,  r:4.7,rv:8, img:"🚗",badge:"Premium",   desc:"SUV luxe, 3.0L turbo, 7 places, toit panoramique, cuir Nappa.", photos:[]},
  {id:4, name:"Veste Bogolan Africaine",  cat:"Vêtements",  price:45000,   old:60000,   stock:30, r:4.6,rv:19,img:"👔",badge:"Exclusif",  desc:"Veste artisanale tissu Bogolan du Mali, coupe moderne M-XXL.", photos:[]},
  {id:5, name:"Samsung Galaxy S24 Ultra", cat:"Téléphones", price:580000,  old:620000,  stock:8,  r:4.7,rv:33,img:"📱",badge:null,        desc:"Snapdragon 8 Gen 3, S Pen, 200MP, 6.8\" AMOLED, 512Go.", photos:[]},
  {id:6, name:"Montre Hublot Big Bang",   cat:"Montres",    price:1200000, old:null,    stock:3,  r:5.0,rv:11,img:"⌚",badge:"Luxe",      desc:"Boîtier titane 44mm, mouvement automatique UNICO.", photos:[]},
  {id:7, name:"Toyota Camry 2022",        cat:"Voitures",   price:18500000,old:20000000,stock:4,  r:4.5,rv:15,img:"🚗",badge:null,        desc:"Berline hybride 2.5L, 7 airbags, Apple CarPlay, garantie 3 ans.", photos:[]},
  {id:8, name:"Sneakers Kente Edition",   cat:"Vêtements",  price:55000,   old:70000,   stock:20, r:4.4,rv:27,img:"👟",badge:"Tendance",  desc:"Sneakers inspirées tissu Kente ghanéen, semelle Air, 38-45.", photos:[]},
  {id:9, name:"Casque Sony WH-1000XM5",  cat:"Autres",     price:195000,  old:230000,  stock:15, r:4.8,rv:38,img:"🎧",badge:null,        desc:"Réduction bruit active, 30h autonomie, Bluetooth 5.2.", photos:[]},
  {id:10,name:"Montre Cartier Tank",      cat:"Montres",    price:2800000, old:null,    stock:2,  r:5.0,rv:6, img:"⌚",badge:"Rare",      desc:"Tank Must XL, quartz, boîtier acier PVD or, cuir bordeaux.", photos:[]},
  {id:11,name:"iPad Pro M2",              cat:"Téléphones", price:480000,  old:530000,  stock:9,  r:4.8,rv:22,img:"💻",badge:null,        desc:"12.9\", M2, Liquid Retina XDR, 5G, 256Go.", photos:[]},
  {id:12,name:"Boubou Brodé Luxe",        cat:"Vêtements",  price:85000,   old:110000,  stock:25, r:4.9,rv:44,img:"👘",badge:"Best-seller",desc:"Grand bazin riche, broderies dorées artisanales, 8 couleurs.", photos:[]},
];

const INIT_ORDERS = [
  {id:"BWS-001",client:"Konan Aya",      phone:"07 11 22 33",product:"iPhone 15 Pro Max",  amount:650000, status:"Livré",      date:"15/03/2025",lieu:"Cocody"},
  {id:"BWS-002",client:"Traoré Moussa", phone:"05 22 33 44",product:"Montre Hublot",       amount:1200000,status:"En cours",   date:"20/03/2025",lieu:"Yopougon"},
  {id:"BWS-003",client:"Coulibaly F.",  phone:"01 33 44 55",product:"Boubou Brodé",        amount:85000,  status:"En attente", date:"22/03/2025",lieu:"Adjamé"},
  {id:"BWS-004",client:"Bamba Ibrahim", phone:"07 44 55 66",product:"Samsung Galaxy S24",  amount:580000, status:"Annulé",     date:"23/03/2025",lieu:"Marcory"},
  {id:"BWS-005",client:"Diallo Aminata",phone:"05 55 66 77",product:"Sneakers Kente",      amount:55000,  status:"Livré",      date:"24/03/2025",lieu:"Plateau"},
];

const CATS = ["Tous","Montres","Téléphones","Voitures","Vêtements","Autres"];
const STATUSES = ["En attente","En cours","Livré","Annulé"];
const fmt  = n => new Intl.NumberFormat("fr-CI").format(n)+" FCFA";
const star = r => "★".repeat(Math.floor(r))+"☆".repeat(5-Math.floor(r));
const nid  = () => "BWS-"+Math.random().toString(36).slice(2,6).toUpperCase();
const LOGO="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Ccircle cx='50' cy='50' r='50' fill='%230D0A14'/%3E%3Cpath d='M25 35h8l10 24h22l8-20H33' stroke='url(%23g1)' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='42' cy='68' r='4' fill='%23EC4899'/%3E%3Ccircle cx='58' cy='68' r='4' fill='%23EC4899'/%3E%3Cpath d='M38 48h26M34 42h30' stroke='%238B5CF6' stroke-width='3' stroke-linecap='round'/%3E%3Cdefs%3E%3ClinearGradient id='g1' x1='25' y1='35' x2='75' y2='60' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%238B5CF6'/%3E%3Cstop offset='1' stop-color='%23EC4899'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E";


/* ═══════════════════════════════════════════
   CSS GLOBAL
═══════════════════════════════════════════ */
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
:root{
  --g:#8B5CF6;--gd:#6D28D9;--gl:rgba(139,92,246,.14);--pk:#EC4899;--pkd:#BE185D;
  --bk:#0D0A14;--dk:#130E1E;--cd:#1C1528;--c2:#251D35;
  --br:#2D2040;--tx:#F3F0FF;--mt:#9B8EC0;
  --gn:#10B981;--rd:#EF4444;--or:#F59E0B;--bl:#3B82F6;
  --r:12px;--sh:0 8px 32px rgba(0,0,0,.6);
}
*{margin:0;padding:0;box-sizing:border-box}
html{font-size:16px}
body{font-family:'DM Sans',sans-serif;background:var(--bk);color:var(--tx);overflow-x:hidden;-webkit-text-size-adjust:100%}
img{max-width:100%;display:block}
button{cursor:pointer}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:var(--dk)}
::-webkit-scrollbar-thumb{background:var(--gd);border-radius:2px}

/* NAV */
.nb{position:fixed;top:0;left:0;right:0;z-index:900;background:rgba(10,10,10,.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--br);display:flex;align-items:center;justify-content:space-between;padding:0 16px;height:60px;gap:8px}
.br{display:flex;align-items:center;gap:9px;cursor:pointer;user-select:none;flex-shrink:0}
.bl{width:34px;height:34px;background:linear-gradient(135deg,var(--g),var(--pk));border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px}
.bn{font-family:'Playfair Display',serif;font-size:14px;font-weight:700;line-height:1.1}
.bs{font-size:8px;color:var(--g);text-transform:uppercase;letter-spacing:2px}
.nls{display:flex;gap:2px}
@media(max-width:520px){.nls{display:none}}
.nl{background:none;border:none;color:var(--mt);font-family:'DM Sans',sans-serif;font-size:13px;padding:6px 12px;border-radius:7px;transition:.2s}
.nl:hover,.nl.on{color:var(--g);background:var(--gl)}
.nr{display:flex;align-items:center;gap:6px}
.nb-btn{background:none;border:1px solid var(--br);color:var(--tx);border-radius:7px;padding:6px 11px;font-family:'DM Sans',sans-serif;font-size:12px;transition:.2s;position:relative;white-space:nowrap}
.nb-btn:hover{border-color:var(--g);color:var(--g)}
.cbg{position:absolute;top:-5px;right:-5px;background:var(--rd);color:#fff;width:16px;height:16px;border-radius:50%;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center}

/* HERO */
.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:80px 16px 50px;background:radial-gradient(ellipse at 20% 50%,rgba(139,92,246,.18),transparent 55%),radial-gradient(ellipse at 80% 20%,rgba(236,72,153,.12),transparent 50%),radial-gradient(ellipse at 60% 90%,rgba(109,40,217,.1),transparent 50%),var(--dk);position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%238B5CF6' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")}
.hi{position:relative;z-index:1;width:100%;max-width:640px}
.htag{display:inline-flex;align-items:center;gap:7px;background:rgba(139,92,246,.13);border:1px solid rgba(139,92,246,.3);color:var(--g);padding:5px 14px;border-radius:100px;font-size:10px;letter-spacing:1px;text-transform:uppercase;margin-bottom:20px}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(34px,9vw,80px);font-weight:900;line-height:1.05;margin-bottom:14px;background:linear-gradient(135deg,#fff 30%,var(--g) 70%,var(--pk) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero p{font-size:clamp(13px,3vw,15px);color:var(--mt);max-width:480px;margin:0 auto 28px;line-height:1.8}
.cta{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.bg{background:linear-gradient(135deg,var(--g),var(--pk));color:#fff;border:none;padding:11px 24px;border-radius:9px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:13px;transition:.3s}
.bg:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(139,92,246,.5)}
.bo{background:transparent;color:var(--tx);border:1px solid var(--br);padding:11px 24px;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:13px;transition:.2s}
.bo:hover{border-color:var(--g);color:var(--g)}
.hst{display:flex;gap:clamp(20px,5vw,40px);justify-content:center;margin-top:44px;flex-wrap:wrap}
.hn{font-family:'Playfair Display',serif;font-size:clamp(24px,5vw,32px);font-weight:700;color:var(--g);display:block}
.hl{font-size:10px;color:var(--mt);text-transform:uppercase;letter-spacing:1px}

/* SECTIONS */
.sec{padding:clamp(40px,8vw,70px) 16px;max-width:1260px;margin:0 auto}
.sh{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:10px}
.st{font-family:'Playfair Display',serif;font-size:clamp(22px,4vw,32px);font-weight:700}
.st span{color:var(--g)}
.ss{font-size:12px;color:var(--mt);margin-top:4px}
.sa{background:none;border:1px solid var(--br);color:var(--mt);padding:6px 14px;border-radius:7px;font-size:11px;font-family:'DM Sans',sans-serif;transition:.2s}
.sa:hover{border-color:var(--g);color:var(--g)}
.div{height:1px;background:var(--br);margin:0 16px}

/* SEARCH / CATS */
.sw{position:relative;margin-bottom:18px}
.si{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--mt);font-size:14px}
.sinp{width:100%;background:var(--cd);border:1px solid var(--br);color:var(--tx);padding:11px 14px 11px 42px;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:13px;outline:none;transition:.2s}
.sinp:focus{border-color:var(--g)}
.cts{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px}
.cb{background:var(--cd);border:1px solid var(--br);color:var(--mt);padding:7px 14px;border-radius:100px;font-size:11px;font-family:'DM Sans',sans-serif;transition:.2s}
.cb:hover,.cb.on{background:var(--g);border-color:var(--g);color:var(--bk);font-weight:600}

/* PRODUCT GRID */
.pg{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(160px,45vw),1fr));gap:clamp(10px,2vw,16px)}
.pc{background:var(--cd);border:1px solid var(--br);border-radius:var(--r);overflow:hidden;transition:.3s;position:relative}
.pc:hover{border-color:var(--g);transform:translateY(-3px);box-shadow:var(--sh)}
.pi{height:clamp(130px,25vw,170px);display:flex;align-items:center;justify-content:center;font-size:clamp(50px,12vw,66px);background:var(--c2);position:relative;overflow:hidden}
.pi img{width:100%;height:100%;object-fit:cover}
.pb2{position:absolute;top:8px;left:8px;background:linear-gradient(135deg,var(--g),var(--pk));color:#fff;font-size:9px;font-weight:700;padding:3px 8px;border-radius:100px}
.pb{padding:11px}
.pc2{font-size:9px;color:var(--g);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.pn{font-family:'Playfair Display',serif;font-size:clamp(12px,2.5vw,13px);font-weight:700;margin-bottom:6px;line-height:1.3}
.ps{color:var(--g);font-size:10px;margin-bottom:7px}
.pp{font-size:clamp(12px,2.5vw,14px);font-weight:700;color:var(--g);margin-bottom:10px}
.po{font-size:10px;color:var(--mt);text-decoration:line-through;margin-left:5px;font-weight:400}
.pf{display:flex;gap:6px}
.ba{flex:1;background:linear-gradient(135deg,var(--g),var(--pk));border:none;color:#fff;padding:8px 6px;border-radius:7px;font-weight:700;font-size:11px;font-family:'DM Sans',sans-serif}
.be{background:var(--c2);border:1px solid var(--br);color:var(--mt);width:32px;border-radius:7px;font-size:12px;transition:.2s}
.be:hover{color:var(--g);border-color:var(--g)}

/* MODAL */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:2000;display:flex;align-items:flex-end;justify-content:center;padding:0;backdrop-filter:blur(5px)}
@media(min-width:600px){.ov{align-items:center;padding:14px}}
.md{background:var(--dk);border:1px solid var(--br);width:100%;max-width:640px;max-height:92vh;overflow-y:auto;border-radius:16px 16px 0 0}
@media(min-width:600px){.md{border-radius:16px;max-height:88vh}}
.mh{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--br);position:sticky;top:0;background:var(--dk);z-index:1}
.mt2{font-family:'Playfair Display',serif;font-size:16px;font-weight:700}
.mc{background:var(--cd);border:none;color:var(--mt);padding:5px 10px;border-radius:7px;font-size:12px;font-family:'DM Sans',sans-serif}
.mb{padding:18px}
.mib{height:200px;background:var(--c2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:80px;margin-bottom:14px;overflow:hidden}
.mib img{width:100%;height:100%;object-fit:cover}

/* GALERIE */
.gm{position:relative;height:clamp(180px,45vw,220px);border-radius:10px;overflow:hidden;background:var(--c2);margin-bottom:8px}
.gm img{width:100%;height:100%;object-fit:cover}
.ga{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.65);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:16px;display:flex;align-items:center;justify-content:center;transition:.2s}
.ga:hover{background:var(--g);color:var(--bk)}
.gd2{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:5px}
.gdt{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.3);transition:.2s}
.gdt.on{background:var(--g)}
.gth{display:flex;gap:6px;margin-bottom:12px;overflow-x:auto;padding-bottom:4px}
.gthi{width:52px;height:52px;border-radius:7px;overflow:hidden;border:2px solid transparent;flex-shrink:0;background:var(--c2)}
.gthi.on{border-color:var(--g)}
.gthi img{width:100%;height:100%;object-fit:cover}

/* ORDER OPTIONS */
.oo{background:var(--c2);border-radius:10px;padding:13px;margin-top:4px}
.ob{display:flex;align-items:center;gap:11px;width:100%;text-align:left;border-radius:8px;padding:12px 13px;margin-bottom:8px;font-family:'DM Sans',sans-serif;transition:.2s}
.ob:last-child{margin-bottom:0}
.ob.gld{background:linear-gradient(135deg,var(--g),var(--pk));border:none;color:#fff}
.ob.lne{background:var(--cd);border:1px solid var(--br);color:var(--tx)}
.ob.lne:hover{border-color:var(--g)}
.ot{font-weight:700;font-size:13px;display:block;margin-bottom:1px}
.os{font-size:10px;opacity:.7;display:block}

/* FORM */
.fg2{display:flex;flex-direction:column;gap:4px;margin-bottom:12px}
.fl{font-size:10px;color:var(--mt);text-transform:uppercase;letter-spacing:.7px}
.fi{background:var(--cd);border:1px solid var(--br);color:var(--tx);padding:10px 12px;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:13px;outline:none;width:100%;transition:.2s}
.fi:focus{border-color:var(--g)}
select.fi option{background:var(--dk)}
textarea.fi{resize:vertical;min-height:64px}

/* CART PANEL */
.cp{position:fixed;right:0;top:0;bottom:0;width:min(360px,100vw);background:var(--dk);border-left:1px solid var(--br);z-index:1500;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .32s cubic-bezier(.4,0,.2,1)}
.cp.on{transform:none}
.cb2{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1400}
.cb2.on{display:block}
.ch{padding:14px 18px;border-bottom:1px solid var(--br);display:flex;justify-content:space-between;align-items:center}
.cl{flex:1;overflow-y:auto;padding:12px 18px}
.ci{display:flex;gap:10px;align-items:center;padding:11px 0;border-bottom:1px solid var(--br)}
.cii{width:46px;height:46px;background:var(--c2);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;overflow:hidden}
.cii img{width:100%;height:100%;object-fit:cover}
.cn{font-size:11px;font-weight:600;margin-bottom:2px}
.cp2{font-size:11px;color:var(--g);font-weight:700}
.cq{font-size:10px;color:var(--mt)}
.cd2{background:none;border:none;color:var(--mt);font-size:14px;padding:3px}
.cd2:hover{color:var(--rd)}
.ce{text-align:center;padding:44px 0;color:var(--mt)}
.cf{padding:14px 18px;border-top:1px solid var(--br)}
.cr{display:flex;justify-content:space-between;align-items:center;margin-bottom:11px}
.ctlbl{font-size:11px;color:var(--mt)}
.ctval{font-family:'Playfair Display',serif;font-size:19px;font-weight:700;color:var(--g)}

/* REVIEWS */
.rg{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(240px,100%),1fr));gap:13px}
.rc{background:var(--cd);border:1px solid var(--br);border-radius:var(--r);padding:16px}
.rt{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.ra{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--g),var(--pk));display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0}
.rn{font-weight:600;font-size:13px}
.rd{font-size:10px;color:var(--mt)}
.rs{color:var(--g);font-size:11px;margin-bottom:6px}
.rx{font-size:12px;color:var(--mt);line-height:1.7}

/* TOAST */
.tst{position:fixed;bottom:72px;right:16px;background:var(--cd);border:1px solid var(--g);border-radius:10px;background:var(--cd);padding:11px 15px;display:flex;align-items:center;gap:8px;z-index:4000;box-shadow:var(--sh);transform:translateY(10px);opacity:0;transition:.3s;max-width:min(280px,90vw);font-size:12px;pointer-events:none}
.tst.on{transform:none;opacity:1}
.tst.err{border-color:var(--rd)}

/* WA */
.wa{position:fixed;bottom:18px;right:18px;z-index:999;background:#25D366;color:#fff;width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 16px rgba(37,211,102,.45);border:none;transition:.3s}
.wa:hover{transform:scale(1.1)}

/* FOOTER */
footer{background:var(--dk);border-top:1px solid var(--br);padding:clamp(28px,6vw,44px) 16px 20px}
.fg3{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(160px,100%),1fr));gap:clamp(20px,4vw,36px);max-width:1260px;margin:0 auto 32px}
.fbr{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;margin-bottom:8px}
.fd{font-size:11px;color:var(--mt);line-height:1.9;margin-bottom:12px}
.fc{font-size:11px;color:var(--mt);display:flex;flex-direction:column;gap:5px}
.fct{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--g);margin-bottom:12px;font-weight:600}
.fls{display:flex;flex-direction:column;gap:8px}
.flk{font-size:11px;color:var(--mt);transition:.2s}
.flk:hover{color:var(--g)}
.fb2{max-width:1260px;margin:0 auto;padding-top:18px;border-top:1px solid var(--br);display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:10px;color:var(--mt)}

/* LOGIN */
.lw{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,rgba(139,92,246,.15),var(--bk) 70%);padding:16px}
.lc{background:var(--dk);border:1px solid var(--br);border-radius:16px;padding:clamp(24px,5vw,36px) clamp(18px,5vw,28px);width:100%;max-width:400px}
.le{background:rgba(231,76,60,.12);border:1px solid rgba(231,76,60,.3);border-radius:7px;padding:9px 12px;font-size:12px;color:var(--rd);margin-bottom:12px}

/* ADMIN LAYOUT */
.aw{display:flex;min-height:100vh}
.sb{width:220px;background:var(--dk);border-right:1px solid var(--br);position:fixed;top:0;bottom:0;display:flex;flex-direction:column;z-index:500;overflow-y:auto;transition:.3s;overflow-x:hidden}
.sb.hide{width:0}
.sbl{padding:16px;border-bottom:1px solid var(--br);flex-shrink:0}
.sbu{padding:12px 14px;border-bottom:1px solid var(--br);flex-shrink:0}
.ubg{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:100px;font-size:10px;font-weight:700}
.ubg.sup{background:rgba(139,92,246,.2);color:var(--g)}
.ubg.adm{background:rgba(52,152,219,.2);color:var(--bl)}
.sbn{padding:8px 8px;flex:1}
.an{display:flex;align-items:center;gap:8px;padding:9px 11px;border-radius:8px;color:var(--mt);font-size:12px;transition:.2s;margin-bottom:2px;border:none;background:none;width:100%;text-align:left;font-family:'DM Sans',sans-serif;white-space:nowrap}
.an:hover,.an.on{background:var(--gl);color:var(--g)}
.an.dg:hover{background:rgba(231,76,60,.12);color:var(--rd)}
.am{margin-left:220px;flex:1;background:var(--bk);transition:.3s;min-width:0}
.am.full{margin-left:0}
.at{background:var(--dk);border-bottom:1px solid var(--br);padding:12px 18px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:400;flex-wrap:wrap;gap:8px}
.ac{padding:clamp(14px,3vw,22px)}
.atl{font-family:'Playfair Display',serif;font-size:clamp(20px,4vw,24px);font-weight:700;margin-bottom:3px}
.asl{font-size:11px;color:var(--mt);margin-bottom:18px}

/* STAT CARDS */
.sg{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(150px,42vw),1fr));gap:10px;margin-bottom:20px}
.sc{background:var(--cd);border:1px solid var(--br);border-radius:var(--r);padding:16px;position:relative;overflow:hidden}
.sc::before{content:'';position:absolute;top:-16px;right:-16px;width:60px;height:60px;background:linear-gradient(135deg,var(--g),var(--pk));opacity:.07;border-radius:50%}
.si2{font-size:22px;margin-bottom:8px}
.slbl{font-size:10px;color:var(--mt);text-transform:uppercase;letter-spacing:.7px;margin-bottom:3px}
.sv{font-family:'Playfair Display',serif;font-size:clamp(18px,4vw,22px);font-weight:700;color:var(--g);margin-bottom:2px}
.str{font-size:10px;color:var(--gn)}

/* TABLE */
.tw{background:var(--cd);border:1px solid var(--br);border-radius:var(--r);overflow:hidden;overflow-x:auto;margin-bottom:18px;-webkit-overflow-scrolling:touch;max-width:100%}
.tb2{padding:11px 14px;border-bottom:1px solid var(--br);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:7px}
table{width:100%;border-collapse:collapse;min-width:460px}
th{background:var(--c2);padding:9px 12px;font-size:10px;color:var(--mt);text-transform:uppercase;letter-spacing:.6px;text-align:left;white-space:nowrap}
td{padding:11px 12px;font-size:12px;border-bottom:1px solid var(--br)}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(139,92,246,.04)}
.sbg{display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:100px;font-size:10px;font-weight:600;white-space:nowrap}
.s-l{background:rgba(46,204,113,.15);color:var(--gn)}
.s-c{background:rgba(52,152,219,.15);color:var(--bl)}
.s-a{background:rgba(243,156,18,.15);color:var(--or)}
.s-x{background:rgba(231,76,60,.15);color:var(--rd)}
.s-s{background:rgba(201,168,76,.2);color:var(--g)}
.s-d{background:rgba(52,152,219,.2);color:var(--bl)}

/* ACTONS BTNS */
.ab{border:none;padding:4px 9px;border-radius:5px;font-size:10px;font-family:'DM Sans',sans-serif;font-weight:600;transition:.2s}
.ab.ed{background:rgba(52,152,219,.15);color:var(--bl)}
.ab.ed:hover{background:rgba(52,152,219,.3)}
.ab.dl{background:rgba(231,76,60,.15);color:var(--rd)}
.ab.dl:hover{background:rgba(231,76,60,.3)}
.ab.ok{background:rgba(46,204,113,.15);color:var(--gn)}
.ab.ok:hover{background:rgba(46,204,113,.3)}

/* PHOTO UPLOAD */
.phs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}
.ph{aspect-ratio:1;border:2px dashed var(--br);border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;background:var(--c2);transition:.2s}
.ph:hover{border-color:var(--pk)}
.ph.on{border-style:solid;border-color:var(--g)}
.ph img{width:100%;height:100%;object-fit:cover}
.ph input[type=file]{position:absolute;inset:0;opacity:0;width:100%;height:100%}
.ph-lbl{font-size:10px;color:var(--mt);margin-top:4px;pointer-events:none;text-align:center}
.ph-rm{position:absolute;top:3px;right:3px;background:var(--rd);border:none;color:#fff;width:18px;height:18px;border-radius:50%;font-size:9px;display:flex;align-items:center;justify-content:center;z-index:2}

/* MENU 3 POINTS */
.m3w{position:relative}
.m3b{background:none;border:1px solid var(--br);color:var(--mt);width:32px;height:32px;border-radius:7px;font-size:17px;display:flex;align-items:center;justify-content:center;transition:.2s}
.m3b:hover{border-color:var(--g);color:var(--g)}
.m3d{position:absolute;right:0;top:38px;background:var(--dk);border:1px solid var(--br);border-radius:9px;min-width:170px;z-index:600;box-shadow:var(--sh);overflow:hidden}
.m3i{display:flex;align-items:center;gap:8px;padding:10px 13px;font-size:12px;color:var(--tx);border:none;background:none;width:100%;text-align:left;font-family:'DM Sans',sans-serif;transition:.2s}
.m3i:hover{background:var(--gl);color:var(--g)}
.m3i.r{color:var(--rd)}
.m3i.r:hover{background:rgba(231,76,60,.1)}

/* PRODUCT FORM */
.pf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(180px,100%),1fr));gap:10px;margin-bottom:4px}

/* PERMS */
.prg{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(200px,100%),1fr));gap:8px;margin-bottom:12px}
.pri{display:flex;align-items:center;gap:8px;background:var(--cd);border:1px solid rgba(46,204,113,.3);border-radius:7px;padding:9px 12px;font-size:11px;background:rgba(46,204,113,.05)}

/* BAR */
.br2{display:flex;align-items:center;gap:9px;margin-bottom:10px}
.brk{flex:1;background:var(--br);border-radius:3px;height:8px;overflow:hidden}
.brf{height:100%;border-radius:3px;transition:width .6s}

/* SUCCESS */
.succ{text-align:center;padding:clamp(20px,5vw,30px) 0}

/* MOBILE MENU CLIENT */
.mob-nav{display:none}
@media(max-width:768px){
  .mob-nav{display:flex;position:fixed;bottom:0;left:0;right:0;background:var(--dk);border-top:1px solid var(--br);z-index:800;height:56px;padding:0 4px}
  .mn-btn{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border:none;background:none;color:var(--mt);font-family:'DM Sans',sans-serif;font-size:9px;transition:.2s;padding:6px 2px;border-radius:8px}
  .mn-btn.on{color:var(--g);background:var(--gl)}
  .mn-btn span:first-child{font-size:20px}
  .hero{padding-bottom:76px}
  .sec{padding-bottom:82px}
  footer{padding-bottom:72px}
}

/* ADMIN RESPONSIVE */
.sb{position:fixed;top:0;left:0;bottom:0;width:220px;transition:.35s cubic-bezier(.4,0,.2,1);z-index:500}
.sb.hide{width:0;overflow:hidden}
.sb-back{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:499}
.sb-back.on{display:block}
.ham{display:none;background:none;border:1px solid var(--br);color:var(--tx);width:36px;height:36px;border-radius:8px;font-size:18px;align-items:center;justify-content:center;flex-shrink:0;transition:.2s}
.ham:hover{border-color:var(--g);color:var(--g)}
@media(max-width:900px){
  .sb{left:-220px!important;width:220px!important}
  .sb.mob-on{left:0!important}
  .am{margin-left:0!important}
  .ham{display:flex}
  .at{position:sticky;top:0;z-index:400}
  .atl{font-size:18px}
  .asl{font-size:11px;margin-bottom:12px}
  .sg{grid-template-columns:repeat(2,1fr)}
  .ac{padding:14px 12px}
  .pf-grid{grid-template-columns:1fr}
  .prg{grid-template-columns:1fr}
}
@media(max-width:600px){
  .sg{grid-template-columns:repeat(2,1fr);gap:8px}
  .sc{padding:12px}
  .sv{font-size:16px}
  .at{flex-wrap:wrap;gap:8px;padding:10px 12px}
  .tw table{min-width:400px}
  .tb2{padding:9px 11px}
  th{padding:8px 10px;font-size:9px}
  td{padding:9px 10px;font-size:11px}
  .ab{padding:3px 7px;font-size:9px}
  .m3d{right:0;min-width:150px}
  .phs{grid-template-columns:repeat(3,1fr);gap:6px}
}

/* ALERT */
.alrt{border-radius:8px;padding:10px 14px;font-size:12px;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.alrt.warn{background:rgba(243,156,18,.1);border:1px solid rgba(243,156,18,.3);color:var(--or)}
.alrt.err{background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.3);color:var(--rd)}
.alrt.ok{background:rgba(46,204,113,.1);border:1px solid rgba(46,204,113,.3);color:var(--gn)}

/* NO RESULTS */
.nr2{text-align:center;padding:40px 0;color:var(--mt);font-size:13px}

@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fadeUp .55s ease forwards}
/* ── RESPONSIVE AMELIORE ── */
@media(max-width:480px){
  .nb{padding:0 10px;height:54px}
  .bl{width:30px;height:30px;font-size:15px}
  .bn{font-size:13px}.bs{font-size:7px}
  .nb-btn{padding:5px 9px;font-size:11px}
  .hero{padding:70px 12px 80px}
  .htag{font-size:9px;padding:4px 11px}
  .cta{flex-direction:column;align-items:center}
  .cta .bg,.cta .bo{width:100%;max-width:280px;text-align:center}
  .hst{gap:16px;margin-top:32px}
  .sec{padding:32px 12px 80px}
  .pg{grid-template-columns:repeat(2,1fr);gap:8px}
  .pi{height:120px;font-size:44px}
  .pb{padding:8px}
  .pn{font-size:12px}.pp{font-size:12px}
  .ba{font-size:10px;padding:7px 4px}
  .oo{padding:10px}
  .ob{padding:10px 11px;gap:8px}
  .ot{font-size:12px}
  footer{padding:24px 12px 70px}
  .md{border-radius:18px 18px 0 0}
  .mb{padding:14px}
  .gm{height:190px}
  .lc{padding:22px 16px}
  .sg{grid-template-columns:repeat(2,1fr);gap:8px}
  .sc{padding:12px}
  .sv{font-size:17px}
  .ac{padding:12px}
  .atl{font-size:18px}
  .phs{gap:6px}
  .sh{flex-direction:column;align-items:flex-start}
  .tw table{min-width:360px}
}
@media(max-width:360px){
  .pg{grid-template-columns:repeat(2,1fr);gap:5px}
  .pi{height:100px;font-size:34px}
  .hero h1{font-size:28px}
}
@media(min-width:481px) and (max-width:768px){
  .pg{grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}
  .hero{padding:90px 20px 80px}
  .sec{padding:40px 16px 80px}
  .sg{grid-template-columns:repeat(2,1fr)}
}
@media(min-width:769px){
  .mob-nav{display:none!important}
  .hero{padding-bottom:50px}
  footer{padding-bottom:40px}
}
.tw{-webkit-overflow-scrolling:touch}
.ba,.be,.ob,.mn-btn,.nl{min-height:36px}


/* ADMIN RESPONSIVE EXTRA */
@media(max-width:900px){
  .am{margin-left:0!important;width:100%}
  .aw{display:block}
  .ac{padding:14px 12px}
  .sg{grid-template-columns:repeat(2,1fr)}
  .pf-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:500px){
  .sg{grid-template-columns:repeat(2,1fr);gap:8px}
  .sc{padding:11px}.sv{font-size:15px}.si2{font-size:18px}
  .pf-grid{grid-template-columns:1fr}
  .at{padding:10px 12px}
  .ac{padding:10px}
  .atl{font-size:17px}
  .asl{font-size:10px;margin-bottom:10px}
  th{font-size:9px;padding:7px 8px}
  td{font-size:11px;padding:8px}
  .ab{font-size:9px;padding:3px 6px}
  .tw table{min-width:320px}
  .sbu{padding:10px 12px}
  .sbl{padding:13px 12px}
  .m3d{min-width:140px}
  .phs{gap:5px}
}

`;

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function StyleTag(){
  useEffect(()=>{
    const el=document.createElement("style");
    el.textContent=CSS;
    document.head.appendChild(el);
    return()=>document.head.removeChild(el);
  },[]);
  return null;
}

function useToast(){
  const[t,st]=useState({show:false,msg:"",err:false});
  const show=(msg,err=false)=>{
    st({show:true,msg,err});
    setTimeout(()=>st(x=>({...x,show:false})),2800);
  };
  return[t,show];
}

function Toast({t}){
  return <div className={`tst${t.show?" on":""}${t.err?" err":""}`}>{t.err?"⚠️":"✅"} {t.msg}</div>;
}

function SBadge({status}){
  const m={"Livré":"s-l","En cours":"s-c","En attente":"s-a","Annulé":"s-x"};
  return <span className={`sbg ${m[status]||""}`}>● {status}</span>;
}

/* ═══════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════ */
function Login({onLogin}){
  const[id,setId]=useState("");
  const[pw,setPw]=useState("");
  const[err,setErr]=useState("");
  const[loading,setL]=useState(false);

  const go=()=>{
    setErr("");
    if(!id.trim()||!pw.trim()){setErr("Remplissez tous les champs.");return;}
    setL(true);
    setTimeout(()=>{
      const a=ACCOUNTS.find(x=>x.id===id&&x.pw===pw);
      if(a)onLogin(a);
      else{setErr("ID ou mot de passe incorrect.");setL(false);}
    },700);
  };

  return(
    <div className="lw">
      <div className="lc">
        <div style={{textAlign:"center",marginBottom:24}}>
          <img src={LOGO} alt="logo" style={{width:64,height:64,objectFit:"contain",margin:"0 auto 8px"}}/>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,marginBottom:4}}>Baark Wendé Store</div>
          <div style={{fontSize:12,color:"var(--mt)"}}>Accès Administrateur</div>
        </div>
        {err&&<div className="le">🔒 {err}</div>}
        <div className="fg2"><label className="fl">Identifiant</label>
          <input className="fi" placeholder="Ex : Bilalboss1 / Admin1 / Admin2" value={id} onChange={e=>setId(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/>
        </div>
        <div className="fg2"><label className="fl">Mot de passe</label>
          <input className="fi" type="password" placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/>
        </div>
        <button className="bg" style={{width:"100%",padding:12,marginTop:6}} onClick={go} disabled={loading}>
          {loading?"⏳ Connexion...":"🔐 Se connecter"}
        </button>
        <div style={{marginTop:18,padding:13,background:"var(--c2)",borderRadius:8,fontSize:11,color:"var(--mt)",lineHeight:1.9}}>
          <div style={{fontWeight:600,color:"var(--g)",marginBottom:5}}>Comptes :</div>
          <div>👑 Super Admin — ID : <strong>Bilalboss1</strong></div>
          <div>🔧 Admin 1 — ID : <strong>Admin1</strong></div>
          <div>🔧 Admin 2 — ID : <strong>Admin2</strong></div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CLIENT
═══════════════════════════════════════════ */
function ClientApp({products,orders,setOrders,onAdmin}){
  const[page,setPage]=useState("home");
  const[cart,setCart]=useState([]);
  const[cartOpen,setCO]=useState(false);
  const[sel,setSel]=useState(null);
  const[t,show]=useToast();
  const clicks=useRef(0),timer=useRef(null);

  const logoClick=()=>{
    clicks.current+=1;clearTimeout(timer.current);
    if(clicks.current>=2){clicks.current=0;onAdmin();}
    else timer.current=setTimeout(()=>{clicks.current=0;setPage("home");},400);
  };

  const addCart=p=>{
    setCart(prev=>{
      const ex=prev.find(i=>i.id===p.id);
      return ex?prev.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...prev,{...p,qty:1}];
    });
    show(p.name+" ajouté au panier !");
  };

  const cnt=cart.reduce((s,i)=>s+i.qty,0);

  return(
    <>
      <nav className="nb">
        <div className="br" onClick={logoClick} title="Double-clic → Admin">
          <div className="bl" style={{background:"none",padding:0,overflow:"hidden"}}><img src={LOGO} alt="logo" style={{width:"100%",height:"100%",objectFit:"contain",filter:"none"}}/></div>
          <div><div className="bn">Baark Wendé</div><div className="bs">Store</div></div>
        </div>
        <div className="nls">
          <button className={`nl${page==="home"?" on":""}`} onClick={()=>setPage("home")}>Accueil</button>
          <button className={`nl${page==="shop"?" on":""}`} onClick={()=>setPage("shop")}>Boutique</button>
        </div>
        <div className="nr">
          <button className="nb-btn" onClick={()=>setCO(true)} style={{position:"relative"}}>
            🛒 <span style={{display:"none"}} id="cart-label"> Panier</span>
            {cnt>0&&<span className="cbg">{cnt}</span>}
          </button>
        </div>
      </nav>

      {page==="home"&&<HomeView products={products} setPage={setPage} onView={setSel} onAdd={addCart}/>}
      {page==="shop"&&<ShopView products={products} onView={setSel} onAdd={addCart}/>}

      {/* Mobile bottom nav */}
      <div className="mob-nav">
        <button className={`mn-btn${page==="home"?" on":""}`} onClick={()=>setPage("home")}><span>🏠</span>Accueil</button>
        <button className={`mn-btn${page==="shop"?" on":""}`} onClick={()=>setPage("shop")}><span>🛍️</span>Boutique</button>
        <button className="mn-btn" onClick={()=>setCO(true)}><span>🛒</span>Panier{cnt>0&&` (${cnt})`}</button>
        <button className="mn-btn" onClick={()=>window.open("https://wa.me/2250787213203","_blank")}><span>💬</span>WhatsApp</button>
      </div>

      <ProdModal prod={sel} onClose={()=>setSel(null)} orders={orders} setOrders={setOrders} showT={show}/>
      <CartPanel open={cartOpen} onClose={()=>setCO(false)} items={cart} onRemove={id=>setCart(p=>p.filter(i=>i.id!==id))} orders={orders} setOrders={setOrders} showT={show}/>
      <button className="wa" onClick={()=>window.open("https://wa.me/2250787213203?text=Bonjour Baark Wendé Store!","_blank")}>💬</button>
      <Toast t={t}/>
    </>
  );
}

const REVS=[
  {name:"Konan Beatrice",av:"K",r:5,date:"15 Mars 2025",txt:"Commande reçue en 24h ! Produit magnifique, service WhatsApp très réactif. Je recommande !"},
  {name:"Traoré Ibrahim",av:"T",r:5,date:"10 Mars 2025",txt:"iPhone 15 livré le lendemain. Authentique avec facture. Emballage parfait. Merci !"},
  {name:"Coulibaly Aminata",av:"C",r:4,date:"05 Mars 2025",txt:"Boubou splendide, broderie de qualité. Service après-vente très arrangeant. Je reviendrai !"},
];

function HomeView({products,setPage,onView,onAdd}){
  const pop=products.filter(p=>p.badge).slice(0,4);
  return(
    <>
      <section className="hero">
        <div className="hi fu">
          <div className="htag">✨ Boutique Premium — Côte d'Ivoire</div>
          <h1>Baark Wendé<br/>Store</h1>
          <p>Montres de luxe, voitures, téléphones, vêtements et plus. Qualité premium, livraison rapide en Côte d'Ivoire.</p>
          <div className="cta">
            <button className="bg" onClick={()=>setPage("shop")}>Explorer la boutique →</button>
            <button className="bo" onClick={()=>window.open("https://wa.me/2250787213203","_blank")}>💬 WhatsApp</button>
          </div>
          <div className="hst">
            <div><span className="hn">500+</span><span className="hl">Produits</span></div>
            <div><span className="hn">2K+</span><span className="hl">Clients</span></div>
            <div><span className="hn">4.8★</span><span className="hl">Note moy.</span></div>
            <div><span className="hn">24h</span><span className="hl">Livraison</span></div>
          </div>
        </div>
      </section>

      <div className="div"/>
      <div className="sec">
        <div className="sh">
          <div><h2 className="st">Produits <span>Populaires</span></h2><div className="ss">Nos meilleures ventes</div></div>
          <button className="sa" onClick={()=>setPage("shop")}>Voir tout →</button>
        </div>
        <div className="pg">{pop.map(p=><PCard key={p.id} p={p} onView={onView} onAdd={onAdd}/>)}</div>
      </div>

      <div className="div"/>
      <div className="sec">
        <div className="sh"><div><h2 className="st">Avis <span>Clients</span></h2><div className="ss">Ce que disent nos clients</div></div></div>
        <div className="rg">{REVS.map((r,i)=>(
          <div key={i} className="rc">
            <div className="rt"><div className="ra">{r.av}</div><div><div className="rn">{r.name}</div><div className="rd">{r.date}</div></div></div>
            <div className="rs">{star(r.r)}</div><p className="rx">{r.txt}</p>
          </div>
        ))}</div>
      </div>

      <div className="div"/>
      <footer>
        <div className="fg3">
          <div>
            <div className="fbr" style={{display:"flex",alignItems:"center",gap:8}}><img src={LOGO} alt="logo" style={{width:28,height:28,objectFit:"contain"}}/> Baark Wendé Store</div>
            <p className="fd">Votre boutique de confiance en Côte d'Ivoire : montres, voitures, téléphones, vêtements et plus encore.</p>
            <div className="fc"><span>📍 Côte d'Ivoire</span><span>📞 0170260670</span><span>📞 +225 0787213203</span></div>
          </div>
          <div><div className="fct">Catégories</div><div className="fls">{CATS.filter(c=>c!=="Tous").map(c=><span key={c} className="flk">{c}</span>)}</div></div>
          <div><div className="fct">Infos</div><div className="fls">{["Livraison","Retours","Mobile Money","Dépôt-vente","Contact"].map(l=><span key={l} className="flk">{l}</span>)}</div></div>
          <div><div className="fct">Paiements</div><div className="fls"><span className="flk">📱 MTN Mobile Money</span><span className="flk">💚 Wave</span><span className="flk">🟠 Orange Money</span><span className="flk">🚪 À la livraison</span></div></div>
        </div>
        <div className="fb2"><span>© 2025 Baark Wendé Store</span><span>Fait avec ❤️ en Côte d'Ivoire</span></div>
      </footer>
    </>
  );
}

function ShopView({products,onView,onAdd}){
  const[cat,setCat]=useState("Tous");
  const[q,setQ]=useState("");
  const f=products.filter(p=>(cat==="Tous"||p.cat===cat)&&p.name.toLowerCase().includes(q.toLowerCase()));
  return(
    <div className="sec" style={{paddingTop:76}}>
      <div className="sh"><div><h2 className="st">Notre <span>Boutique</span></h2><div className="ss">{f.length} produit(s)</div></div></div>
      <div className="sw"><span className="si">🔍</span><input className="sinp" placeholder="Rechercher..." value={q} onChange={e=>setQ(e.target.value)}/></div>
      <div className="cts">{CATS.map(c=><button key={c} className={`cb${cat===c?" on":""}`} onClick={()=>setCat(c)}>{c}</button>)}</div>
      <div className="pg">{f.map(p=><PCard key={p.id} p={p} onView={onView} onAdd={onAdd}/>)}</div>
      {f.length===0&&<div className="nr2">Aucun produit trouvé.</div>}
    </div>
  );
}

function PCard({p,onView,onAdd}){
  const cover=p.photos?.[0];
  return(
    <div className="pc" onClick={()=>onView(p)}>
      <div className="pi">
        {cover?<img src={cover} alt={p.name} onError={e=>{e.target.style.display="none";}}/>:p.img}
        {p.badge&&<span className="pb2">{p.badge}</span>}
      </div>
      <div className="pb">
        <div className="pc2">{p.cat}</div>
        <div className="pn">{p.name}</div>
        <div className="ps">{star(p.r)} <span style={{color:"var(--mt)",fontSize:9}}>({p.rv})</span></div>
        <div className="pp">{fmt(p.price)}{p.old&&<span className="po">{fmt(p.old)}</span>}</div>
        <div className="pf">
          <button className="ba" onClick={e=>{e.stopPropagation();onView(p);}}>Commander</button>
          <button className="be" onClick={e=>{e.stopPropagation();onView(p);}}>👁</button>
        </div>
      </div>
    </div>
  );
}

function ProdModal({prod,onClose,orders,setOrders,showT}){
  const[idx,setIdx]=useState(0);
  const[mode,setMode]=useState(null);
  const[phone,setPhone]=useState("");
  const[addr,setAddr]=useState("");
  const[done,setDone]=useState(false);
  useEffect(()=>{setIdx(0);setMode(null);setPhone("");setAddr("");setDone(false);},[prod?.id]);
  if(!prod)return null;
  const photos=(prod.photos||[]).filter(Boolean);
  const waMsg=encodeURIComponent(`Bonjour Baark Wendé Store 👋\nJe souhaite commander :\n📦 *${prod.name}*\n💰 ${fmt(prod.price)}\nMerci.`);
  const submit=()=>{
    if(!phone.trim()||!addr.trim()){showT("Remplissez tous les champs !",true);return;}
    const newOrd={id:nid(),client:"Client",phone,product:prod.name,amount:prod.price,status:"En attente",date:new Date().toLocaleDateString("fr-FR"),lieu:addr};
    setOrders(prev=>[newOrd,...prev]);
    addOrder(newOrd).catch(()=>{});
    setDone(true);
  };
  return(
    <div className="ov" onClick={onClose}>
      <div className="md" onClick={e=>e.stopPropagation()}>
        <div className="mh">
          <span className="mt2">{mode==="form"?"📋 Commander":"Détail produit"}</span>
          <button className="mc" onClick={mode?()=>setMode(null):onClose}>{mode?"← Retour":"✕ Fermer"}</button>
        </div>
        <div className="mb">
          {!mode&&!done&&(
            <>
              {photos.length>0?(
                <>
                  <div className="gm">
                    <img src={photos[idx]} alt="" onError={e=>{e.target.style.display="none";}}/>
                    {photos.length>1&&(
                      <>
                        <button className="ga" style={{left:8}} onClick={()=>setIdx(i=>(i-1+photos.length)%photos.length)}>‹</button>
                        <button className="ga" style={{right:8}} onClick={()=>setIdx(i=>(i+1)%photos.length)}>›</button>
                        <div className="gd2">{photos.map((_,i)=><div key={i} className={`gdt${i===idx?" on":""}`} onClick={()=>setIdx(i)}/>)}</div>
                      </>
                    )}
                  </div>
                  {photos.length>1&&<div className="gth">{photos.map((ph,i)=><div key={i} className={`gthi${i===idx?" on":""}`} onClick={()=>setIdx(i)}><img src={ph} alt="" onError={e=>{e.target.style.display="none";}}/></div>)}</div>}
                </>
              ):<div className="mib">{prod.img}</div>}
              <div style={{fontSize:9,color:"var(--g)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:5}}>{prod.cat}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:6}}>{prod.name}</div>
              <div className="rs" style={{marginBottom:8}}>{star(prod.r)} <span style={{color:"var(--mt)",fontSize:10}}>({prod.rv} avis)</span></div>
              <p style={{fontSize:12,color:"var(--mt)",lineHeight:1.8,marginBottom:12}}>{prod.desc}</p>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"var(--g)",marginBottom:6}}>{fmt(prod.price)}</div>
              <div style={{fontSize:11,color:"var(--mt)",marginBottom:16}}>Stock : <strong style={{color:"var(--gn)"}}>{prod.stock} unités</strong></div>
              <div className="oo">
                <div style={{fontSize:12,fontWeight:700,color:"var(--g)",marginBottom:10}}>📦 Comment commander ?</div>
                <button className="ob gld" onClick={()=>setMode("form")}><span style={{fontSize:18}}>📋</span><span><span className="ot">Remplir le formulaire</span><span className="os">Numéro + lieu de livraison</span></span></button>
                <button className="ob lne" onClick={()=>window.open(`https://wa.me/2250787213203?text=${waMsg}`,"_blank")}><span style={{fontSize:18}}>💬</span><span><span className="ot">Commander via WhatsApp</span><span className="os">Écrire directement à la boutique</span></span></button>
              </div>
            </>
          )}
          {mode==="form"&&!done&&(
            <>
              <div style={{background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.3)",borderRadius:8,padding:12,marginBottom:16}}>
                <div style={{fontWeight:700,color:"var(--g)",fontSize:13,marginBottom:3}}>{prod.name}</div>
                <div style={{color:"var(--mt)",fontSize:12}}>Prix : <strong style={{color:"var(--tx)"}}>{fmt(prod.price)}</strong></div>
              </div>
              <div className="fg2"><label className="fl">Numéro de téléphone *</label><input className="fi" placeholder="07 12 34 56 78" value={phone} onChange={e=>setPhone(e.target.value)}/></div>
              <div className="fg2"><label className="fl">Lieu de livraison *</label><input className="fi" placeholder="Quartier, commune — Côte d'Ivoire" value={addr} onChange={e=>setAddr(e.target.value)}/></div>
              <div style={{fontSize:11,color:"var(--mt)",background:"var(--c2)",borderRadius:7,padding:"9px 12px",marginBottom:14,lineHeight:1.7}}>ℹ️ La boutique vous contactera pour confirmer.</div>
              <div style={{display:"flex",gap:8}}>
                <button className="bo" onClick={()=>setMode(null)}>← Retour</button>
                <button className="bg" style={{flex:1,padding:11}} onClick={submit}>✅ Envoyer</button>
              </div>
            </>
          )}
          {done&&(
            <div className="succ">
              <div style={{fontSize:52,marginBottom:13}}>🎉</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,marginBottom:8}}>Commande envoyée !</div>
              <p style={{color:"var(--mt)",fontSize:12,lineHeight:1.85,marginBottom:20}}>
                <strong style={{color:"var(--g)"}}>Baark Wendé Store</strong> vous contactera au <strong style={{color:"var(--tx)"}}>{phone}</strong> pour livraison à <strong style={{color:"var(--tx)"}}>{addr}</strong>.
              </p>
              <button className="bg" style={{padding:"10px 26px"}} onClick={onClose}>Fermer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CartPanel({open,onClose,items,onRemove,orders,setOrders,showT}){
  const[step,setStep]=useState(0);
  const[phone,setPhone]=useState("");
  const[addr,setAddr]=useState("");
  const[done,setDone]=useState(false);
  const total=items.reduce((s,i)=>s+i.price*i.qty,0);
  useEffect(()=>{if(!open){setStep(0);setDone(false);setPhone("");setAddr("");}},[ open]);
  const waMsg=encodeURIComponent(`Bonjour Baark Wendé Store 👋\n${items.map(i=>`📦 ${i.name} x${i.qty}`).join("\n")}\n💰 Total : ${fmt(total)}\nMerci.`);
  const submit=()=>{
    if(!phone.trim()||!addr.trim()){showT("Remplissez tous les champs !",true);return;}
    setOrders(prev=>[{id:nid(),client:"Client",phone,product:items.map(i=>i.name).join(", "),amount:total,status:"En attente",date:new Date().toLocaleDateString("fr-FR"),lieu:addr},...prev]);
    setDone(true);
  };
  return(
    <>
      <div className={`cb2${open?" on":""}`} onClick={onClose}/>
      <div className={`cp${open?" on":""}`}>
        <div className="ch">
          <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>🛒 Mon Panier</div><div style={{fontSize:10,color:"var(--mt)"}}>{items.length} article(s)</div></div>
          <button className="mc" onClick={onClose}>✕</button>
        </div>
        {!step&&!done&&(
          <>
            <div className="cl">
              {items.length===0?<div className="ce"><div style={{fontSize:38,marginBottom:10}}>🛒</div><div>Panier vide</div></div>
              :items.map(item=>(
                <div key={item.id} className="ci">
                  <div className="cii">{item.photos?.[0]?<img src={item.photos[0]} alt="" onError={e=>{e.target.style.display="none";}}/>:item.img}</div>
                  <div style={{flex:1}}><div className="cn">{item.name}</div><div className="cp2">{fmt(item.price)}</div><div className="cq">Qté : {item.qty}</div></div>
                  <button className="cd2" onClick={()=>onRemove(item.id)}>🗑</button>
                </div>
              ))}
            </div>
            {items.length>0&&(
              <div className="cf">
                <div className="cr"><span className="ctlbl">Total</span><span className="ctval">{fmt(total)}</span></div>
                <button className="bg" style={{width:"100%",padding:11,marginBottom:7}} onClick={()=>setStep(1)}>📋 Commander (formulaire)</button>
                <button className="bo" style={{width:"100%",padding:10}} onClick={()=>window.open(`https://wa.me/2250787213203?text=${waMsg}`,"_blank")}>💬 Commander via WhatsApp</button>
              </div>
            )}
          </>
        )}
        {step===1&&!done&&(
          <div style={{padding:16,flex:1,overflowY:"auto"}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:13}}>📋 Finaliser</div>
            <div style={{background:"rgba(201,168,76,.07)",borderRadius:8,padding:11,marginBottom:14,fontSize:11,color:"var(--mt)"}}>
              {items.map(i=><div key={i.id}>{i.name} x{i.qty} — {fmt(i.price*i.qty)}</div>)}
              <div style={{marginTop:7,fontWeight:700,color:"var(--g)",fontSize:13}}>Total : {fmt(total)}</div>
            </div>
            <div className="fg2"><label className="fl">Téléphone *</label><input className="fi" placeholder="07 XX XX XX XX" value={phone} onChange={e=>setPhone(e.target.value)}/></div>
            <div className="fg2"><label className="fl">Lieu de livraison *</label><input className="fi" placeholder="Quartier, commune" value={addr} onChange={e=>setAddr(e.target.value)}/></div>
            <div style={{display:"flex",gap:7,marginTop:10}}>
              <button className="bo" style={{flex:1}} onClick={()=>setStep(0)}>← Retour</button>
              <button className="bg" style={{flex:2,padding:11}} onClick={submit}>✅ Confirmer</button>
            </div>
          </div>
        )}
        {done&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:22,textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>🎉</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,marginBottom:8}}>Commande envoyée !</div>
            <p style={{color:"var(--mt)",fontSize:12,lineHeight:1.8,marginBottom:18}}>Nous vous contacterons au <strong style={{color:"var(--tx)"}}>{phone}</strong> pour livraison à <strong style={{color:"var(--tx)"}}>{addr}</strong>.</p>
            <button className="bg" style={{padding:"9px 22px"}} onClick={onClose}>Fermer</button>
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   ADMIN
═══════════════════════════════════════════ */
function AdminApp({user,onLogout,products,setProducts,orders,setOrders}){
  const[tab,setTab]=useState("dashboard");
  const[sbOpen,setSB]=useState(true);
  const[mobSB,setMSB]=useState(false);
  const[m3,setM3]=useState(false);
  const[t,show]=useToast();
  const isSuper=user.role==="superadmin";

  const NAV=[
    {id:"dashboard",icon:"📊",label:"Dashboard"},
    {id:"products", icon:"📦",label:"Produits"},
    {id:"orders",   icon:"🛒",label:"Commandes"},
    {id:"stock",    icon:"📈",label:"Stock"},
    {id:"stats",    icon:"📉",label:"Statistiques"},
    {id:"reviews",  icon:"⭐",label:"Avis clients"},
    ...(isSuper?[
      {id:"admins",   icon:"👥",label:"Gestion Admins"},
      {id:"settings", icon:"⚙️",label:"Paramètres"},
      {id:"security", icon:"🔒",label:"Sécurité"},
    ]:[]),
  ];

  return(
    <div className="aw">
      {/* Overlay mobile sidebar */}
      <div className={`sb-back${mobSB?" on":""}`} onClick={()=>setMSB(false)}/>

      {/* SIDEBAR */}
      <div className={`sb${!sbOpen?" hide":""}${mobSB?" mob-on":""}`}>
        <div className="sbl">
          <div className="br" style={{cursor:"default"}}>
            <div className="bl" style={{width:32,height:32,background:"none",padding:0,overflow:"hidden"}}><img src={LOGO} alt="logo" style={{width:"100%",height:"100%",objectFit:"contain"}}/></div>
            <div><div className="bn" style={{fontSize:12}}>Admin</div><div className="bs">Baark Wendé</div></div>
          </div>
        </div>
        <div className="sbu">
          <div style={{fontWeight:600,fontSize:12,marginBottom:5}}>{user.name}</div>
          <span className={`ubg ${user.role==="superadmin"?"sup":"adm"}`}>{user.role==="superadmin"?"👑 Super Admin":"🔧 Admin"}</span>
        </div>
        <div className="sbn">
          {NAV.map(n=>(
            <button key={n.id} className={`an${tab===n.id?" on":""}`} onClick={()=>{setTab(n.id);setMSB(false);}}>
              <span>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
          <div style={{marginTop:16,borderTop:"1px solid var(--br)",paddingTop:10}}>
            <button className="an dg" onClick={onLogout}><span>🚪</span><span>Déconnexion</span></button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className={`am${!sbOpen?" full":""}`}>
        <div className="at">
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button className="m3b" onClick={()=>{setSB(o=>!o);setMSB(o=>!o);}}>☰</button>
            <div>
              <div style={{fontWeight:600,fontSize:13}}>{NAV.find(n=>n.id===tab)?.icon} {NAV.find(n=>n.id===tab)?.label}</div>
              <div style={{fontSize:10,color:"var(--mt)"}}>Baark Wendé Store</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:11,color:"var(--mt)",display:"none"}} className="d-md-block">Connecté : <strong style={{color:"var(--tx)"}}>{user.name}</strong></div>
            <div className="m3w">
              <button className="m3b" onClick={()=>setM3(o=>!o)}>⋯</button>
              {m3&&(
                <div className="m3d">
                  {isSuper&&<button className="m3i" onClick={()=>{setTab("settings");setM3(false);}}>⚙️ Paramètres</button>}
                  {isSuper&&<button className="m3i" onClick={()=>{setTab("admins");setM3(false);}}>👥 Admins</button>}
                  {isSuper&&<button className="m3i" onClick={()=>{setTab("security");setM3(false);}}>🔒 Sécurité</button>}
                  <button className="m3i" onClick={()=>window.open("https://wa.me/2250787213203","_blank")}>💬 WhatsApp</button>
                  <hr style={{border:"none",borderTop:"1px solid var(--br)",margin:"4px 0"}}/>
                  <button className="m3i r" onClick={onLogout}>🚪 Déconnexion</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="ac" onClick={()=>setM3(false)}>
          {tab==="dashboard"&&<ADash products={products} orders={orders} user={user}/>}
          {tab==="products" &&<AProds products={products} setProducts={setProducts} showT={show}/>}
          {tab==="orders"   &&<AOrders orders={orders} setOrders={setOrders} showT={show}/>}
          {tab==="stock"    &&<AStock products={products} setProducts={setProducts} showT={show}/>}
          {tab==="stats"    &&<AStats products={products} orders={orders}/>}
          {tab==="reviews"  &&<AReviews showT={show}/>}
          {tab==="admins"   &&isSuper&&<AAdmins showT={show}/>}
          {tab==="settings" &&isSuper&&<ASettings showT={show}/>}
          {tab==="security" &&isSuper&&<ASecurity showT={show}/>}
        </div>
      </div>
      <Toast t={t}/>
    </div>
  );
}

/* ── DASHBOARD ── */
function ADash({products,orders,user}){
  const rev=orders.filter(o=>o.status==="Livré").reduce((s,o)=>s+o.amount,0);
  const pend=orders.filter(o=>o.status==="En attente").length;
  const low=products.filter(p=>p.stock<5).length;
  return(
    <>
      <div className="atl">Tableau de bord</div>
      <div className="asl">Bonjour {user.name} !</div>
      {pend>0&&<div className="alrt warn">⚠️ <strong>{pend} commande(s)</strong> en attente de validation</div>}
      <div className="sg">
        {[{icon:"💰",lbl:"Revenus",val:fmt(rev),tr:"Commandes livrées"},{icon:"🛒",lbl:"Commandes",val:orders.length,tr:`${pend} en attente`},{icon:"📦",lbl:"Produits",val:products.length,tr:"Catalogue"},{icon:"⚠️",lbl:"Stock bas",val:low,tr:low>0?"À réapprovisionner":"✅ OK"}].map((s,i)=>(
          <div key={i} className="sc"><div className="si2">{s.icon}</div><div className="slbl">{s.lbl}</div><div className="sv">{s.val}</div><div className="str">{s.tr}</div></div>
        ))}
      </div>
      <div className="tw">
        <div className="tb2"><span style={{fontWeight:600}}>📋 Dernières commandes</span></div>
        <table><thead><tr><th>ID</th><th>Client</th><th>Produit</th><th>Montant</th><th>Statut</th><th>Date</th></tr></thead>
          <tbody>{orders.slice(0,5).map(o=>(
            <tr key={o.id}>
              <td style={{color:"var(--g)",fontWeight:700,fontSize:11}}>{o.id}</td>
              <td style={{fontWeight:600}}>{o.client}</td>
              <td style={{color:"var(--mt)",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.product}</td>
              <td style={{fontWeight:700}}>{fmt(o.amount)}</td>
              <td><SBadge status={o.status}/></td>
              <td style={{color:"var(--mt)",fontSize:11}}>{o.date}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}

/* ── PRODUCTS ADMIN (CORRIGÉ) ── */
function AProds({products,setProducts,showT}){
  const EMPTY={name:"",cat:"Montres",price:"",oldPrice:"",stock:"",desc:"",badge:""};
  const[form,setForm]=useState(false);
  const[edit,setEdit]=useState(null);
  const[np,setNp]=useState({...EMPTY});
  const[photos,setPhotos]=useState(["","",""]);
  const[err,setErr]=useState("");
  const[q,setQ]=useState("");

  const fl=products.filter(p=>p.name.toLowerCase().includes(q.toLowerCase()));

  const readFile=(idx,file)=>{
    if(!file)return;
    const r=new FileReader();
    r.onload=e=>{const u=[...photos];u[idx]=e.target.result;setPhotos(u);};
    r.readAsDataURL(file);
  };

  const reset=()=>{setNp({...EMPTY});setPhotos(["",""," "]);setErr("");setEdit(null);};

  const openAdd=()=>{reset();setForm(true);};

  const openEdit=(p)=>{
    setEdit(p);
    setNp({name:p.name,cat:p.cat,price:String(p.price),oldPrice:String(p.old||""),stock:String(p.stock),desc:p.desc,badge:p.badge||""});
    const ph=[...(p.photos||[]),"","",""].slice(0,3);
    setPhotos(ph);
    setForm(true);
  };

  const save=()=>{
    setErr("");
    if(!np.name.trim()){setErr("Le nom du produit est obligatoire.");return;}
    if(!np.price||isNaN(parseInt(np.price))){setErr("Entrez un prix valide.");return;}

    const validPh=photos.filter(u=>u&&u.trim()!=="");
    // Photos non obligatoires — si moins de 3, on complète avec tableau vide
    const emoji=CATS.find(c=>c===np.cat)?{Montres:"⌚",Téléphones:"📱",Voitures:"🚗",Vêtements:"👔",Autres:"🎁"}[np.cat]||"📦":"📦";

    const prod={
      name:np.name.trim(),
      cat:np.cat,
      price:parseInt(np.price),
      old:np.oldPrice?parseInt(np.oldPrice):null,
      stock:parseInt(np.stock)||0,
      desc:np.desc.trim(),
      badge:np.badge.trim()||null,
      img:emoji,
      photos:validPh,
      r:0,rv:0,
    };

    if(edit){
      // Mise à jour Firebase
      if(edit.fireId){
        updateProduct(edit.fireId, prod).then(()=>showT("Produit modifié ✅")).catch(()=>showT("Erreur modification",true));
      } else {
        setProducts(prev=>prev.map(p=>p.id===edit.id?{...p,...prod}:p));
        showT("Produit modifié ✅");
      }
    }else{
      // Ajout Firebase
      addProduct({...prod,id:Date.now()}).then(()=>showT("Produit ajouté ✅ (sauvegardé)")).catch(()=>showT("Erreur ajout",true));
    }
    reset();setForm(false);
  };

  return(
    <>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div><div className="atl">Gestion Produits</div><div className="asl" style={{marginBottom:0}}>{products.length} produit(s)</div></div>
        {!form&&<button className="bg" onClick={openAdd}>+ Ajouter un produit</button>}
        {form&&<button className="bo" style={{padding:"8px 14px",fontSize:12}} onClick={()=>{reset();setForm(false);}}>✕ Annuler</button>}
      </div>

      {form&&(
        <div className="tw" style={{padding:18,marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>{edit?"✏️ Modifier":"✚ Nouveau produit"}</div>

          {/* CHAMPS PRINCIPAUX */}
          <div className="pf-grid">
            <div className="fg2">
              <label className="fl">Nom du produit *</label>
              <input className="fi" value={np.name} onChange={e=>setNp({...np,name:e.target.value})} placeholder="Ex : Montre Rolex Gold"/>
            </div>
            <div className="fg2">
              <label className="fl">Catégorie</label>
              <select className="fi" value={np.cat} onChange={e=>setNp({...np,cat:e.target.value})}>
                {CATS.filter(c=>c!=="Tous").map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="fg2">
              <label className="fl">Prix (FCFA) *</label>
              <input className="fi" type="number" value={np.price} onChange={e=>setNp({...np,price:e.target.value})} placeholder="Ex : 150000"/>
            </div>
            <div className="fg2">
              <label className="fl">Ancien prix (optionnel)</label>
              <input className="fi" type="number" value={np.oldPrice} onChange={e=>setNp({...np,oldPrice:e.target.value})} placeholder="Ex : 200000"/>
            </div>
            <div className="fg2">
              <label className="fl">Stock</label>
              <input className="fi" type="number" value={np.stock} onChange={e=>setNp({...np,stock:e.target.value})} placeholder="Ex : 10"/>
            </div>
            <div className="fg2">
              <label className="fl">Badge (optionnel)</label>
              <input className="fi" value={np.badge} onChange={e=>setNp({...np,badge:e.target.value})} placeholder="Ex : Nouveau, Populaire…"/>
            </div>
          </div>

          <div className="fg2">
            <label className="fl">Description</label>
            <textarea className="fi" value={np.desc} onChange={e=>setNp({...np,desc:e.target.value})} placeholder="Décrivez le produit (caractéristiques, matériaux, taille…)"/>
          </div>

          {/* PHOTOS */}
          <div style={{background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.22)",borderRadius:9,padding:14,marginBottom:4}}>
            <div style={{fontWeight:700,color:"var(--g)",fontSize:12,marginBottom:3}}>📸 Photos du produit <span style={{fontWeight:400,color:"var(--mt)"}}>(optionnel — cliquez pour choisir)</span></div>
            <div style={{fontSize:11,color:"var(--mt)",marginBottom:11}}>Ajoutez jusqu'à 3 photos depuis votre ordinateur. Si aucune photo, une icône sera affichée.</div>
            <div className="phs">
              {[0,1,2].map(i=>(
                <div key={i} className={`ph${photos[i]&&photos[i].trim()?" on":""}`}>
                  {photos[i]&&photos[i].trim()?(
                    <>
                      <img src={photos[i]} alt="" onError={e=>{e.target.style.display="none";}}/>
                      <button className="ph-rm" onClick={e=>{e.stopPropagation();const u=[...photos];u[i]="";setPhotos(u);}}>✕</button>
                    </>
                  ):(
                    <>
                      <span style={{fontSize:22,pointerEvents:"none"}}>📷</span>
                      <span className="ph-lbl">Photo {i+1}</span>
                      <input type="file" accept="image/*" onChange={e=>readFile(i,e.target.files[0])}/>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div style={{fontSize:10,color:"var(--mt)",textAlign:"center"}}>{photos.filter(u=>u&&u.trim()).length}/3 photo(s) ajoutée(s)</div>
          </div>

          {err&&<div className="alrt err" style={{marginTop:10}}>⚠️ {err}</div>}

          <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
            <button className="bg" onClick={save}>✅ {edit?"Sauvegarder les modifications":"Enregistrer le produit"}</button>
            <button className="bo" style={{padding:"10px 16px"}} onClick={()=>{reset();setForm(false);}}>Annuler</button>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="sw" style={{marginBottom:14}}>
        <span className="si">🔍</span>
        <input className="sinp" placeholder="Rechercher un produit..." value={q} onChange={e=>setQ(e.target.value)}/>
      </div>

      {/* TABLE */}
      <div className="tw">
        <table><thead><tr><th>Photo</th><th>Produit</th><th>Cat.</th><th>Prix</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>
            {fl.length===0&&<tr><td colSpan={6} style={{textAlign:"center",color:"var(--mt)",padding:24}}>Aucun produit trouvé.</td></tr>}
            {fl.map(p=>(
              <tr key={p.id}>
                <td>
                  <div style={{width:40,height:40,borderRadius:7,overflow:"hidden",background:"var(--c2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
                    {p.photos?.[0]?<img src={p.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>:p.img}
                  </div>
                </td>
                <td>
                  <div style={{fontWeight:600,fontSize:12}}>{p.name}</div>
                  {p.photos?.length>0&&<div style={{fontSize:9,color:"var(--g)"}}>{p.photos.length} photo(s)</div>}
                </td>
                <td><span className="sbg s-c" style={{fontSize:9}}>{p.cat}</span></td>
                <td style={{color:"var(--g)",fontWeight:700,fontSize:11}}>{fmt(p.price)}</td>
                <td><span style={{color:p.stock<5?"var(--rd)":"var(--gn)",fontWeight:700}}>{p.stock}</span></td>
                <td>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    <button className="ab ed" onClick={()=>openEdit(p)}>✏️ Modifier</button>
                    <button className="ab dl" onClick={()=>{setProducts(prev=>prev.filter(x=>x.id!==p.id));showT("Produit supprimé");}}>🗑</button>
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

/* ── ORDERS ── */
function AOrders({orders,setOrders,showT}){
  const[f,setF]=useState("Tous");
  const fl=f==="Tous"?orders:orders.filter(o=>o.status===f);
  const upd=(id,st)=>{setOrders(prev=>prev.map(o=>o.id===id?{...o,status:st}:o));showT(`Statut → ${st}`);
    const ord=orders.find(o=>o.id===id); if(ord?.fireId) updateOrderStatus(ord.fireId,st).catch(()=>{});};
  return(
    <>
      <div className="atl">Commandes</div>
      <div className="asl">Validez et suivez toutes les commandes</div>
      <div className="cts" style={{marginBottom:14}}>{["Tous",...STATUSES].map(s=><button key={s} className={`cb${f===s?" on":""}`} onClick={()=>setF(s)}>{s}</button>)}</div>
      <div className="tw">
        <div className="tb2"><span style={{fontWeight:600}}>📋 {fl.length} commande(s)</span></div>
        <table><thead><tr><th>ID</th><th>Client</th><th>Tel</th><th>Produit</th><th>Montant</th><th>Lieu</th><th>Statut</th><th>Modifier</th></tr></thead>
          <tbody>
            {fl.length===0&&<tr><td colSpan={8} style={{textAlign:"center",color:"var(--mt)",padding:20}}>Aucune commande.</td></tr>}
            {fl.map(o=>(
              <tr key={o.id}>
                <td style={{color:"var(--g)",fontWeight:700,fontSize:10}}>{o.id}</td>
                <td style={{fontWeight:600}}>{o.client}</td>
                <td style={{color:"var(--mt)",fontSize:11}}>{o.phone}</td>
                <td style={{color:"var(--mt)",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.product}</td>
                <td style={{fontWeight:700}}>{fmt(o.amount)}</td>
                <td style={{color:"var(--mt)",fontSize:11}}>{o.lieu}</td>
                <td><SBadge status={o.status}/></td>
                <td>
                  <select className="fi" style={{padding:"4px 7px",fontSize:11,width:"auto"}} value={o.status} onChange={e=>upd(o.id,e.target.value)}>
                    {STATUSES.map(s=><option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── STOCK ── */
function AStock({products,setProducts,showT}){
  const low=products.filter(p=>p.stock<5);
  const upd=(id,v)=>{const n=parseInt(v);if(isNaN(n)||n<0)return;setProducts(prev=>prev.map(p=>p.id===id?{...p,stock:n}:p));showT("Stock mis à jour !");};
  return(
    <>
      <div className="atl">Gestion Stock</div>
      <div className="asl">Mettez à jour les stocks en temps réel</div>
      {low.length>0&&<div className="alrt err">⚠️ {low.length} produit(s) en stock bas : {low.map(p=>p.name).join(", ")}</div>}
      <div className="tw">
        <table><thead><tr><th>Produit</th><th>Catégorie</th><th>Stock</th><th>Statut</th><th>Modifier</th></tr></thead>
          <tbody>{products.map(p=>(
            <tr key={p.id}>
              <td><div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:16}}>{p.img}</span><span style={{fontWeight:600,fontSize:12}}>{p.name}</span></div></td>
              <td><span className="sbg s-c" style={{fontSize:9}}>{p.cat}</span></td>
              <td><span style={{fontWeight:700,fontSize:14,color:p.stock===0?"var(--rd)":p.stock<5?"var(--or)":"var(--gn)"}}>{p.stock}</span></td>
              <td><span className={`sbg ${p.stock===0?"s-x":p.stock<5?"s-a":"s-l"}`}>● {p.stock===0?"Rupture":p.stock<5?"Stock bas":"En stock"}</span></td>
              <td><div style={{display:"flex",alignItems:"center",gap:5}}><input type="number" className="fi" style={{width:70,padding:"4px 8px",fontSize:12}} defaultValue={p.stock} onBlur={e=>upd(p.id,e.target.value)} min="0"/><span style={{fontSize:10,color:"var(--mt)"}}>unités</span></div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}

/* ── STATS ── */
function AStats({products,orders}){
  const dlv=orders.filter(o=>o.status==="Livré");
  const rev=dlv.reduce((s,o)=>s+o.amount,0);
  const avg=dlv.length>0?Math.round(rev/dlv.length):0;
  const catD=CATS.filter(c=>c!=="Tous").map(cat=>({cat,n:orders.filter(o=>{const p=products.find(x=>x.name===o.product);return p?.cat===cat;}).length})).sort((a,b)=>b.n-a.n);
  const mx=Math.max(...catD.map(c=>c.n),1);
  const cols=["var(--bl)","var(--g)","var(--gn)","var(--or)","var(--rd)"];
  return(
    <>
      <div className="atl">Statistiques</div>
      <div className="asl">Performance de la boutique</div>
      <div className="sg">
        {[{icon:"💰",lbl:"Revenus livrés",val:fmt(rev),tr:`${dlv.length} commandes`},{icon:"🛒",lbl:"Total commandes",val:orders.length,tr:`${orders.filter(o=>o.status==="En attente").length} en attente`},{icon:"💸",lbl:"Panier moyen",val:fmt(avg),tr:"Sur livrées"},{icon:"📦",lbl:"Produits",val:products.length,tr:`${products.filter(p=>p.stock>0).length} en stock`}].map((s,i)=>(
          <div key={i} className="sc"><div className="si2">{s.icon}</div><div className="slbl">{s.lbl}</div><div className="sv" style={{fontSize:"clamp(14px,3.5vw,20px)"}}>{s.val}</div><div className="str">{s.tr}</div></div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(280px,100%),1fr))",gap:14}}>
        <div className="tw" style={{padding:16}}>
          <div style={{fontWeight:700,marginBottom:14}}>📊 Ventes par catégorie</div>
          {catD.map((s,i)=>(
            <div key={i} className="br2">
              <span style={{fontSize:11,color:"var(--mt)",minWidth:80}}>{s.cat}</span>
              <div className="brk"><div className="brf" style={{width:`${(s.n/mx)*100}%`,background:cols[i]}}/></div>
              <span style={{fontSize:11,fontWeight:700,color:cols[i],minWidth:24,textAlign:"right"}}>{s.n}</span>
            </div>
          ))}
        </div>
        <div className="tw" style={{padding:16}}>
          <div style={{fontWeight:700,marginBottom:14}}>📋 Statuts commandes</div>
          {STATUSES.map(s=>(
            <div key={s} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid var(--br)"}}>
              <SBadge status={s}/><span style={{fontWeight:700,fontSize:15}}>{orders.filter(o=>o.status===s).length}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── REVIEWS ── */
function AReviews({showT}){
  const[revs,setRevs]=useState([
    {id:1,av:"K",name:"Konan Beatrice",date:"15 Mars 2025",r:5,txt:"Commande reçue en 24h ! Produit magnifique. Je recommande !",st:"approuvé"},
    {id:2,av:"T",name:"Traoré Ibrahim",date:"10 Mars 2025",r:5,txt:"iPhone 15 livré le lendemain. Authentique avec facture. Merci !",st:"approuvé"},
    {id:3,av:"C",name:"Coulibaly Aminata",date:"05 Mars 2025",r:4,txt:"Boubou splendide. Service après-vente très arrangeant. Je reviendrai !",st:"en attente"},
  ]);
  return(
    <>
      <div className="atl">Avis Clients</div>
      <div className="asl">Modérez les avis publiés</div>
      <div className="rg">{revs.map(rv=>(
        <div key={rv.id} className="rc">
          <div className="rt"><div className="ra">{rv.av}</div><div><div className="rn">{rv.name}</div><div className="rd">{rv.date}</div></div></div>
          <div className="rs">{star(rv.r)}</div><p className="rx">{rv.txt}</p>
          <div style={{marginTop:11,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
            <span className={`sbg ${rv.st==="approuvé"?"s-l":"s-a"}`}>● {rv.st}</span>
            <div style={{display:"flex",gap:5}}>
              <button className="ab ok" onClick={()=>{setRevs(p=>p.map(x=>x.id===rv.id?{...x,st:"approuvé"}:x));showT("Avis approuvé");}}>✓ Approuver</button>
              <button className="ab dl" onClick={()=>{setRevs(p=>p.filter(x=>x.id!==rv.id));showT("Avis supprimé");}}>✕ Suppr.</button>
            </div>
          </div>
        </div>
      ))}</div>
    </>
  );
}

/* ── ADMINS ── */
function AAdmins({showT}){
  const[adms,setAdms]=useState([
    {id:"Bilalboss1",name:"Bilal",  role:"superadmin",st:"actif",last:"Aujourd'hui"},
    {id:"Admin1",    name:"Admin 1",role:"admin",      st:"actif",last:"Hier"},
    {id:"Admin2",    name:"Admin 2",role:"admin",      st:"actif",last:"22/03/2025"},
  ]);
  const[sf,setSF]=useState(false);
  const[na,setNA]=useState({id:"",name:"",pw:"",role:"admin"});
  const P_SUPER=["Gérer tous les produits","Gérer toutes les commandes","Gérer les admins","Statistiques complètes","Configurer le site","Gérer paiements","Sécurité","Sauvegardes"];
  const P_ADMIN=["Ajouter/modifier produits","Gérer les commandes","Mettre à jour stock","Répondre aux clients"];
  return(
    <>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div><div className="atl">Gestion des Admins</div><div className="asl" style={{marginBottom:0}}>Créez et gérez les comptes</div></div>
        <button className="bg" onClick={()=>setSF(f=>!f)}>{sf?"✕ Annuler":"+ Créer un admin"}</button>
      </div>
      {sf&&(
        <div className="tw" style={{padding:16,marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:13}}>✚ Nouveau compte admin</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(180px,100%),1fr))",gap:9}}>
            <div className="fg2"><label className="fl">Nom complet</label><input className="fi" value={na.name} onChange={e=>setNA({...na,name:e.target.value})} placeholder="Ex : Marie Konan"/></div>
            <div className="fg2"><label className="fl">Identifiant (ID)</label><input className="fi" value={na.id} onChange={e=>setNA({...na,id:e.target.value})} placeholder="Ex : Admin3"/></div>
            <div className="fg2"><label className="fl">Mot de passe</label><input className="fi" type="password" value={na.pw} onChange={e=>setNA({...na,pw:e.target.value})} placeholder="Minimum 8 caractères"/></div>
            <div className="fg2"><label className="fl">Rôle</label>
              <select className="fi" value={na.role} onChange={e=>setNA({...na,role:e.target.value})}>
                <option value="admin">Admin</option><option value="superadmin">Super Admin</option>
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:11}}>
            <button className="bg" onClick={()=>{if(!na.name||!na.id||!na.pw){showT("Remplissez tous les champs !",true);return;}setAdms(p=>[...p,{...na,st:"actif",last:"Jamais"}]);setNA({id:"",name:"",pw:"",role:"admin"});setSF(false);showT("Compte créé !");}}>✅ Créer</button>
            <button className="bo" style={{padding:"9px 14px"}} onClick={()=>setSF(false)}>Annuler</button>
          </div>
        </div>
      )}
      <div className="tw" style={{marginBottom:16}}>
        <table><thead><tr><th>Nom</th><th>ID</th><th>Rôle</th><th>Statut</th><th>Dernière co.</th><th>Actions</th></tr></thead>
          <tbody>{adms.map((a,i)=>(
            <tr key={i}>
              <td style={{fontWeight:600}}>{a.name}</td>
              <td style={{fontFamily:"monospace",fontSize:11,color:"var(--mt)"}}>{a.id}</td>
              <td><span className={`sbg ${a.role==="superadmin"?"s-s":"s-d"}`}>{a.role==="superadmin"?"👑 Super Admin":"🔧 Admin"}</span></td>
              <td><span className={`sbg ${a.st==="actif"?"s-l":"s-x"}`}>● {a.st}</span></td>
              <td style={{color:"var(--mt)",fontSize:11}}>{a.last}</td>
              <td>
                {a.role!=="superadmin"?(
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    <button className="ab ok" onClick={()=>{setAdms(p=>p.map(x=>x.id===a.id?{...x,st:x.st==="actif"?"bloqué":"actif"}:x));showT(a.st==="actif"?"Compte bloqué":"Compte activé");}}>{a.st==="actif"?"🔒 Bloquer":"✅ Activer"}</button>
                    <button className="ab dl" onClick={()=>{setAdms(p=>p.filter(x=>x.id!==a.id));showT("Compte supprimé");}}>🗑</button>
                  </div>
                ):<span style={{fontSize:10,color:"var(--mt)"}}>Protégé</span>}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(250px,100%),1fr))",gap:12}}>
        {[{role:"Super Admin",icon:"👑",perms:P_SUPER,col:"var(--g)"},{role:"Admin",icon:"🔧",perms:P_ADMIN,col:"var(--bl)"}].map((rr,i)=>(
          <div key={i} className="tw" style={{padding:14}}>
            <div style={{fontWeight:700,marginBottom:12,color:rr.col}}>{rr.icon} Permissions — {rr.role}</div>
            <div className="prg">{rr.perms.map((pp,j)=><div key={j} className="pri"><span style={{color:"var(--gn)"}}>✓</span><span>{pp}</span></div>)}</div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── SETTINGS ── */
function ASettings({showT}){
  const[s,setS]=useState({nom:"Baark Wendé Store",devise:"FCFA",tel1:"0170260670",tel2:"+225 0787213203",loc:"Côte d'Ivoire",fb:"Baark Wendé Store",wa:"2250787213203"});
  return(
    <>
      <div className="atl">Paramètres</div>
      <div className="asl">Configurez les informations de la boutique</div>
      <div className="tw" style={{padding:18,marginBottom:14}}>
        <div style={{fontWeight:700,marginBottom:14}}>🏪 Informations boutique</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(200px,100%),1fr))",gap:10}}>
          {[["Nom","nom"],["Devise","devise"],["Téléphone 1","tel1"],["Téléphone 2","tel2"],["Localisation","loc"],["Page Facebook","fb"],["WhatsApp (numéro)","wa"]].map(([l,k])=>(
            <div key={k} className="fg2"><label className="fl">{l}</label><input className="fi" value={s[k]} onChange={e=>setS({...s,[k]:e.target.value})}/></div>
          ))}
        </div>
        <button className="bg" style={{marginTop:14,padding:"10px 22px"}} onClick={()=>showT("Paramètres sauvegardés !")}>💾 Sauvegarder</button>
      </div>
      <div className="tw" style={{padding:16}}>
        <div style={{fontWeight:700,marginBottom:12}}>💾 Sauvegardes</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["📦 Produits","Produits exportés !"],["🛒 Commandes","Commandes exportées !"],["🔄 Tout sauvegarder","Sauvegarde complète !"]].map(([l,m])=>(
            <button key={l} className="bo" style={{padding:"9px 14px",fontSize:12}} onClick={()=>showT(m)}>{l}</button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── SECURITY ── */
function ASecurity({showT}){
  const logs=[
    {time:"Aujourd'hui 14:32",user:"Bilal (Super Admin)",action:"Connexion réussie",ip:"192.168.1.1"},
    {time:"Aujourd'hui 11:15",user:"Admin 1",action:"Produit ajouté",ip:"192.168.1.2"},
    {time:"Hier 16:44",user:"Admin 2",action:"Commande validée",ip:"192.168.1.3"},
    {time:"Hier 09:20",user:"Inconnu",action:"⚠️ Tentative échouée",ip:"105.112.32.4"},
    {time:"22/03 13:00",user:"Admin 1",action:"Stock mis à jour",ip:"192.168.1.2"},
  ];
  return(
    <>
      <div className="atl">Sécurité</div>
      <div className="asl">Surveillez les activités de la plateforme</div>
      <div className="sg">
        {[{icon:"✅",lbl:"Connexions réussies",val:4,tr:"Dernières 24h"},{icon:"🔴",lbl:"Tentatives échouées",val:1,tr:"À surveiller"},{icon:"👥",lbl:"Admins actifs",val:3,tr:"En ligne"},{icon:"🔒",lbl:"Sécurité",val:"Élevé",tr:"✅ Bon état"}].map((s,i)=>(
          <div key={i} className="sc"><div className="si2">{s.icon}</div><div className="slbl">{s.lbl}</div><div className="sv" style={{fontSize:18}}>{s.val}</div><div className="str">{s.tr}</div></div>
        ))}
      </div>
      <div className="tw" style={{marginBottom:14}}>
        <div className="tb2"><span style={{fontWeight:600}}>📋 Journal d'activités</span></div>
        <table><thead><tr><th>Heure</th><th>Utilisateur</th><th>Action</th><th>IP</th></tr></thead>
          <tbody>{logs.map((l,i)=>(
            <tr key={i}>
              <td style={{color:"var(--mt)",fontSize:10}}>{l.time}</td>
              <td style={{fontWeight:600}}>{l.user}</td>
              <td style={{color:l.action.includes("⚠️")?"var(--rd)":"var(--mt)"}}>{l.action}</td>
              <td style={{fontFamily:"monospace",fontSize:10,color:"var(--mt)"}}>{l.ip}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="tw" style={{padding:16}}>
        <div style={{fontWeight:700,marginBottom:11}}>🔒 Actions</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["🔄 Changer MDP","Redirection..."],["📧 Alertes email","Alertes activées !"],["🗄️ Purger logs","Logs purgés !"]].map(([l,m])=>(
            <button key={l} className="bo" style={{padding:"9px 13px",fontSize:12}} onClick={()=>showT(m)}>{l}</button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   ROOT
═══════════════════════════════════════════ */
export default function App(){
  const[view,setView]=useState("client");
  const[user,setUser]=useState(null);
  const[products,setProducts]=useState(INIT_PRODS);
  const[orders,setOrders]=useState(INIT_ORDERS);
  const[reviews,setReviews]=useState([]);
  const[fbReady,setFbReady]=useState(false);

  useEffect(()=>{
    // Écoute en temps réel Firebase
    const unsubProds = listenProducts(data=>{
      setProducts(data.length>0 ? data : INIT_PRODS);
      setFbReady(true);
    });
    const unsubOrders = listenOrders(data=>{
      setOrders(data.length>0 ? data : INIT_ORDERS);
    });
    const unsubRevs = listenReviews(data=>{
      setReviews(data);
    });
    return()=>{ unsubProds(); unsubOrders(); unsubRevs(); };
  },[]);

  return(
    <>
      <StyleTag/>
      {!fbReady && (
        <div style={{position:"fixed",inset:0,background:"var(--bk)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,flexDirection:"column",gap:16}}>
          <div style={{width:48,height:48,border:"3px solid var(--br)",borderTop:"3px solid var(--g)",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
          <div style={{color:"var(--mt)",fontSize:13}}>Connexion à la base de données...</div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
      {view==="client"&&<ClientApp products={products} orders={orders} setOrders={setOrders} onAdmin={()=>setView("login")}/>}
      {view==="login" &&<Login onLogin={u=>{setUser(u);setView("admin");}}/>}
      {view==="admin" &&user&&<AdminApp user={user} onLogout={()=>{setUser(null);setView("client");}} products={products} setProducts={setProducts} orders={orders} setOrders={setOrders} reviews={reviews} setReviews={setReviews}/>}
    </>
  );
}
